import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export type Comment = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id: string | null;
  author: {
    username: string;
    avatar_url?: string;
  };
};

export function useComments(requestId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles!inner(username, avatar_url)
        `,
        )
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      const formattedComments = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        user_id: comment.user_id,
        created_at: comment.created_at,
        parent_id: comment.parent_id,
        author: {
          username: comment.profiles?.username || comment.user_id,
          avatar_url:
            comment.profiles?.avatar_url ||
            `https://dummyimage.com/150/${Math.floor(Math.random() * 16777215).toString(16)}/ffffff&text=${comment.profiles?.username?.[0]?.toUpperCase() || "A"}`,
        },
      }));

      setComments(formattedComments);
      setLoading(false);
    };

    fetchComments();

    const channel = supabase
      .channel(`comments-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `request_id=eq.${requestId}`,
        },
        fetchComments,
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [requestId]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) throw new Error("Must be logged in");

    // Check if the parent comment exists and is not already a reply
    if (parentId) {
      const parentComment = comments.find((c) => c.id === parentId);
      if (!parentComment || parentComment.parent_id) {
        throw new Error("Can only reply to top-level comments");
      }
    }

    // First check if user has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username: user.email?.split("@")[0] || "Anonymous",
          avatar_url: `https://dummyimage.com/150/${Math.floor(
            Math.random() * 16777215,
          ).toString(16)}/ffffff&text=${user.email?.[0]?.toUpperCase() || "A"}`,
        },
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }
    }

    const { error } = await supabase.from("comments").insert([
      {
        content,
        user_id: user.id,
        request_id: requestId,
        parent_id: parentId || null,
      },
    ]);

    if (error) throw error;
  };

  // Organize comments into threads
  const threadedComments = comments
    .filter((comment) => !comment.parent_id) // Get top-level comments
    .map((comment) => ({
      ...comment,
      timestamp: new Date(comment.created_at).toLocaleString(),
      replies: comments
        .filter((reply) => reply.parent_id === comment.id)
        .map((reply) => ({
          ...reply,
          timestamp: new Date(reply.created_at).toLocaleString(),
        })),
    }));

  return {
    comments: threadedComments,
    loading,
    addComment,
  };
}

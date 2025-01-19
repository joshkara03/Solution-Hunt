import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export type Comment = {
  comment_id: string;
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
          comment_id,
          content,
          user_id,
          created_at,
          parent_id,
          request_id,
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
        comment_id: comment.comment_id,
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

    // Subscribe to new comments
    const commentsSubscription = supabase
      .channel("comments_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [requestId]);

  const addComment = async (content: string, parentId: string | null = null) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("comments").insert([
        {
          content,
          user_id: user.id,
          request_id: requestId,
          parent_id: parentId,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .match({ comment_id: commentId, user_id: user.id });

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content })
        .match({ comment_id: commentId, user_id: user.id });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    updateComment,
  };
}
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

  const fetchComments = async () => {
    try {
      console.log("Fetching comments for request:", requestId);
      const { data, error } = await supabase
        .from("comments")
        .select(`
          comment_id,
          content,
          user_id,
          created_at,
          parent_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      console.log("Raw comments data:", data);

      const formattedComments = data.map((comment: any) => {
        console.log("Processing comment:", comment);
        return {
          comment_id: comment.comment_id,
          content: comment.content,
          user_id: comment.user_id,
          created_at: comment.created_at,
          parent_id: comment.parent_id,
          author: {
            username: comment.profiles?.username || "Anonymous",
            avatar_url: comment.profiles?.avatar_url,
          },
        };
      });

      console.log("Formatted comments:", formattedComments);
      setComments(formattedComments);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchComments:", error);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchComments();

      const commentsChannel = supabase
        .channel("comments")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
            filter: `request_id=eq.${requestId}`,
          },
          (payload) => {
            console.log("Comments changed, payload:", payload);
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        commentsChannel.unsubscribe();
      };
    }
  }, [requestId]);

  const postComment = async (content: string) => {
    if (!user || !content.trim()) {
      throw new Error("Must be logged in to comment");
    }

    try {
      console.log("Posting comment:", {
        content,
        user_id: user.id,
        request_id: requestId,
      });

      const { data, error } = await supabase.from("comments").insert([
        {
          content: content,
          user_id: user.id,
          request_id: requestId,
        },
      ]).select();

      if (error) throw error;

      console.log("Posted comment response:", data);
      // Fetch updated comments
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    postComment,
  };
}
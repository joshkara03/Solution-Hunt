import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export type ProductRequest = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
  vote_count?: number;
  comment_count?: number;
  user_vote?: "up" | "down" | null;
  author?: {
    username: string;
    avatar_url?: string;
  };
};

export function useProductRequests(
  sortBy: "votes" | "newest" | "discussed" = "votes",
) {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      let query = supabase
        .from("product_requests")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url),
          votes (vote_type, user_id),
          comments (count)
        `,
        )
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching requests:", error);
        return;
      }

      const formattedRequests = data.map((request: any) => {
        const voteCount =
          request.votes?.reduce(
            (acc: number, vote: any) =>
              acc + (vote.vote_type === "up" ? 1 : -1),
            0,
          ) || 0;

        // Find the user's vote if they're logged in
        const userVote = user
          ? request.votes?.find((vote: any) => vote.user_id === user.id)
          : null;

        const commentCount = request.comments?.[0]?.count || 0;

        return {
          id: request.id,
          title: request.title,
          description: request.description,
          created_at: request.created_at,
          tags: request.tags || [],
          vote_count: voteCount,
          comment_count: commentCount,
          author: request.profiles,
          user_vote: userVote?.vote_type || null,
        };
      });

      // Sort the requests based on the selected criteria
      const sortedRequests = [...formattedRequests].sort((a, b) => {
        if (sortBy === "votes") {
          return (b.vote_count || 0) - (a.vote_count || 0);
        } else if (sortBy === "newest") {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } else if (sortBy === "discussed") {
          return (b.comment_count || 0) - (a.comment_count || 0);
        }
        return 0;
      });

      setRequests(sortedRequests);
      setLoading(false);
    };

    fetchRequests();

    // Subscribe to changes
    const channel = supabase
      .channel("product_requests_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "product_requests" },
        () => fetchRequests(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "product_requests" },
        () => fetchRequests(),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "product_requests" },
        () => fetchRequests(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => fetchRequests(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchRequests(),
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sortBy, user?.id]);

  const addRequest = async (data: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    if (!user) {
      throw new Error("Must be logged in to create a request");
    }

    // First ensure the user has a profile
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

    // Create the request
    const { error } = await supabase.from("product_requests").insert([
      {
        title: data.title,
        description: data.description,
        tags: data.tags,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error creating request:", error);
      throw error;
    }
  };

  const vote = async (requestId: string, voteType: "up" | "down") => {
    if (!user) {
      throw new Error("Must be logged in to vote");
    }

    try {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select()
        .eq("request_id", requestId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // If voting the same way, remove the vote
          await supabase
            .from("votes")
            .delete()
            .eq("request_id", requestId)
            .eq("user_id", user.id);
        } else {
          // If voting differently, update the vote
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("request_id", requestId)
            .eq("user_id", user.id);
        }
      } else {
        // If no existing vote, insert new vote
        await supabase.from("votes").insert([
          {
            request_id: requestId,
            user_id: user.id,
            vote_type: voteType,
          },
        ]);
      }
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    }
  };

  return {
    requests,
    loading,
    addRequest,
    vote,
  };
}

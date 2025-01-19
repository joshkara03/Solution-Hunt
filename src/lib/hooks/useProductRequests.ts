import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export type ProductRequest = {
  request_id: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
  user_id: string;
  vote_count?: number;
  comment_count?: number;
  user_vote?: "up" | "down" | null;
  author?: {
    username: string;
    avatar_url?: string;
  };
  comments?: {
    comment_id: string;
    content: string;
    created_at: string;
    author: {
      username: string;
      avatar_url?: string;
    };
  }[];
};

type Profile = {
  username: string;
  avatar_url?: string;
};

type Vote = {
  vote_id: string;
  vote_type: "up" | "down";
  user_id: string;
};

type Comment = {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: Profile;
};

type ProductRequestRaw = {
  request_id: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
  user_id: string;
  profiles?: Profile;
  votes?: Vote[];
  comments?: Comment[];
};

export type TimeFilter = "all_time" | "this_week";
export type SortBy = "votes" | "newest";

export function useProductRequests(timeFilter: TimeFilter = "all_time", sortBy: SortBy = "votes") {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("product_requests")
        .select(`
          request_id,
          title,
          description,
          created_at,
          tags,
          user_id,
          profiles!user_id (
            username,
            avatar_url
          ),
          votes (
            vote_id,
            vote_type,
            user_id
          ),
          comments (
            comment_id,
            content,
            created_at,
            user_id,
            profiles!user_id (
              username,
              avatar_url
            )
          )
        `);

      // Apply time filter
      if (timeFilter === "this_week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('created_at', oneWeekAgo.toISOString());
      }

      // Apply sorting
      if (sortBy === "votes") {
        // We'll sort by votes after fetching since we need to calculate the vote count
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching requests:", fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedRequests = (data as ProductRequestRaw[] || []).map((request) => {
        const voteCount =
          request.votes?.reduce(
            (acc, vote) =>
              vote.vote_type === "up" ? acc + 1 : acc - 1,
            0
          ) || 0;

        const userVote = user
          ? request.votes?.find((v) => v.user_id === user.id)?.vote_type || null
          : null;

        return {
          request_id: request.request_id,
          title: request.title,
          description: request.description,
          created_at: request.created_at,
          tags: request.tags || [],
          user_id: request.user_id,
          vote_count: voteCount,
          user_vote: userVote,
          author: {
            username: request.profiles?.username || "Anonymous",
            avatar_url: request.profiles?.avatar_url,
          },
          comment_count: request.comments?.length || 0,
          comments:
            request.comments?.map((comment) => ({
              comment_id: comment.comment_id,
              content: comment.content,
              created_at: comment.created_at,
              author: {
                username: comment.profiles?.username || "Anonymous",
                avatar_url: comment.profiles?.avatar_url,
              },
            })) || [],
        };
      });

      // Sort by votes if needed
      if (sortBy === "votes") {
        formattedRequests.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      }

      setRequests(formattedRequests);
    } catch (err) {
      console.error("Unexpected error in fetchRequests:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
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
        .select("vote_id, vote_type")
        .eq("request_id", requestId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          await supabase
            .from("votes")
            .delete()
            .eq("vote_id", existingVote.vote_id);
        } else {
          // Change vote if clicking different button
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("vote_id", existingVote.vote_id);
        }
      } else {
        // Create new vote
        await supabase.from("votes").insert([
          {
            request_id: requestId,
            user_id: user.id,
            vote_type: voteType,
          },
        ]);
      }
    } catch (err) {
      console.error("Error voting:", err);
      throw err;
    }
  };

  const createRequest = async (data: { title: string; description: string; tags: string[] }) => {
    if (!user) {
      throw new Error("Must be logged in to create a request");
    }

    try {
      const { error } = await supabase.from("product_requests").insert([
        {
          title: data.title,
          description: data.description,
          tags: data.tags,
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (err) {
      console.error("Error creating request:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRequests();

    // Create a channel for each table we want to listen to
    const requestsChannel = supabase
      .channel("product_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_requests" },
        () => {
          console.log("Product requests changed");
          fetchRequests();
        }
      )
      .subscribe();

    const votesChannel = supabase
      .channel("votes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => {
          console.log("Votes changed");
          fetchRequests();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          console.log("Comments changed");
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      requestsChannel.unsubscribe();
      votesChannel.unsubscribe();
      commentsChannel.unsubscribe();
    };
  }, [user, timeFilter, sortBy]);

  return {
    requests,
    loading,
    error,
    vote,
    createRequest,
  };
}

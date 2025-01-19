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
  comments?: {
    id: string;
    content: string;
    created_at: string;
    author: {
      username: string;
      avatar_url?: string;
    };
  }[];
};

// Changed local-based function to use UTC logic.
function getMondayUTC(date: Date): Date {
  const newDate = new Date(date);
  const day = newDate.getUTCDay() === 0 ? 7 : newDate.getUTCDay();
  // Move "day - 1" days backward, so we land on Monday at 00:00 UTC.
  newDate.setUTCDate(newDate.getUTCDate() - (day - 1));
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}

// Returns the start (Monday 00:00 UTC) and end (Sunday 23:59:59 UTC) of the desired week.
function getWeekRangeUTC(weekOffset: number) {
  const todayUTC = new Date();
  const monday = getMondayUTC(todayUTC);
  monday.setUTCDate(monday.getUTCDate() + 7 * weekOffset);
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function useProductRequests(
  sortBy: "votes" | "newest" | "discussed" = "votes",
  weekOffset: number = 0 // 0 = current week, -1 = last week, etc.
) {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Calculate Monday–Sunday window in UTC
      const { start, end } = getWeekRangeUTC(weekOffset);

      // Removed "!inner" on profiles and comments for LEFT JOIN behavior
      const { data, error } = await supabase
        .from("product_requests")
        .select(
          `
            *,
            profiles (username, avatar_url),
            votes (vote_type, user_id),
            comments (
              id,
              request_id,
              content,
              created_at,
              user_id,
              profiles (username, avatar_url)
            )
          `,
          { count: "exact" }
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
        return;
      }

      const formattedRequests = (data || []).map((request: any) => {
        const voteCount =
          request.votes?.reduce(
            (acc: number, vote: any) =>
              vote.vote_type === "up" ? acc + 1 : acc - 1,
            0
          ) || 0;

        // If there's a logged-in user, find their vote
        const userVote = user
          ? request.votes?.find((v: any) => v.user_id === user.id)?.vote_type || null
          : null;

        return {
          ...request,
          vote_count: voteCount,
          user_vote: userVote,
          author: {
            username: request.profiles?.username || "Anonymous",
            avatar_url: request.profiles?.avatar_url,
          },
          comment_count: request.comments?.length || 0,
          comments:
            request.comments?.map((comment: any) => ({
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              author: {
                username: comment.profiles?.username || "Anonymous",
                avatar_url: comment.profiles?.avatar_url,
              },
            })) || [],
        };
      });

      // Sort the results
      const sortedRequests = [...formattedRequests].sort((a, b) => {
        if (sortBy === "votes") {
          return (b.vote_count || 0) - (a.vote_count || 0);
        } else if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === "discussed") {
          return (b.comment_count || 0) - (a.comment_count || 0);
        }
        return 0;
      });

      setRequests(sortedRequests);
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error in fetchRequests:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to changes in product_requests, votes, comments
    const channel = supabase
      .channel("product_requests_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "product_requests" },
        fetchRequests
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "product_requests" },
        fetchRequests
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "product_requests" },
        fetchRequests
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        fetchRequests
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        fetchRequests
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sortBy, weekOffset, user?.id]);

  const addRequest = async (data: { title: string; description: string; tags: string[] }) => {
    if (!user) {
      throw new Error("Must be logged in to create a request");
    }

    // Ensure user has a profile
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
            Math.random() * 16777215
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
          // If the vote is the same, remove it
          await supabase
            .from("votes")
            .delete()
            .eq("request_id", requestId)
            .eq("user_id", user.id);
        } else {
          // Otherwise update the vote
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("request_id", requestId)
            .eq("user_id", user.id);
        }
      } else {
        // Insert a new vote
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

  const postComment = async (requestId: string, content: string) => {
    if (!user) {
      throw new Error("Must be logged in to comment");
    }
    try {
      const { error } = await supabase.from("comments").insert([
        {
          request_id: requestId,
          user_id: user.id,
          content,
        },
      ]);
      if (error) {
        console.error("Error posting comment:", error);
        throw error;
      }
    } catch (err) {
      console.error("Comment posting failed:", err);
      throw err;
    }
  };

  return {
    requests,
    loading,
    addRequest,
    vote,
    postComment,
  };
}

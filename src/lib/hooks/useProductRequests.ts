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

export function useProductRequests(
  sortBy: "votes" | "newest" | "discussed" = "votes",
  weekOffset: number = 0, // 0 for current week, -1 for last week
) {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Calculate the date range for the specified week
        const now = new Date('2024-12-15T19:18:35-05:00'); // Use the provided reference time
        
        // Find the most recent Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Adjust for week offset
        if (weekOffset !== 0) {
          startOfWeek.setDate(startOfWeek.getDate() + (7 * weekOffset));
        }
        
        // Set end of week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        console.log(`Fetching requests for week: 
          Reference Date: ${now.toISOString()}
          Week Start: ${startOfWeek.toISOString()}
          Week End: ${endOfWeek.toISOString()}
          Week Offset: ${weekOffset}`);

        let query = supabase
          .from("product_requests")
          .select(
            `
            *,
            profiles!inner (username, avatar_url),
            votes (vote_type, user_id),
            comments!inner (
              id,
              request_id,
              content,
              created_at,
              user_id,
              profiles!inner (username, avatar_url)
            )
          `,
            { count: 'exact' }
          )
          .gte('created_at', startOfWeek.toISOString())
          .lte('created_at', endOfWeek.toISOString())
          .order("created_at", { ascending: false });

        console.log('Supabase Query:', query);

        const { data, error, count } = await query;

        console.log('Supabase Response:', { data, error, count });

        if (error) {
          console.error("Error fetching requests:", error);
          setLoading(false);
          return;
        }

        const formattedRequests = data.map((request: any) => {
          const voteCount =
            request.votes?.reduce(
              (acc: number, vote: any) => 
                vote.vote_type === 'up' ? acc + 1 : acc - 1, 
              0
            ) || 0;

          // Find the user's vote if they're logged in
          const userVote = user
            ? request.votes?.find((vote: any) => vote.user_id === user.id)?.vote_type || null
            : null;

          return {
            ...request,
            vote_count: voteCount,
            user_vote: userVote,
            author: {
              username: request.profiles?.username || 'Anonymous',
              avatar_url: request.profiles?.avatar_url
            },
            comment_count: request.comments?.length || 0,
            comments: request.comments?.map(comment => ({
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              author: {
                username: comment.profiles?.username || 'Anonymous',
                avatar_url: comment.profiles?.avatar_url
              }
            })) || []
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

        console.log('Sorted Requests:', sortedRequests);

        setRequests(sortedRequests);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in fetchRequests:', err);
        setLoading(false);
      }
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
  }, [sortBy, weekOffset, user?.id]);

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

  const postComment = async (requestId: string, content: string) => {
    if (!user) {
      throw new Error("Must be logged in to comment");
    }

    try {
      const { error } = await supabase.from("comments").insert([
        {
          request_id: requestId,
          user_id: user.id,
          content: content,
        },
      ]);

      if (error) {
        console.error("Error posting comment:", error);
        throw error;
      }

      // Refetch requests to update the comments
      await fetchRequests();
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

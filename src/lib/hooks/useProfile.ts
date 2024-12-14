import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        fetchProfile,
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const updateProfile = async (updates: {
    username?: string;
    avatar_url?: string;
  }) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase.from("profiles").upsert([
      {
        id: user.id,
        ...updates,
      },
    ]);

    if (error) throw error;
  };

  return {
    profile,
    loading,
    updateProfile,
  };
}

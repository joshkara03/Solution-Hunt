import { useState, useEffect } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  onSuccess?: () => void;
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { profile, updateProfile } = useProfile();
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateProfile({
        username,
        avatar_url: avatarUrl,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateRandomAvatar = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    const initial = username?.[0]?.toUpperCase() || "A";
    setAvatarUrl(`https://dummyimage.com/150/${color}/ffffff&text=${initial}`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <div className="flex gap-2">
            <Input
              id="avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateRandomAvatar}
            >
              Random
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full">
          Save Profile
        </Button>
      </form>
    </div>
  );
}

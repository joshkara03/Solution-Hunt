import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/lib/hooks/useProfile";

interface HeaderProps {
  onShowAuth: () => void;
  onShowProfile: () => void;
}

export function Header({ onShowAuth, onShowProfile }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="w-full border-b bg-background">
      <div className="max-w-4xl mx-auto py-4 px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Board</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url}
                      alt={profile?.username}
                    />
                    <AvatarFallback>
                      {profile?.username?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShowProfile}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onShowAuth}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { useProductRequests } from "@/lib/hooks/useProductRequests";
import { useAuth } from "@/lib/auth";
import { Header } from "./Header";
import SortControls from "./ProductBoard/SortControls";
import ProductCard from "./ProductBoard/ProductCard";
import NewRequestButton from "./ProductBoard/NewRequestButton";
import NewRequestModal from "./ProductBoard/NewRequestModal";
import LoginForm from "./auth/LoginForm";
import ProfileForm from "./auth/ProfileForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Home() {
  const [currentSort, setCurrentSort] = React.useState<
    "votes" | "newest" | "discussed"
  >("votes");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const { requests, loading, addRequest, vote } =
    useProductRequests(currentSort);
  const { user } = useAuth();

  const handleSortChange = (sortType: "votes" | "newest" | "discussed") => {
    setCurrentSort(sortType);
  };

  const handleVote = async (requestId: string, direction: "up" | "down") => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      await vote(requestId, direction);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleNewRequest = async (data: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      await addRequest(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <Header
        onShowAuth={() => setShowAuthDialog(true)}
        onShowProfile={() => setShowProfileDialog(true)}
      />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-4">
          <SortControls
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <ProductCard
                  key={request.id}
                  id={request.id}
                  title={request.title}
                  description={request.description}
                  author={{
                    name: request.author?.username || "Anonymous",
                    avatar: request.author?.avatar_url,
                  }}
                  timestamp={new Date(request.created_at).toLocaleString()}
                  tags={request.tags}
                  voteCount={request.vote_count}
                  userVote={request.user_vote}
                  commentCount={request.comment_count}
                  onVote={(direction) => handleVote(request.id, direction)}
                />
              ))}
            </div>
          )}
        </div>

        <NewRequestButton
          onClick={() => {
            if (user) {
              setIsModalOpen(true);
            } else {
              setShowAuthDialog(true);
            }
          }}
        />

        <NewRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewRequest}
        />

        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In / Sign Up</DialogTitle>
            </DialogHeader>
            <LoginForm onSuccess={() => setShowAuthDialog(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <ProfileForm onSuccess={() => setShowProfileDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Home;

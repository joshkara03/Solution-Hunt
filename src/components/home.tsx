import React from "react";
import { useAuth } from "@/lib/auth";
import { useProductRequests } from "@/lib/hooks/useProductRequests";
import SortControls from "./ProductBoard/SortControls";
import ProductCard from "./ProductBoard/ProductCard";
import NewRequestButton from "./ProductBoard/NewRequestButton";
import NewRequestModal from "./ProductBoard/NewRequestModal";
import LoginForm from "./auth/LoginForm";
import { Button } from "./ui/button";

function Home() {
  const { user, signOut } = useAuth();
  const [currentSort, setCurrentSort] = React.useState<
    "votes" | "newest" | "discussed"
  >("votes");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { requests, loading, addRequest, vote } =
    useProductRequests(currentSort);

  const handleSortChange = (sortType: "votes" | "newest" | "discussed") => {
    setCurrentSort(sortType);
  };

  const handleVote = async (requestId: string, direction: "up" | "down") => {
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
    try {
      await addRequest(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Board</h1>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>

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

        <NewRequestButton onClick={() => setIsModalOpen(true)} />
        <NewRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewRequest}
        />
      </div>
    </div>
  );
}

export default Home;

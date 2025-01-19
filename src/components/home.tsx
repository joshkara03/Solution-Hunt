import React from "react";
import { useProductRequests } from "@/lib/hooks/useProductRequests";
import { useAuth } from "@/lib/auth";
import { Header } from "./Header";
import ProductCard from "./ProductBoard/ProductCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewRequestForm from "./ProductBoard/NewRequestForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Home() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const { user } = useAuth();

  // All-time top requests
  const {
    requests: allTimeRequests,
    loading: allTimeLoading,
    error: allTimeError,
    vote: allTimeVote,
    createRequest
  } = useProductRequests("all_time", "votes");

  // This week's top requests
  const {
    requests: weeklyRequests,
    loading: weeklyLoading,
    error: weeklyError,
    vote: weeklyVote
  } = useProductRequests("this_week", "votes");

  const handleVote = async (requestId: string, voteType: "up" | "down", isWeekly: boolean) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      if (isWeekly) {
        await weeklyVote(requestId, voteType);
      } else {
        await allTimeVote(requestId, voteType);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCreateRequest = async (data: { title: string; description: string; tags: string[] }) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      await createRequest(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  if (allTimeLoading && weeklyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (allTimeError || weeklyError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {allTimeError || weeklyError}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Product Requests
          </h1>
          <Button
            onClick={() => {
              if (user) {
                setIsModalOpen(true);
              } else {
                setShowAuthDialog(true);
              }
            }}
            className="hover-lift"
          >
            New Request
          </Button>
        </div>

        <Tabs defaultValue="this_week" className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent">
            <TabsTrigger 
              value="this_week"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
            >
              This Week's Top
            </TabsTrigger>
            <TabsTrigger 
              value="all_time"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
            >
              All Time Top
            </TabsTrigger>
          </TabsList>

          <TabsContent value="this_week" className="space-y-4 animate-fade">
            {weeklyRequests.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No requests this week. Be the first to create one!
              </div>
            ) : (
              <div className="grid gap-4">
                {weeklyRequests.map((request) => (
                  <ProductCard
                    key={request.request_id}
                    request={request}
                    onVote={(voteType) => handleVote(request.request_id, voteType, true)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all_time" className="space-y-4 animate-fade">
            {allTimeRequests.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No requests found. Be the first to create one!
              </div>
            ) : (
              <div className="grid gap-4">
                {allTimeRequests.map((request) => (
                  <ProductCard
                    key={request.request_id}
                    request={request}
                    allowVoting={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">New Product Request</DialogTitle>
            </DialogHeader>
            <NewRequestForm onSubmit={handleCreateRequest} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default Home;

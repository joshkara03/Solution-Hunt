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
import { TagFilter } from "./TagFilter";
import { TagDrawer } from "./TagDrawer";
import { AuthDialog } from "./AuthDialog";

function Home() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
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

  const handleTagSelect = (tag: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filterRequestsByTags = (requests: ProductRequest[]) => {
    if (selectedTags.length === 0) return requests;
    return requests.filter(request => 
      request.tags?.some(tag => selectedTags.includes(tag))
    );
  };

  if (allTimeLoading && weeklyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onShowAuth={() => setShowAuthDialog(true)}
          onShowProfile={() => {/* TODO: Implement profile dialog */}}
        />
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
        <Header 
          onShowAuth={() => setShowAuthDialog(true)}
          onShowProfile={() => {/* TODO: Implement profile dialog */}}
        />
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
      <Header 
        onShowAuth={() => setShowAuthDialog(true)}
        onShowProfile={() => {/* TODO: Implement profile dialog */}}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar with tag filter */}
          <aside className="hidden lg:block w-64 shrink-0">
            <TagFilter
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="lg:hidden">
                  <TagDrawer
                    selectedTags={selectedTags}
                    onTagSelect={handleTagSelect}
                  />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                  Product Requests
                </h1>
              </div>
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
                  onClick={() => {
                    if (!user) {
                      setShowAuthDialog(true);
                    }
                  }}
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
                    {filterRequestsByTags(weeklyRequests).map((request) => (
                      <ProductCard
                        key={request.request_id}
                        request={request}
                        onVote={(voteType) => handleVote(request.request_id, voteType, true)}
                        onShowAuth={() => setShowAuthDialog(true)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all_time" className="space-y-4 animate-fade">
                {!user ? (
                  <div className="text-center text-muted-foreground py-12">
                    Please sign in to view all-time top requests
                  </div>
                ) : allTimeRequests.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    No requests found. Be the first to create one!
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filterRequestsByTags(allTimeRequests).map((request) => (
                      <ProductCard
                        key={request.request_id}
                        request={request}
                        allowVoting={false}
                        onShowAuth={() => setShowAuthDialog(true)}
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
          </div>
        </div>
      </main>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
}

export default Home;

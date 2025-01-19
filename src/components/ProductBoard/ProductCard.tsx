import React from 'react';
import { ProductRequest } from '@/lib/hooks/useProductRequests';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useComments } from '@/lib/hooks/useComments';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  request: ProductRequest;
  onVote?: (voteType: "up" | "down") => void;
  allowVoting?: boolean;
}

export default function ProductCard({ request, onVote, allowVoting = true }: ProductCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { postComment, comments } = useComments(request.request_id);

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setCommentError(null);
      await postComment(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      setCommentError(error instanceof Error ? error.message : "Failed to post comment");
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border/5 shadow-sm">
      <div className="flex items-start gap-4 p-6">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1">
          {allowVoting ? (
            <>
              <button
                onClick={() => onVote?.("up")}
                className={`flex items-center justify-center h-8 w-8 rounded-md ${
                  request.user_vote === "up" ? "upvote-active" : "vote-inactive"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-foreground/80">{request.vote_count || 0}</span>
              <button
                onClick={() => onVote?.("down")}
                className={`flex items-center justify-center h-8 w-8 rounded-md ${
                  request.user_vote === "down" ? "downvote-active" : "vote-inactive"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="text-center">
              <span className="text-lg font-semibold text-foreground/80">{request.vote_count || 0}</span>
              <div className="text-xs text-muted-foreground">votes</div>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{request.title}</h3>
            <p className="text-muted-foreground">{request.description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.author?.avatar_url} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {request.author?.username?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <span>{request.author?.username || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          
          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {request.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments section */}
          <Collapsible
            open={isCommentsOpen}
            onOpenChange={setIsCommentsOpen}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 hover:bg-secondary/50 -mx-2 px-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-muted-foreground">{comments?.length || 0} Comments</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4 animate-fade">
              {/* New comment input */}
              {user ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePostComment();
                        }
                      }}
                      className="bg-secondary border-0"
                    />
                    <Button onClick={handlePostComment}>Post</Button>
                  </div>
                  {commentError && (
                    <div className="text-sm text-destructive">{commentError}</div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-2">
                  Please sign in to comment
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-3">
                {comments?.map((comment) => (
                  <div 
                    key={comment.comment_id} 
                    className="flex gap-3 bg-secondary/50 rounded-lg p-4 animate-fade"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.avatar_url} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {comment.author?.username?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {comment.author?.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-foreground/90 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
                {(!comments || comments.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

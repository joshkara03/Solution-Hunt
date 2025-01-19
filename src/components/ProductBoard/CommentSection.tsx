import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { useComments, Comment } from "@/lib/hooks/useComments";
import { useAuth } from "@/lib/auth";

interface CommentSectionProps {
  requestId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  commentCount?: number;
  onShowAuth?: () => void; 
}

const CommentSection = ({
  requestId,
  isExpanded = false,
  onToggle = () => {},
  commentCount = 0,
  onShowAuth, 
}: CommentSectionProps) => {
  const { comments, loading, postComment } = useComments(requestId);
  const { user } = useAuth();

  const handleSubmitComment = async (content: string) => {
    if (!user) {
      if (onShowAuth) {
        onShowAuth();
      }
      return;
    }

    try {
      await postComment(content);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (!isExpanded) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-2 hover:bg-secondary/50 -mx-2 px-2"
        onClick={onToggle}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-muted-foreground">{commentCount} Comments</span>
      </Button>
    );
  }

  const topLevelComments = comments.filter(comment => !comment.parent_id);

  return (
    <div className="space-y-4">
      {user ? (
        <CommentForm onSubmit={handleSubmitComment} />
      ) : (
        <div className="text-center text-muted-foreground py-2">
          Please sign in to comment
        </div>
      )}
      
      <div className="space-y-6">
        {topLevelComments.map((comment) => (
          <CommentThread
            key={comment.comment_id}
            comment={comment}
            comments={comments}
            onReply={async (parentId, content) => {
              if (!user) {
                if (onShowAuth) {
                  onShowAuth();
                }
                return;
              }
              await postComment(content);
            }}
            onShowAuth={onShowAuth}
          />
        ))}
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CommentSection;

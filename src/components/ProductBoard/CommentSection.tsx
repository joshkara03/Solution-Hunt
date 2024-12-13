import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { useComments } from "@/lib/hooks/useComments";

interface CommentSectionProps {
  requestId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  commentCount?: number;
}

const CommentSection = ({
  requestId,
  isExpanded = false,
  onToggle = () => {},
  commentCount = 0,
}: CommentSectionProps) => {
  const { comments, loading, addComment } = useComments(requestId);

  const handleSubmitComment = async (content: string) => {
    try {
      await addComment(content);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleReplyToComment = async (parentId: string, content: string) => {
    try {
      await addComment(content, parentId);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  return (
    <div className="w-full bg-background border-t mt-4">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-center gap-2 py-2 hover:bg-muted"
        onClick={onToggle}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">
          {isExpanded ? "Hide Comments" : `Show Comments (${commentCount})`}
        </span>
      </Button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <CommentForm
            onSubmit={handleSubmitComment}
            placeholder="What are your thoughts?"
          />
          {loading ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comments={[
                    {
                      id: comment.id,
                      content: comment.content,
                      author: {
                        name: comment.author.username,
                        avatar: comment.author.avatar_url,
                      },
                      timestamp: new Date(comment.created_at).toLocaleString(),
                      replies: comment.replies?.map((reply) => ({
                        id: reply.id,
                        content: reply.content,
                        author: {
                          name: reply.author.username,
                          avatar: reply.author.avatar_url,
                        },
                        timestamp: new Date(reply.created_at).toLocaleString(),
                      })),
                    },
                  ]}
                  onReply={handleReplyToComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

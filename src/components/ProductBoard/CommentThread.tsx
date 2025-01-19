/**
 * CommentThread Component
 * 
 * This component is responsible for rendering a nested comment thread with support for 
 * nested replies, avatar display, and interactive reply functionality.
 * 
 * Key Features:
 * - Recursive rendering of comments and nested replies
 * - Avatar display with fallback initials
 * - Inline reply functionality
 * - Flexible and reusable design
 */
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import CommentForm from "./CommentForm";
import { Comment } from "@/lib/hooks/useComments";

/**
 * CommentThreadProps Interface
 * Defines the props expected by the CommentThread component
 * 
 * @property {Comment} comment - The comment to render
 * @property {Comment[]} comments - The list of comments to display
 * @property {Function} onReply - Callback for handling comment replies
 * @property {Function} [onShowAuth] - Optional callback for showing authentication
 */
interface CommentThreadProps {
  comment: Comment;
  comments: Comment[];
  onReply: (parentId: string, content: string) => void;
  onShowAuth?: () => void;
}

/**
 * CommentThread Component
 * Renders a nested comment thread with interactive reply functionality
 * 
 * @param {CommentThreadProps} props - Component properties
 * @returns {React.ReactElement} Rendered comment thread
 */
const CommentThread = ({
  comment,
  comments,
  onReply,
  onShowAuth,
}: CommentThreadProps) => {
  // State to track whether the user is currently replying
  const [isReplying, setIsReplying] = React.useState(false);

  // Filter replies to the current comment
  const replies = comments.filter((c) => c.parent_id === comment.comment_id);

  /**
   * Handles submission of a reply
   * 
   * @param {string} content - Content of the reply
   */
  const handleReply = (content: string) => {
    onReply(comment.comment_id, content);
    setIsReplying(false); // Reset replying state after submission
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar_url} />
          <AvatarFallback>
            {comment.author.username[0]?.toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{comment.author.username}</span>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-foreground/90">{comment.content}</p>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
      </div>

      {isReplying && (
        <div className="ml-12">
          <CommentForm
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-12 space-y-4">
          {replies.map((reply) => (
            <CommentThread
              key={reply.comment_id}
              comment={reply}
              comments={comments}
              onReply={onReply}
              onShowAuth={onShowAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;

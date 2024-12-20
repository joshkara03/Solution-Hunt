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

/**
 * Comment Interface
 * Defines the structure of a comment object with nested replies support
 * 
 * @property {string} id - Unique identifier for the comment
 * @property {Object} author - Author details
 * @property {string} content - Text content of the comment
 * @property {string} timestamp - When the comment was created
 * @property {Comment[]} [replies] - Optional nested replies
 */
interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  replies?: Comment[];
}

/**
 * CommentThreadProps Interface
 * Defines the props expected by the CommentThread component
 * 
 * @property {Comment[]} [comments] - Optional array of comments to display
 * @property {Function} [onReply] - Optional callback for handling comment replies
 */
interface CommentThreadProps {
  comments?: Comment[];
  onReply?: (commentId: string, content: string) => void;
}

/**
 * CommentThread Component
 * Renders a nested comment thread with interactive reply functionality
 * 
 * @param {CommentThreadProps} props - Component properties
 * @returns {React.ReactElement} Rendered comment thread
 */
const CommentThread = ({
  comments = [], // Default to empty array if no comments provided
  onReply = () => {}, // Default no-op function if no reply handler provided
}: CommentThreadProps) => {
  // State to track which comment is currently being replied to
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);

  /**
   * Handles submission of a reply
   * 
   * @param {string} content - Content of the reply
   * @description Always replies to the main comment (first comment in the thread)
   */
  const handleSubmitReply = (content: string) => {
    if (replyingTo) {
      // Always reply to the main comment
      const mainCommentId = comments[0]?.id;
      if (mainCommentId) {
        onReply(mainCommentId, content);
        setReplyingTo(null); // Reset replying state after submission
      }
    }
  };

  /**
   * Recursively renders a comment and its nested replies
   * 
   * @param {Comment} comment - Comment to render
   * @param {number} [depth=0] - Depth of the comment in the thread (for indentation)
   * @returns {React.ReactElement} Rendered comment with potential nested replies
   */
  const renderComment = (comment: Comment, depth = 0) => {
    // Generate fallback initials if no name provided
    const authorName = comment.author?.name || "Anonymous";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("");

    return (
      <div
        key={comment.id}
        // Indent nested comments with left margin
        className={`w-full bg-background p-4 rounded-lg space-y-2 ${depth > 0 ? "ml-8" : ""}`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with image or fallback initials */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author?.avatar} alt={authorName} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Author name and timestamp */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">{authorName}</span>
              <span className="text-sm text-muted-foreground">
                {comment.timestamp}
              </span>
            </div>

            {/* Comment content */}
            <p className="mt-1 text-sm">{comment.content}</p>

            {/* Reply button */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                onClick={() => setReplyingTo(comment.id)}
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </Button>
            </div>

            {/* Inline comment form when replying */}
            {replyingTo === comment.id && (
              <div className="mt-4">
                <CommentForm
                  onSubmit={handleSubmitReply}
                  placeholder={`Reply to ${authorName}...`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Recursively render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render the entire comment thread
  return (
    <div className="w-full space-y-4">
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
};

export default CommentThread;

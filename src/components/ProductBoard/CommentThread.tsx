import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import CommentForm from "./CommentForm";

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

interface CommentThreadProps {
  comments?: Comment[];
  onReply?: (commentId: string, content: string) => void;
}

const CommentThread = ({
  comments = [],
  onReply = () => {},
}: CommentThreadProps) => {
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);

  const handleSubmitReply = (content: string) => {
    if (replyingTo) {
      // Always reply to the main comment
      const mainCommentId = comments[0]?.id;
      if (mainCommentId) {
        onReply(mainCommentId, content);
        setReplyingTo(null);
      }
    }
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const authorName = comment.author?.name || "Anonymous";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("");

    return (
      <div
        key={comment.id}
        className={`w-full bg-background p-4 rounded-lg space-y-2 ${depth > 0 ? "ml-8" : ""}`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author?.avatar} alt={authorName} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{authorName}</span>
              <span className="text-sm text-muted-foreground">
                {comment.timestamp}
              </span>
            </div>

            <p className="mt-1 text-sm">{comment.content}</p>

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

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
};

export default CommentThread;

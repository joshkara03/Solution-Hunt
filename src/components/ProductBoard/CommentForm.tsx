import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface CommentFormProps {
  onSubmit?: (comment: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
}

const CommentForm = ({
  onSubmit = () => {},
  onCancel,
  placeholder = "Add a comment...",
  isSubmitting = false,
}: CommentFormProps) => {
  const [comment, setComment] = React.useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      const homeElement = document.getElementById('home-auth-dialog');
      if (homeElement) {
        const event = new CustomEvent('open-auth-dialog');
        homeElement.dispatchEvent(event);
      }
      return;
    }

    if (comment.trim()) {
      onSubmit(comment);
      setComment("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-background p-4 rounded-lg space-y-2"
    >
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        disabled={!user || isSubmitting}
      />
      {!user && (
        <p className="text-red-500 text-sm">
          Please sign in to leave a comment
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!comment.trim() || !user || isSubmitting}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;

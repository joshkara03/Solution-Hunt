import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface CommentFormProps {
  onSubmit?: (comment: string) => void;
  placeholder?: string;
  isSubmitting?: boolean;
}

const CommentForm = ({
  onSubmit = () => {},
  placeholder = "Add a comment...",
  isSubmitting = false,
}: CommentFormProps) => {
  const [comment, setComment] = React.useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no user, trigger the authentication dialog
    if (!user) {
      // Dispatch the event to open the auth dialog
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
        disabled={!user}
      />
      {!user && (
        <p className="text-red-500 text-sm">
          Please sign in to leave a comment
        </p>
      )}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!comment.trim() || isSubmitting || !user}
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

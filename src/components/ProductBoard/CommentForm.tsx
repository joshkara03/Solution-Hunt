import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!comment.trim() || isSubmitting}
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

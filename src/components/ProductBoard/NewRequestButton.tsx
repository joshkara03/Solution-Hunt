import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewRequestButtonProps {
  onClick?: () => void;
}

const NewRequestButton = ({ onClick = () => {} }: NewRequestButtonProps) => {
  return (
    <Button
      className="fixed bottom-6 right-6 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-4 py-3"
      onClick={onClick}
    >
      <span className="text-sm font-medium">Submit a request</span>
      <Plus className="h-5 w-5" />
    </Button>
  );
};

export default NewRequestButton;

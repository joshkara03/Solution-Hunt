import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewRequestButtonProps {
  onClick?: () => void;
}

const NewRequestButton = ({ onClick = () => {} }: NewRequestButtonProps) => {
  return (
    <Button
      className="fixed bottom-6 right-6 w-[60px] h-[60px] rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">New Request</span>
    </Button>
  );
};

export default NewRequestButton;

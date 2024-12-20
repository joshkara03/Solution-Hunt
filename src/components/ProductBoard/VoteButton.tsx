import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface VoteButtonProps {
  voteCount?: number;
  userVote?: "up" | "down" | null;
  onVote?: (direction: "up" | "down") => void;
}

const VoteButton = ({
  voteCount = 0,
  userVote = null,
  onVote = () => {},
}: VoteButtonProps) => {
  return (
    <div className="flex flex-col items-center w-[40px] bg-background">
      <Button
        variant="ghost"
        size="sm"
        className={`p-0 h-8 hover:bg-muted ${userVote === "up" ? "text-green-500" : "text-muted-foreground"}`}
        onClick={() => onVote("up")}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>

      <span className="text-sm font-medium py-1">{voteCount}</span>

      <Button
        variant="ghost"
        size="sm"
        className={`p-0 h-8 hover:bg-muted ${userVote === "down" ? "text-red-500" : "text-muted-foreground"}`}
        onClick={() => onVote("down")}
      >
        <ChevronDown className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default VoteButton;

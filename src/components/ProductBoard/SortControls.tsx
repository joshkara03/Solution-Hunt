import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, Flame, MessageSquare } from "lucide-react";

interface SortControlsProps {
  onSortChange?: (sortType: "votes" | "newest" | "discussed") => void;
  currentSort?: "votes" | "newest" | "discussed";
}

const SortControls = ({
  onSortChange = () => {},
  currentSort = "votes",
}: SortControlsProps) => {
  return (
    <div className="w-full h-[60px] bg-background border-b flex items-center px-4 sticky top-0 z-10">
      <div className="flex gap-2">
        <Button
          variant={currentSort === "votes" ? "default" : "ghost"}
          size="sm"
          onClick={() => onSortChange("votes")}
          className="flex items-center gap-2"
        >
          <Flame className="h-4 w-4" />
          Most Voted
        </Button>
        <Button
          variant={currentSort === "newest" ? "default" : "ghost"}
          size="sm"
          onClick={() => onSortChange("newest")}
          className="flex items-center gap-2"
        >
          <ArrowDownAZ className="h-4 w-4" />
          Newest
        </Button>
        <Button
          variant={currentSort === "discussed" ? "default" : "ghost"}
          size="sm"
          onClick={() => onSortChange("discussed")}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Most Discussed
        </Button>
      </div>
    </div>
  );
};

export default SortControls;

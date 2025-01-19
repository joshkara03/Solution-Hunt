import { Button } from "@/components/ui/button";
import { TagFilter } from "./TagFilter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tag } from "lucide-react";

interface TagDrawerProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export function TagDrawer({ selectedTags, onTagSelect }: TagDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Tag className="h-4 w-4 mr-2" />
          Filter by Tags
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="mt-6">
          <TagFilter
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

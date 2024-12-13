import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import VoteButton from "./VoteButton";
import CommentSection from "./CommentSection";

interface ProductCardProps {
  id: string;
  title?: string;
  description?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  timestamp?: string;
  tags?: string[];
  voteCount?: number;
  userVote?: "up" | "down" | null;
  commentCount?: number;
  onVote?: (direction: "up" | "down") => void;
}

const ProductCard = ({
  id,
  title = "Add Dark Mode Support",
  description = "Implement a dark mode theme across the entire application to improve user experience in low-light conditions.",
  author = {
    name: "John Doe",
    avatar: "https://dummyimage.com/40x40/4F46E5/ffffff&text=JD",
  },
  timestamp = "2 hours ago",
  tags = ["UI/UX", "Enhancement"],
  voteCount = 42,
  userVote = null,
  commentCount = 5,
  onVote = () => {},
}: ProductCardProps) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = React.useState(false);

  return (
    <Card className="w-full bg-background p-4 space-y-4">
      <div className="flex gap-4">
        <VoteButton voteCount={voteCount} userVote={userVote} onVote={onVote} />

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>
                    {author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {author.name} · {timestamp}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <CommentSection
        requestId={id}
        isExpanded={isCommentsExpanded}
        onToggle={() => setIsCommentsExpanded(!isCommentsExpanded)}
        commentCount={commentCount}
      />
    </Card>
  );
};

export default ProductCard;

import { useTags } from '@/lib/hooks/useTags';
import { Badge } from '@/components/ui/badge';

interface TagFilterProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export function TagFilter({ selectedTags, onTagSelect }: TagFilterProps) {
  const { tags, loading } = useTags();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 bg-muted rounded w-24 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground/80 mb-6">Popular Tags</h3>
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className="flex items-center justify-between w-full group px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors"
        >
          <Badge
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedTags.includes(tag) ? 'bg-primary hover:bg-primary/90' : 'hover:bg-secondary/50'
            }`}
          >
            {tag}
          </Badge>
          <span className="text-xs text-muted-foreground">{count}</span>
        </button>
      ))}
    </div>
  );
}

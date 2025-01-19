import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface TagCount {
  tag: string;
  count: number;
}

export function useTags() {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_requests')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      // Count tag occurrences
      const tagCounts: Record<string, number> = {};
      data.forEach(row => {
        if (Array.isArray(row.tags)) {
          row.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      setTags(sortedTags);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  return { tags, loading, error };
}

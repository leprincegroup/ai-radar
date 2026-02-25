'use client';

import { Tool, Paper, HypePost } from '@/types';
import { ToolCard, ToolCardSkeleton } from './ToolCard';
import { ResearchCard, ResearchCardSkeleton } from './ResearchCard';
import { HypeCard } from './HypeCard';

type AnyItem =
  | ({ item_type: 'tool' } & Tool)
  | ({ item_type: 'paper' } & Paper)
  | ({ item_type: 'hype_post' } & HypePost);

interface FeedGridProps {
  items: AnyItem[];
  loading?: boolean;
  skeletonCount?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  bookmarkedIds?: Set<string>;
  onBookmark?: (id: string) => void;
}

export function FeedGrid({
  items,
  loading = false,
  skeletonCount = 8,
  hasMore = false,
  onLoadMore,
  bookmarkedIds = new Set(),
  onBookmark,
}: FeedGridProps) {
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          i % 3 === 2 ? <ResearchCardSkeleton key={i} /> : <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">◈</div>
        <div className="text-[var(--text-secondary)] text-sm">No items found for this filter.</div>
        <div className="text-[var(--text-dim)] text-xs mt-1">Try adjusting your filters or check back later.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((item) => {
          if (item.item_type === 'tool') {
            return (
              <ToolCard
                key={item.id}
                tool={item as Tool}
                bookmarked={bookmarkedIds.has(item.id)}
                onBookmark={onBookmark}
              />
            );
          } else if (item.item_type === 'paper') {
            return (
              <ResearchCard
                key={item.id}
                paper={item as Paper}
                bookmarked={bookmarkedIds.has(item.id)}
                onBookmark={onBookmark}
              />
            );
          } else if (item.item_type === 'hype_post') {
            return <HypeCard key={item.id} post={item as HypePost} />;
          }
          return null;
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Category, SortOrder, SourceFilter } from '@/types';

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '◈' },
  { key: 'llm', label: 'LLMs', emoji: '🤖' },
  { key: 'image-gen', label: 'Image Gen', emoji: '🎨' },
  { key: 'agent', label: 'Agents', emoji: '⚡' },
  { key: 'research', label: 'Research', emoji: '🔬' },
  { key: 'dev-tool', label: 'Dev Tools', emoji: '💻' },
  { key: 'productivity', label: 'Productivity', emoji: '📈' },
];

const SOURCES: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'All Sources' },
  { key: 'producthunt', label: 'Product Hunt' },
  { key: 'github', label: 'GitHub' },
  { key: 'huggingface', label: 'Hugging Face' },
  { key: 'arxiv', label: 'arXiv' },
  { key: 'hackernews', label: 'Hacker News' },
  { key: 'reddit', label: 'Reddit' },
];

const SORTS: { key: SortOrder; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'latest', label: 'Latest' },
  { key: 'most-upvoted', label: 'Most Upvoted' },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = (searchParams.get('category') || 'all') as Category;
  const source = (searchParams.get('source') || 'all') as SourceFilter;
  const sort = (searchParams.get('sort') || 'trending') as SortOrder;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === 'trending') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      {/* Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => updateParam('category', key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
              category === key
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
                : 'text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] bg-transparent'
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Source + Sort dropdowns */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <select
          value={source}
          onChange={e => updateParam('source', e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer hover:border-[var(--border-bright)] transition-colors"
        >
          {SOURCES.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={e => updateParam('sort', e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer hover:border-[var(--border-bright)] transition-colors"
        >
          {SORTS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

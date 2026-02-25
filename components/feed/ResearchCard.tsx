'use client';

import Link from 'next/link';
import { Paper } from '@/types';
import { HypeScore } from '@/components/ui/HypeScore';
import { timeAgo } from '@/lib/utils';

interface ResearchCardProps {
  paper: Paper;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
}

export function ResearchCard({ paper, bookmarked = false, onBookmark }: ResearchCardProps) {
  const authors = paper.authors?.slice(0, 2).join(', ');
  const hasMoreAuthors = (paper.authors?.length || 0) > 2;

  return (
    <div className="group relative flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-blue)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
      {onBookmark && (
        <button
          onClick={(e) => { e.preventDefault(); onBookmark(paper.id); }}
          className="absolute top-3 right-3 text-[var(--text-dim)] hover:text-[var(--accent-blue)] transition-colors z-10 opacity-0 group-hover:opacity-100"
        >
          {bookmarked ? '♥' : '♡'}
        </button>
      )}

      <Link href={`/paper/${paper.slug}`} className="flex flex-col gap-2 flex-1">
        {/* Tag + score */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-[var(--accent-orange)] bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
            📄 Research
          </span>
          <HypeScore score={paper.hype_score} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-white line-clamp-2 leading-snug">
          {paper.title}
        </h3>

        {/* Summary */}
        {paper.summary && (
          <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-snug flex-1">
            {paper.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="text-[11px] text-[var(--text-dim)] truncate">
            {authors}
            {hasMoreAuthors && ' et al.'}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[var(--text-dim)]">
              {timeAgo(paper.published_at || paper.created_at)}
            </span>
            <span className="text-[11px] text-[var(--accent-blue)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ResearchCardSkeleton() {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] gap-2">
      <div className="h-4 w-20 rounded-full skeleton" />
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-5/6 rounded skeleton" />
      </div>
      <div className="space-y-1">
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-4/5 rounded skeleton" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-3 w-28 rounded skeleton" />
        <div className="h-3 w-12 rounded skeleton" />
      </div>
    </div>
  );
}

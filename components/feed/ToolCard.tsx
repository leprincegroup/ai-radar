'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Tool } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { HypeScore } from '@/components/ui/HypeScore';
import { SourceIcon } from '@/components/ui/SourceIcon';
import { timeAgo } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
}

export function ToolCard({ tool, bookmarked = false, onBookmark }: ToolCardProps) {
  return (
    <div className="group relative flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-purple)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer">
      {/* Bookmark button */}
      {onBookmark && (
        <button
          onClick={(e) => { e.preventDefault(); onBookmark(tool.id); }}
          className="absolute top-3 right-3 text-[var(--text-dim)] hover:text-[var(--accent-purple)] transition-colors z-10 opacity-0 group-hover:opacity-100"
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarked ? '♥' : '♡'}
        </button>
      )}

      <Link href={`/tool/${tool.slug}`} className="flex flex-col gap-2 flex-1">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 text-base overflow-hidden">
            {tool.logo_url ? (
              <Image
                src={tool.logo_url}
                alt={tool.name}
                width={32}
                height={32}
                className="w-full h-full object-cover rounded-lg"
                unoptimized
              />
            ) : (
              '🔧'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-white truncate leading-tight">
                {tool.name}
              </h3>
              {tool.category && (
                <Badge category={tool.category} className="flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-snug flex-1">
          {tool.description || 'An AI-powered tool.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-2.5 text-[11px]">
            <SourceIcon source={tool.source} />
            <HypeScore score={tool.hype_score} />
            {tool.is_free && (
              <span className="text-[var(--accent-green)] font-mono">★ Free</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-dim)]">
              {timeAgo(tool.launched_at || tool.created_at)}
            </span>
            <span className="text-[11px] text-[var(--accent-purple)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Try it →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] gap-2">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg skeleton flex-shrink-0" />
        <div className="flex-1 flex items-start justify-between gap-2">
          <div className="h-4 w-24 rounded skeleton" />
          <div className="h-4 w-16 rounded-full skeleton" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-3/4 rounded skeleton" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-3 w-20 rounded skeleton" />
        <div className="h-3 w-12 rounded skeleton" />
      </div>
    </div>
  );
}

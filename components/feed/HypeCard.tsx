'use client';

import { HypePost } from '@/types';
import { HypeScore } from '@/components/ui/HypeScore';
import { SourceIcon } from '@/components/ui/SourceIcon';
import { timeAgo } from '@/lib/utils';

interface HypeCardProps {
  post: HypePost;
}

export function HypeCard({ post }: HypeCardProps) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-orange)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
    >
      {/* Author */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name || ''}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-sm">
              👤
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-[var(--text-primary)]">
              {post.author_name || 'Unknown'}
            </div>
            {post.author_handle && (
              <div className="text-[11px] text-[var(--text-dim)]">
                @{post.author_handle}
              </div>
            )}
          </div>
        </div>
        <SourceIcon source={post.source} showLabel={false} className="text-base" />
      </div>

      {/* Headline */}
      {post.title && (
        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-white line-clamp-2 leading-snug mb-1">
          {post.title}
        </h3>
      )}

      {/* Content */}
      {post.content && (
        <p className="text-[13px] text-[var(--text-secondary)] line-clamp-3 leading-snug flex-1">
          {post.content}
        </p>
      )}

      {/* Engagement */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-dim)]">
          {post.likes > 0 && <span>♥ {post.likes.toLocaleString()}</span>}
          {post.reposts > 0 && <span>↺ {post.reposts.toLocaleString()}</span>}
          {post.views > 0 && <span>👁 {post.views.toLocaleString()}</span>}
        </div>
        <div className="flex items-center gap-2">
          <HypeScore score={post.hype_score} />
          <span className="text-[11px] text-[var(--text-dim)]">
            {timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </a>
  );
}

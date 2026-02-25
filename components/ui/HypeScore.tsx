'use client';

import { cn } from '@/lib/utils';

interface HypeScoreProps {
  score: number;
  className?: string;
}

export function HypeScore({ score, className }: HypeScoreProps) {
  const isHot = score > 500;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-mono',
        isHot ? 'text-orange-400' : 'text-[var(--text-secondary)]',
        className
      )}
    >
      {isHot ? '🔥' : '▲'} {score.toLocaleString()}
    </span>
  );
}

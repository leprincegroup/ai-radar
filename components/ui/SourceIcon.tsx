'use client';

import { cn } from '@/lib/utils';

interface SourceIconProps {
  source: string;
  className?: string;
  showLabel?: boolean;
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  producthunt: { label: 'PH', color: 'text-orange-400', icon: '▲' },
  github: { label: 'GH', color: 'text-gray-300', icon: '⬡' },
  arxiv: { label: 'arXiv', color: 'text-blue-400', icon: '📄' },
  twitter: { label: 'X', color: 'text-sky-400', icon: '𝕏' },
  linkedin: { label: 'in', color: 'text-blue-500', icon: 'in' },
  manual: { label: 'Manual', color: 'text-purple-400', icon: '✦' },
};

export function SourceIcon({ source, className, showLabel = true }: SourceIconProps) {
  const config = SOURCE_CONFIG[source] || { label: source, color: 'text-gray-400', icon: '•' };

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-mono', config.color, className)}>
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

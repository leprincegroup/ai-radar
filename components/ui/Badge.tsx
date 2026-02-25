'use client';

import { cn, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';

interface BadgeProps {
  label?: string;
  category?: string;
  className?: string;
  color?: string;
}

export function Badge({ label, category, className, color }: BadgeProps) {
  const categoryClass = category ? CATEGORY_COLORS[category] || CATEGORY_COLORS.other : '';
  const displayLabel = label ?? (category ? CATEGORY_LABELS[category] ?? category : '');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        color ? color : categoryClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

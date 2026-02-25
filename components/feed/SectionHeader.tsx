import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
}

export function SectionHeader({ title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-mono font-bold text-[var(--text-primary)] tracking-tight">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

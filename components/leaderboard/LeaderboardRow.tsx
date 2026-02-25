import Link from 'next/link';
import Image from 'next/image';
import { Tool, Paper } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';

interface LeaderboardRowProps {
  rank: number;
  item: Tool | Paper;
  type: 'tool' | 'paper';
}

const SOURCE_LABELS: Record<string, string> = {
  producthunt: 'PH',
  github: 'GH',
  huggingface: 'HF',
  arxiv: 'arXiv',
  hackernews: 'HN',
  reddit: 'Reddit',
  manual: 'Manual',
};

const SOURCE_COLORS: Record<string, string> = {
  producthunt: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  github: 'text-gray-300 bg-gray-500/10 border-gray-500/20',
  huggingface: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  arxiv: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  hackernews: 'text-orange-500 bg-orange-600/10 border-orange-600/20',
  reddit: 'text-red-400 bg-red-500/10 border-red-500/20',
  manual: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold border border-yellow-500/30">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20 text-gray-300 text-sm font-bold border border-gray-400/30">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-700/20 text-orange-400 text-sm font-bold border border-orange-700/30">
        🥉
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-mono font-bold border border-[var(--border)]">
      {rank}
    </span>
  );
}

export function LeaderboardRow({ rank, item, type }: LeaderboardRowProps) {
  const isTool = type === 'tool';
  const tool = isTool ? (item as Tool) : null;
  const paper = !isTool ? (item as Paper) : null;

  const href = isTool ? `/tool/${tool!.slug}` : (paper!.arxiv_url ?? '#');
  const name = isTool ? tool!.name : paper!.title;
  const description = isTool ? tool!.description : paper!.summary;
  const category = isTool ? tool!.category : 'research';
  const source = isTool ? tool!.source : 'arxiv';
  const hypeScore = item.hype_score;

  const categoryColor = CATEGORY_COLORS[category ?? 'other'] ?? CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[category ?? 'other'] ?? 'Other';
  const sourceLabel = SOURCE_LABELS[source] ?? source;
  const sourceColor = SOURCE_COLORS[source] ?? SOURCE_COLORS.manual;

  return (
    <Link
      href={href}
      target={isTool ? '_self' : '_blank'}
      rel={isTool ? undefined : 'noopener noreferrer'}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent-purple)]/50 hover:bg-[var(--bg-surface-hover)] transition-all"
    >
      {/* Rank */}
      <div className="flex-shrink-0">
        <RankBadge rank={rank} />
      </div>

      {/* Logo / Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center">
        {isTool && tool!.logo_url ? (
          <Image
            src={tool!.logo_url}
            alt={name}
            width={36}
            height={36}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-lg">{isTool ? '🔧' : '📄'}</span>
        )}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-purple)] transition-colors">
            {name}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${categoryColor}`}>
            {categoryLabel}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sourceColor}`}>
            {sourceLabel}
          </span>
        </div>
        {description && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Hype score */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        <span className={`text-sm font-bold tabular-nums ${hypeScore > 500 ? 'text-orange-400' : 'text-[var(--text-secondary)]'}`}>
          {hypeScore.toLocaleString()}
        </span>
        {hypeScore > 500 && <span className="text-base">🔥</span>}
      </div>
    </Link>
  );
}

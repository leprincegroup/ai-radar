import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import type { Tool, Paper } from '@/types';

export const revalidate = 300; // revalidate every 5 minutes

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

function getPeriodCutoff(period: Period): string | null {
  const now = new Date();
  if (period === 'today') {
    now.setDate(now.getDate() - 1);
    return now.toISOString();
  }
  if (period === 'week') {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (period === 'month') {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return null;
}

async function getLeaderboardData(period: Period) {
  const supabase = await createClient();
  const cutoff = getPeriodCutoff(period);

  let toolsQuery = supabase
    .from('tools')
    .select('*')
    .eq('status', 'active')
    .order('hype_score', { ascending: false })
    .limit(50);

  let papersQuery = supabase
    .from('papers')
    .select('*')
    .order('hype_score', { ascending: false })
    .limit(20);

  if (cutoff) {
    toolsQuery = toolsQuery.gte('created_at', cutoff);
    papersQuery = papersQuery.gte('created_at', cutoff);
  }

  const [{ data: tools }, { data: papers }] = await Promise.all([
    toolsQuery,
    papersQuery,
  ]);

  return {
    tools: (tools ?? []) as Tool[],
    papers: (papers ?? []) as Paper[],
  };
}

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (params.period ?? 'week') as Period;
  const validPeriod = PERIODS.find(p => p.key === period) ? period : 'week';

  const { tools, papers } = await getLeaderboardData(validPeriod);

  const periodLabel = PERIODS.find(p => p.key === validPeriod)?.label ?? 'This Week';

  return (
    <main className="max-w-[900px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-mono text-[var(--text-primary)] mb-2">
          🏆 AI Leaderboard
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          The hottest AI tools and research ranked by hype score — {periodLabel.toLowerCase()}.
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-2 mb-8 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] w-fit">
        {PERIODS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/leaderboard?period=${key}`}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              validPeriod === key
                ? 'bg-[var(--accent-purple)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Tools leaderboard */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            🔧 Top Products
          </h2>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">
            {tools.length} entries
          </span>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--bg-surface)]">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">No products found for this period yet.</p>
            <p className="text-xs mt-1">Try a longer time range or check back after the next ingest.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tools.map((tool, i) => (
              <LeaderboardRow key={tool.id} rank={i + 1} item={tool} type="tool" />
            ))}
          </div>
        )}
      </section>

      {/* Papers leaderboard */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            📄 Top Research
          </h2>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">
            {papers.length} entries
          </span>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--bg-surface)]">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm">No papers found for this period yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {papers.map((paper, i) => (
              <LeaderboardRow key={paper.id} rank={i + 1} item={paper} type="paper" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

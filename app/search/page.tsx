import { createClient } from '@/lib/supabase/server';
import { FeedGrid } from '@/components/feed/FeedGrid';
import type { Tool, Paper } from '@/types';
import Link from 'next/link';

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q || '';

  if (!q) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">⌕</div>
        <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">Search AI Radar</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Enter a search query to find tools and papers.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const [toolsRes, papersRes] = await Promise.all([
    supabase
      .from('tools')
      .select('*')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('status', 'active')
      .order('hype_score', { ascending: false })
      .limit(20),
    supabase
      .from('papers')
      .select('*')
      .ilike('title', `%${q}%`)
      .order('hype_score', { ascending: false })
      .limit(10),
  ]);

  const tools = ((toolsRes.data || []) as Tool[]).map(t => ({ ...t, item_type: 'tool' as const }));
  const papers = ((papersRes.data || []) as Paper[]).map(p => ({ ...p, item_type: 'paper' as const }));
  const allItems = [...tools, ...papers];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          ← Back
        </Link>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Results for &ldquo;{q}&rdquo;
        </h1>
        <span className="text-sm text-[var(--text-dim)]">
          ({allItems.length} results)
        </span>
      </div>

      <FeedGrid items={allItems} />
    </div>
  );
}

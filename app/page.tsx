import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SidePanel } from '@/components/layout/SidePanel';
import { FilterBar } from '@/components/feed/FilterBar';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { SectionHeader } from '@/components/feed/SectionHeader';
import type { Tool, Paper } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { category?: string; source?: string; sort?: string };
}

async function getFeedData(category: string, source: string, sort: string) {
  const supabase = await createClient();

  let toolsQuery = supabase
    .from('tools')
    .select('*')
    .eq('status', 'active');

  if (category && category !== 'all') {
    toolsQuery = toolsQuery.eq('category', category);
  }
  if (source && source !== 'all') {
    toolsQuery = toolsQuery.eq('source', source);
  }

  if (sort === 'latest') {
    toolsQuery = toolsQuery.order('created_at', { ascending: false });
  } else if (sort === 'most-upvoted') {
    toolsQuery = toolsQuery.order('upvotes', { ascending: false });
  } else {
    toolsQuery = toolsQuery.order('hype_score', { ascending: false });
  }

  const [toolsRes, papersRes, trendingRes] = await Promise.all([
    toolsQuery.limit(20),
    supabase
      .from('papers')
      .select('*')
      .order('hype_score', { ascending: false })
      .limit(8),
    supabase
      .from('tools')
      .select('*')
      .eq('status', 'active')
      .order('hype_score', { ascending: false })
      .limit(5),
  ]);

  return {
    tools: (toolsRes.data || []) as Tool[],
    papers: (papersRes.data || []) as Paper[],
    featuredTools: (trendingRes.data || []) as Tool[],
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const category = searchParams.category || 'all';
  const source = searchParams.source || 'all';
  const sort = searchParams.sort || 'trending';

  const { tools, papers, featuredTools } = await getFeedData(category, source, sort);

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const trending = tools
    .sort((a, b) => b.hype_score - a.hype_score)
    .slice(0, 8)
    .map(t => ({ ...t, item_type: 'tool' as const }));

  const justLaunched = tools
    .filter(t => new Date(t.launched_at || t.created_at).getTime() > oneDayAgo)
    .slice(0, 8)
    .map(t => ({ ...t, item_type: 'tool' as const }));

  const researchItems = papers
    .slice(0, 8)
    .map(p => ({ ...p, item_type: 'paper' as const }));

  const isFiltered = category !== 'all' || source !== 'all' || sort !== 'trending';

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center py-8 mb-6">
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          The AI feed that{' '}
          <span className="text-[var(--accent-purple)]">never sleeps.</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Latest tools, research &amp; hype — updated every 6 hours
        </p>
      </div>

      {/* Main 3-column layout */}
      <div className="flex gap-6">
        {/* Left panel */}
        <SidePanel side="left" tools={featuredTools} />

        {/* Center content */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>

          {isFiltered ? (
            /* Filtered view — flat list */
            <section>
              <SectionHeader
                title={`🔍 Filtered Results (${tools.length})`}
              />
              <FeedGrid
                items={tools.map(t => ({ ...t, item_type: 'tool' as const }))}
              />
            </section>
          ) : (
            /* Default sections */
            <>
              <section className="mb-10">
                <SectionHeader title="🔥 Trending Today" viewAllHref="/?sort=trending" />
                <FeedGrid items={trending} />
              </section>

              {justLaunched.length > 0 && (
                <section className="mb-10">
                  <SectionHeader title="🆕 Just Launched" viewAllHref="/?sort=latest" />
                  <FeedGrid items={justLaunched} />
                </section>
              )}

              <section className="mb-10">
                <SectionHeader title="📄 Research Breakthroughs" viewAllHref="/?source=arxiv" />
                <FeedGrid items={researchItems} />
              </section>
            </>
          )}
        </div>

        {/* Right panel */}
        <SidePanel side="right" tools={featuredTools.slice(0, 3)} />
      </div>
    </div>
  );
}

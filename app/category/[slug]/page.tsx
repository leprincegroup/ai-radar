import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { SectionHeader } from '@/components/feed/SectionHeader';
import { CATEGORY_LABELS } from '@/lib/utils';
import type { Tool } from '@/types';
import Link from 'next/link';

const VALID_CATEGORIES = ['llm', 'image-gen', 'agent', 'dev-tool', 'productivity', 'research', 'other'];

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const label = CATEGORY_LABELS[params.slug];
  if (!label) return { title: 'Category Not Found — AI Radar' };
  return {
    title: `${label} — AI Radar`,
    description: `Discover the latest ${label.toLowerCase()} AI tools, ranked by hype score.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params;

  if (!VALID_CATEGORIES.includes(slug)) {
    notFound();
  }

  const label = CATEGORY_LABELS[slug] ?? slug;
  const supabase = await createClient();

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('category', slug)
    .eq('status', 'active')
    .order('hype_score', { ascending: false })
    .limit(40);

  const items = (tools ?? []).map((t: Tool) => ({
    ...t,
    item_type: 'tool' as const,
  }));

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        ← All Tools
      </Link>

      <SectionHeader title={`${label}`} />

      {items.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm">No tools found in this category yet.</p>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Check back after the next data ingest.
          </p>
        </div>
      ) : (
        <FeedGrid items={items} />
      )}
    </div>
  );
}

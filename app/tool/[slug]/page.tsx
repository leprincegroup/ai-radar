import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { HypeScore } from '@/components/ui/HypeScore';
import { SourceIcon } from '@/components/ui/SourceIcon';
import { ToolCard } from '@/components/feed/ToolCard';
import { timeAgo } from '@/lib/utils';
import type { Tool } from '@/types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: tool } = await supabase
    .from('tools')
    .select('name, description')
    .eq('slug', params.slug)
    .single();

  if (!tool) return { title: 'Tool Not Found — AI Radar' };

  return {
    title: `${tool.name} — AI Radar`,
    description: tool.description || '',
  };
}

export const dynamic = 'force-dynamic';


export default async function ToolPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tool) notFound();

  const { data: similarTools } = await supabase
    .from('tools')
    .select('*')
    .eq('category', tool.category)
    .eq('status', 'active')
    .neq('id', tool.id)
    .order('hype_score', { ascending: false })
    .limit(4);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        ← All Tools
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
            {tool.logo_url ? (
              <Image src={tool.logo_url} alt={tool.name} width={64} height={64} className="w-full h-full object-cover rounded-xl" unoptimized />
            ) : '🔧'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">{tool.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tool.category && <Badge category={tool.category} />}
              {(tool.tags || []).map((tag: string) => (
                <span key={tag} className="text-[11px] text-[var(--text-dim)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <HypeScore score={tool.hype_score} />
              {tool.is_free && (
                <span className="text-xs text-[var(--accent-green)] font-mono">★ Free</span>
              )}
              {tool.has_api && (
                <span className="text-xs text-[var(--accent-blue)] font-mono">⚡ API</span>
              )}
              {tool.is_open_source && (
                <span className="text-xs text-gray-300 font-mono">⬡ Open Source</span>
              )}
            </div>
          </div>
        </div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-2 bg-[var(--accent-purple)] text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
        >
          Try it →
        </a>
      </div>

      {/* AI Summary */}
      {(tool.full_description || tool.description) && (
        <div className="mb-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <h2 className="text-xs font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
            About
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {tool.full_description || tool.description}
          </p>
        </div>
      )}

      {/* Details grid */}
      <div className="mb-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <h2 className="text-xs font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
          Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Source</div>
            <SourceIcon source={tool.source} />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Launched</div>
            <div className="text-xs text-[var(--text-primary)]">
              {timeAgo(tool.launched_at || tool.created_at)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Upvotes / Stars</div>
            <div className="text-xs text-[var(--text-primary)] font-mono">
              {tool.upvotes?.toLocaleString() ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Open Source</div>
            <div className="text-xs text-[var(--text-primary)]">
              {tool.is_open_source === true ? 'Yes' : tool.is_open_source === false ? 'No' : 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Has API</div>
            <div className="text-xs text-[var(--text-primary)]">
              {tool.has_api === true ? 'Yes' : tool.has_api === false ? 'No' : 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-dim)] mb-0.5">Pricing</div>
            <div className="text-xs text-[var(--text-primary)]">
              {tool.is_free === true ? 'Free' : tool.is_free === false ? 'Paid' : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Tools */}
      {similarTools && similarTools.length > 0 && (
        <div>
          <h2 className="text-xs font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
            Similar Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {similarTools.map(t => (
              <ToolCard key={t.id} tool={t as Tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

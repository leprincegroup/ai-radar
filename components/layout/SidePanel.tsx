import Link from 'next/link';
import { Tool } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';

interface SidePanelProps {
  side: 'left' | 'right';
  tools?: Tool[];
}

function FeaturedToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-bright)] hover:bg-[var(--bg-card-hover)] transition-all group"
    >
      <div className="w-8 h-8 rounded-md bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0 text-base overflow-hidden">
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover rounded-md" />
        ) : (
          '🔧'
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-white truncate">
          {tool.name}
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5 leading-tight">
          {tool.description || 'AI-powered tool'}
        </div>
      </div>
    </Link>
  );
}

export function SidePanel({ side, tools = [] }: SidePanelProps) {
  if (side === 'left') {
    return (
      <aside className="hidden xl:flex flex-col gap-3 w-[220px] flex-shrink-0">
        <div className="sticky top-20">
          <div className="text-[11px] font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
            Featured Tools
          </div>
          <div className="flex flex-col gap-2">
            {tools.length > 0 ? (
              tools.slice(0, 5).map(tool => (
                <FeaturedToolCard key={tool.id} tool={tool} />
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg skeleton" />
              ))
            )}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
              Categories
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Link
                  key={key}
                  href={`/?category=${key}`}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1 px-2 rounded hover:bg-[var(--bg-surface)] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col gap-3 w-[220px] flex-shrink-0">
      <div className="sticky top-20">
        {/* Sponsor / Ad slot */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] mb-4">
          <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mb-2">
            Sponsored
          </div>
          <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">
            Advertise Here
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mb-3">
            Reach thousands of AI builders and researchers every day.
          </div>
          <Link
            href="/advertise"
            className="text-[11px] text-[var(--accent-purple)] hover:underline"
          >
            Get in touch →
          </Link>
        </div>

        {/* Submit tool CTA */}
        <div className="p-4 rounded-lg border border-[var(--border-bright)] bg-[var(--bg-surface)] mb-4">
          <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">
            Submit Your Tool
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mb-3">
            Built something cool? Get featured in the AI Radar feed.
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1 text-[11px] font-medium bg-[var(--accent-purple)] text-white px-3 py-1.5 rounded-md hover:bg-purple-600 transition-colors"
          >
            <span>+</span> Submit Tool
          </Link>
        </div>

        {/* Top tools this week */}
        {tools.length > 0 && (
          <>
            <div className="text-[11px] font-mono font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">
              Trending This Week
            </div>
            <div className="flex flex-col gap-2">
              {tools.slice(0, 3).map(tool => (
                <FeaturedToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

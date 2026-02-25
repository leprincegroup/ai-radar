'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORY_LABELS } from '@/lib/utils';

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  type: 'tool' | 'paper';
  slug: string;
  logo_url?: string;
}

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        const r = results[activeIndex];
        router.push(r.type === 'tool' ? `/tool/${r.slug}` : `/paper/${r.slug}`);
        setIsOpen(false);
        setQuery('');
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-sm">⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools, papers..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-8 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-xs animate-spin">◌</span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden z-50 shadow-xl">
          {results.map((result, i) => {
            const label = result.name || result.title || '';
            const href = result.type === 'tool' ? `/tool/${result.slug}` : `/paper/${result.slug}`;
            return (
              <Link
                key={result.id}
                href={href}
                onClick={() => { setIsOpen(false); setQuery(''); }}
                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-card-hover)] transition-colors ${i === activeIndex ? 'bg-[var(--bg-card-hover)]' : ''}`}
              >
                <span className="text-lg w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] rounded-md flex-shrink-0">
                  {result.logo_url ? (
                    <img src={result.logo_url} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    result.type === 'paper' ? '📄' : '🔧'
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)] truncate">{label}</div>
                  {result.category && (
                    <div className="text-xs text-[var(--text-dim)]">
                      {CATEGORY_LABELS[result.category] || result.category}
                    </div>
                  )}
                </div>
                <span className="text-xs text-[var(--text-dim)] flex-shrink-0">
                  {result.type === 'paper' ? 'paper' : 'tool'}
                </span>
              </Link>
            );
          })}
          {query.trim() && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-purple)] hover:bg-[var(--bg-card-hover)] border-t border-[var(--border)] transition-colors"
            >
              <span>⌕</span>
              <span>See all results for &ldquo;{query}&rdquo;</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

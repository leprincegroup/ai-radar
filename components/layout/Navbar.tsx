'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-mono font-bold text-[var(--accent-purple)]">◈</span>
          <span className="font-mono font-bold text-[var(--text-primary)] text-sm tracking-tight">
            AI<span className="text-[var(--accent-purple)]">RADAR</span>
          </span>
        </Link>

        {/* Search — center */}
        <div className="flex-1 max-w-md mx-auto">
          <SearchBar />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            🏆 Leaderboard
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/submit"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--accent-purple)] text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <span>+</span>
            <span>Submit Tool</span>
          </Link>
          <Link
            href="/signin"
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

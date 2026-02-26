'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/ui/SearchBar';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.refresh();
  }

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

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[var(--accent-purple)] flex items-center justify-center text-[10px] text-white font-bold">
                  {user.email?.[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {user.email?.split('@')[0]}
                </span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50">
                  <Link
                    href="/bookmarks"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ♥ My Bookmarks
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-xs text-[var(--accent-red)] hover:bg-[var(--bg-card-hover)] transition-colors border-t border-[var(--border)]"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 py-8">
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[var(--accent-purple)] text-sm">◈</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            AI<span className="text-[var(--accent-purple)]">RADAR</span>
          </span>
          <span className="text-[var(--text-dim)] text-xs ml-2">
            — The AI feed that never sleeps.
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <Link href="/submit" className="hover:text-[var(--text-primary)] transition-colors">
            Submit Tool
          </Link>
          <Link href="/advertise" className="hover:text-[var(--text-primary)] transition-colors">
            Advertise
          </Link>
          <Link href="/api-docs" className="hover:text-[var(--text-primary)] transition-colors">
            API Docs
          </Link>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About
          </Link>
          <span className="text-[var(--text-dim)]">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

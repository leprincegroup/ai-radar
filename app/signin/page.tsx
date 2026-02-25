'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (err) {
      setError(err.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✉</div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Check your inbox</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="text-3xl font-mono font-bold text-[var(--accent-purple)]">◈</span>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mt-2 mb-1">Sign in to AI Radar</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          No password needed — we&apos;ll email you a magic link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Email address
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
          />
        </div>

        {error && (
          <div className="text-sm text-[var(--accent-red)] bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 bg-[var(--accent-purple)] text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-dim)] mt-6">
        <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
          ← Back to feed
        </Link>
      </p>
    </div>
  );
}

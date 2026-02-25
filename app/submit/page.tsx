'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

const CATEGORIES = [
  { value: 'llm', label: 'LLM' },
  { value: 'image-gen', label: 'Image Generation' },
  { value: 'agent', label: 'Agent' },
  { value: 'dev-tool', label: 'Dev Tool' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    category: 'other',
    email: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    const supabase = createClient();
    const slug = `${slugify(form.name)}-${Date.now()}`;

    const { error: err } = await supabase.from('tools').insert({
      name: form.name,
      slug,
      url: form.url,
      description: form.description,
      category: form.category,
      source: 'manual',
      status: 'pending',
      hype_score: 0,
      upvotes: 0,
    });

    if (err) {
      setError(err.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Tool Submitted!</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Your tool has been submitted for review. We&apos;ll add it to the feed once approved.
        </p>
        <Link
          href="/"
          className="text-sm text-[var(--accent-purple)] hover:underline"
        >
          ← Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        ← Back to feed
      </Link>

      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Submit a Tool</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Built something AI-powered? Get it featured in the feed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Tool Name *
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. MyCoolAI"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            URL *
          </label>
          <input
            required
            type="url"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="https://example.com"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Short Description *
          </label>
          <textarea
            required
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="One sentence about what your tool does..."
            rows={3}
            maxLength={200}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors resize-none"
          />
          <div className="text-[11px] text-[var(--text-dim)] text-right mt-1">
            {form.description.length}/200
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Category *
          </label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors cursor-pointer"
          >
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Your Email (optional)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
          />
          <p className="text-[11px] text-[var(--text-dim)] mt-1">
            We&apos;ll notify you when your tool goes live.
          </p>
        </div>

        {error && (
          <div className="text-sm text-[var(--accent-red)] bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-2.5 bg-[var(--accent-purple)] text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Tool'}
        </button>
      </form>
    </div>
  );
}

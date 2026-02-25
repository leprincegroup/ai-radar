import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FeedGrid } from '@/components/feed/FeedGrid';
import type { Tool, Paper } from '@/types';

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">♡</div>
        <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">No bookmarks yet</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Bookmark tools and papers to access them quickly later.
        </p>
        <Link href="/" className="text-sm text-[var(--accent-purple)] hover:underline">
          Browse the feed →
        </Link>
      </div>
    );
  }

  const toolIds = bookmarks.filter(b => b.item_type === 'tool').map(b => b.item_id);
  const paperIds = bookmarks.filter(b => b.item_type === 'paper').map(b => b.item_id);

  const [toolsRes, papersRes] = await Promise.all([
    toolIds.length > 0
      ? supabase.from('tools').select('*').in('id', toolIds)
      : { data: [] },
    paperIds.length > 0
      ? supabase.from('papers').select('*').in('id', paperIds)
      : { data: [] },
  ]);

  const tools = ((toolsRes.data || []) as Tool[]).map(t => ({ ...t, item_type: 'tool' as const }));
  const papers = ((papersRes.data || []) as Paper[]).map(p => ({ ...p, item_type: 'paper' as const }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          ← Back
        </Link>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Your Bookmarks ({bookmarks.length})
        </h1>
      </div>

      <FeedGrid items={[...tools, ...papers]} />
    </div>
  );
}

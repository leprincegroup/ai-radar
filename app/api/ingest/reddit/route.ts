import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchRedditAIPosts } from '@/lib/sources/reddit';

function checkCronSecret(req: NextRequest) {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
}

function calcHypeScore(score: number, numComments: number, createdAt: string): number {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  const agePenalty = Math.pow(ageHours + 2, 1.5);
  const rawScore = score * 1.5 + numComments * 2;
  return Math.max(1, Math.round((rawScore / agePenalty) * 100));
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await fetchRedditAIPosts();
    const supabase = createServiceClient();
    let inserted = 0;

    for (const post of posts) {
      const { data: existing } = await supabase
        .from('hype_posts')
        .select('id')
        .eq('source', 'reddit')
        .eq('author_handle', post.source_id)
        .single();

      if (existing) continue;

      const hype_score = calcHypeScore(post.score, post.num_comments, post.created_at);

      await supabase.from('hype_posts').insert({
        title: post.title,
        content: `r/${post.subreddit}`,
        url: post.url,
        source: 'reddit',
        author_name: post.author_name,
        author_handle: post.source_id,   // Reddit post ID for dedup
        author_avatar: null,
        likes: post.score,
        reposts: 0,
        views: post.num_comments,
        hype_score,
        related_tool_id: null,
        created_at: post.created_at,
      });

      inserted++;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('Reddit ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

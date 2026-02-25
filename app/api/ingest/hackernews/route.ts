import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchHNAIPosts } from '@/lib/sources/hackernews';

function checkCronSecret(req: NextRequest) {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
}

function calcHypeScore(points: number, numComments: number, createdAt: string): number {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  const agePenalty = Math.pow(ageHours + 2, 1.5);
  const rawScore = points * 2 + numComments * 3;
  return Math.max(1, Math.round((rawScore / agePenalty) * 100));
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await fetchHNAIPosts();
    const supabase = createServiceClient();
    let inserted = 0;

    for (const post of posts) {
      const { data: existing } = await supabase
        .from('hype_posts')
        .select('id')
        .eq('source', 'hackernews')
        .eq('author_handle', post.source_id) // reuse author_handle as source_id store
        .single();

      if (existing) continue;

      const hype_score = calcHypeScore(post.points, post.num_comments, post.created_at);

      await supabase.from('hype_posts').insert({
        title: post.title,
        content: null,
        url: post.url,
        source: 'hackernews',
        author_name: post.author_name,
        author_handle: post.source_id,   // store HN objectID here for dedup
        author_avatar: null,
        likes: post.points,
        reposts: 0,
        views: post.num_comments,        // use views column for comment count
        hype_score,
        related_tool_id: null,
        created_at: post.created_at,
      });

      inserted++;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('HN ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

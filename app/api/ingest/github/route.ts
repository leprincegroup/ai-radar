import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchTrendingAIRepos } from '@/lib/sources/github';
import { enrichTool } from '@/lib/openai';
import { slugify, calculateHypeScore } from '@/lib/utils';

function checkCronSecret(req: NextRequest) {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const repos = await fetchTrendingAIRepos();
    const supabase = createServiceClient();
    let inserted = 0;

    for (const raw of repos) {
      const { data: existing } = await supabase
        .from('tools')
        .select('id')
        .eq('source_id', raw.source_id)
        .eq('source', 'github')
        .single();

      if (existing) continue;

      let enrichment;
      try {
        enrichment = await enrichTool({
          name: raw.name,
          description: raw.description,
          url: raw.url,
          source: 'github',
        });
      } catch {
        enrichment = {
          one_liner: raw.description || 'An open-source AI project.',
          category: 'other' as const,
          tags: ['open-source'],
          is_free: true,
          has_api: false,
          is_open_source: true,
        };
      }

      const slug = slugify(raw.name);
      const hype_score = calculateHypeScore({
        id: '',
        slug,
        name: raw.name,
        category: enrichment.category,
        source: 'github',
        source_id: raw.source_id,
        source_url: raw.source_url,
        status: 'active',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        description: enrichment.one_liner,
        full_description: null,
        url: raw.url,
        logo_url: raw.logo_url,
        tags: enrichment.tags,
        hype_score: 0,
        upvotes: raw.upvotes,
        is_free: enrichment.is_free,
        has_api: enrichment.has_api,
        is_open_source: enrichment.is_open_source,
        launched_at: raw.launched_at,
      });

      await supabase.from('tools').upsert({
        name: raw.name,
        slug: `${slug}-${raw.source_id}`,
        description: enrichment.one_liner,
        url: raw.url,
        logo_url: raw.logo_url,
        category: enrichment.category,
        tags: enrichment.tags,
        source: 'github',
        source_id: raw.source_id,
        source_url: raw.source_url,
        hype_score,
        upvotes: raw.upvotes,
        is_free: enrichment.is_free,
        has_api: enrichment.has_api,
        is_open_source: enrichment.is_open_source,
        status: 'active',
        launched_at: raw.launched_at,
      }, { onConflict: 'source_id' });

      inserted++;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('GitHub ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

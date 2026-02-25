import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchLatestAITools } from '@/lib/sources/producthunt';
import { enrichTool } from '@/lib/openai';
import { slugify, calculateHypeScore } from '@/lib/utils';

function checkCronSecret(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tools = await fetchLatestAITools();
    const supabase = createServiceClient();
    let inserted = 0;

    for (const raw of tools) {
      // Skip duplicates
      const { data: existing } = await supabase
        .from('tools')
        .select('id')
        .eq('source_id', raw.source_id)
        .eq('source', 'producthunt')
        .single();

      if (existing) continue;

      let enrichment;
      try {
        enrichment = await enrichTool(raw);
      } catch {
        enrichment = {
          one_liner: raw.tagline,
          category: 'other' as const,
          tags: [],
          is_free: false,
          has_api: false,
          is_open_source: false,
        };
      }

      const slug = slugify(raw.name);
      const hype_score = calculateHypeScore({
        ...raw,
        id: '',
        slug,
        category: enrichment.category,
        status: 'active',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        description: enrichment.one_liner,
        full_description: null,
        tags: enrichment.tags,
        source_url: raw.source_url,
        hype_score: 0,
        is_free: enrichment.is_free,
        has_api: enrichment.has_api,
        is_open_source: enrichment.is_open_source,
      });

      await supabase.from('tools').upsert({
        name: raw.name,
        slug: `${slug}-${raw.source_id}`,
        description: enrichment.one_liner,
        url: raw.url,
        logo_url: raw.logo_url,
        category: enrichment.category,
        tags: enrichment.tags,
        source: 'producthunt',
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
    console.error('PH ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

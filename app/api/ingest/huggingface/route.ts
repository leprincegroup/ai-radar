import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchTrendingHFSpaces, fetchTrendingHFModels } from '@/lib/sources/huggingface';
import { slugify } from '@/lib/utils';

function checkCronSecret(req: NextRequest) {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
}

function calcHypeScore(likes: number, createdAt: string): number {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  const agePenalty = Math.pow(ageHours + 2, 1.5);
  return Math.max(1, Math.round(((likes * 3) / agePenalty) * 100));
}

// Map HuggingFace tags to our category system
function inferCategory(tags: string[]): string {
  const t = tags.map(x => x.toLowerCase()).join(' ');
  if (t.includes('text-generation') || t.includes('llm') || t.includes('language-model')) return 'llm';
  if (t.includes('text-to-image') || t.includes('image-generation') || t.includes('diffusion')) return 'image-gen';
  if (t.includes('agent') || t.includes('tool-use') || t.includes('function-calling')) return 'agent';
  if (t.includes('code') || t.includes('coding')) return 'dev-tool';
  if (t.includes('text-to-speech') || t.includes('automatic-speech') || t.includes('translation')) return 'productivity';
  return 'other';
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [spaces, models] = await Promise.all([
      fetchTrendingHFSpaces(),
      fetchTrendingHFModels(),
    ]);
    const all = [...spaces, ...models];

    const supabase = createServiceClient();
    let inserted = 0;

    for (const item of all) {
      const { data: existing } = await supabase
        .from('tools')
        .select('id')
        .eq('source', 'huggingface')
        .eq('source_id', item.source_id)
        .single();

      if (existing) continue;

      const slug = slugify(item.name);
      const category = inferCategory(item.tags);
      const hype_score = calcHypeScore(item.likes, item.created_at);

      await supabase.from('tools').insert({
        name: item.name,
        slug: `${slug}-hf-${item.source_id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
        description: item.description,
        full_description: null,
        url: item.url,
        logo_url: item.logo_url,
        category,
        tags: item.tags,
        source: 'huggingface',
        source_id: item.source_id,
        source_url: item.url,
        hype_score,
        upvotes: item.likes,
        is_free: true,
        has_api: true,
        is_open_source: true,
        status: 'active',
        launched_at: item.created_at,
      });

      inserted++;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('HF ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

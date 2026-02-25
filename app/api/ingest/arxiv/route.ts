import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchLatestPapers } from '@/lib/sources/arxiv';
import { enrichPaper } from '@/lib/openai';
import { slugify } from '@/lib/utils';

function checkCronSecret(req: NextRequest) {
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const papers = await fetchLatestPapers();
    const supabase = createServiceClient();
    let inserted = 0;

    for (const raw of papers) {
      const { data: existing } = await supabase
        .from('papers')
        .select('id')
        .eq('arxiv_id', raw.arxiv_id)
        .single();

      if (existing) continue;

      let enrichment;
      try {
        enrichment = await enrichPaper(raw);
      } catch {
        enrichment = {
          summary: raw.abstract.slice(0, 300),
          tags: raw.categories.slice(0, 3),
        };
      }

      const slug = `${slugify(raw.title.slice(0, 60))}-${raw.arxiv_id}`;

      await supabase.from('papers').upsert({
        title: raw.title,
        slug,
        summary: enrichment.summary,
        abstract: raw.abstract,
        authors: raw.authors,
        arxiv_id: raw.arxiv_id,
        arxiv_url: raw.arxiv_url,
        pdf_url: raw.pdf_url,
        categories: raw.categories,
        tags: enrichment.tags,
        hype_score: 50,
        citation_count: 0,
        published_at: raw.published_at,
      }, { onConflict: 'arxiv_id' });

      inserted++;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('arXiv ingest error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

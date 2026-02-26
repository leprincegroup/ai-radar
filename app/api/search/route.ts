import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();

  // Use full-text search on tools (tsvector index), fall back to ilike for papers
  const [toolsRes, papersRes] = await Promise.all([
    supabase
      .from('tools')
      .select('id, name, slug, category, logo_url')
      .textSearch('search_vector', q.split(/\s+/).join(' & '), { type: 'plain' })
      .eq('status', 'active')
      .order('hype_score', { ascending: false })
      .limit(Math.ceil(limit / 2)),

    supabase
      .from('papers')
      .select('id, title, slug, categories, tags')
      .ilike('title', `%${q}%`)
      .order('hype_score', { ascending: false })
      .limit(Math.floor(limit / 2)),
  ]);

  // If full-text search returns nothing, fall back to ilike
  let tools = toolsRes.data || [];
  if (tools.length === 0) {
    const fallback = await supabase
      .from('tools')
      .select('id, name, slug, category, logo_url')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('status', 'active')
      .order('hype_score', { ascending: false })
      .limit(Math.ceil(limit / 2));
    tools = fallback.data || [];
  }

  const toolResults = tools.map(t => ({ ...t, type: 'tool' as const }));
  const paperResults = (papersRes.data || []).map(p => ({
    ...p,
    name: p.title,
    type: 'paper' as const,
  }));

  return NextResponse.json({ results: [...toolResults, ...paperResults].slice(0, limit) });
}

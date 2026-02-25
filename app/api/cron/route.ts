import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const incomingSecret = req.headers.get('x-cron-secret');

  if (incomingSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
  const headers = { 'x-cron-secret': secret! };

  const results = await Promise.allSettled([
    fetch(`${baseUrl}/api/ingest/producthunt`, { headers }),
    fetch(`${baseUrl}/api/ingest/arxiv`, { headers }),
    fetch(`${baseUrl}/api/ingest/github`, { headers }),
    fetch(`${baseUrl}/api/ingest/hackernews`, { headers }),
    fetch(`${baseUrl}/api/ingest/huggingface`, { headers }),
    fetch(`${baseUrl}/api/ingest/reddit`, { headers }),
  ]);

  return NextResponse.json({
    results: results.map(r => (r.status === 'fulfilled' ? 'ok' : r.reason)),
  });
}

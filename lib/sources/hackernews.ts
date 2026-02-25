export interface RawHNPost {
  source_id: string;
  title: string;
  url: string;
  author_name: string;
  points: number;
  num_comments: number;
  created_at: string;
}

export async function fetchHNAIPosts(): Promise<RawHNPost[]> {
  // Search HN stories from the last 48 hours mentioning AI tools/products
  const since = Math.floor((Date.now() - 48 * 3600 * 1000) / 1000);
  const queries = [
    `query=show+HN+AI&tags=story&numericFilters=created_at_i>${since},points>5`,
    `query=AI+tool+launch&tags=story&numericFilters=created_at_i>${since},points>10`,
    `query=LLM+agent+model&tags=story&numericFilters=created_at_i>${since},points>15`,
  ];

  const seen = new Set<string>();
  const posts: RawHNPost[] = [];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://hn.algolia.com/api/v1/search?${q}&hitsPerPage=15`,
        { headers: { 'User-Agent': 'AIRadar/1.0' }, next: { revalidate: 0 } }
      );
      if (!res.ok) continue;
      const data = await res.json();

      for (const hit of data.hits ?? []) {
        if (!hit.objectID || seen.has(hit.objectID)) continue;
        if (!hit.title) continue;
        seen.add(hit.objectID);

        posts.push({
          source_id: hit.objectID,
          title: hit.title,
          // HN stories without an external URL use the HN item page
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          author_name: hit.author || 'Anonymous',
          points: hit.points ?? 0,
          num_comments: hit.num_comments ?? 0,
          created_at: hit.created_at ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('HN fetch error:', err);
    }
  }

  return posts;
}

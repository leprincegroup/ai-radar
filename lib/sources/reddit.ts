export interface RawRedditPost {
  source_id: string;
  title: string;
  url: string;
  permalink: string;
  author_name: string;
  score: number;
  num_comments: number;
  subreddit: string;
  created_at: string;
}

const SUBREDDITS = ['MachineLearning', 'LocalLLaMA', 'artificial', 'AIToolsForum'];

export async function fetchRedditAIPosts(): Promise<RawRedditPost[]> {
  const seen = new Set<string>();
  const posts: RawRedditPost[] = [];

  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=15&t=day`,
        {
          headers: {
            'User-Agent': 'AIRadar/1.0 (aggregator; contact@airadar.dev)',
            Accept: 'application/json',
          },
          next: { revalidate: 0 },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const children = data?.data?.children ?? [];

      for (const child of children) {
        const p = child.data;
        if (!p?.id || seen.has(p.id)) continue;
        // Filter out low-quality posts
        if ((p.score ?? 0) < 10) continue;
        // Skip pinned/stickied mod posts
        if (p.stickied || p.pinned) continue;

        seen.add(p.id);
        posts.push({
          source_id: p.id,
          title: p.title,
          // If the post links to an external URL use it; otherwise use the reddit thread
          url: p.url?.startsWith('https://www.reddit.com') || !p.url
            ? `https://www.reddit.com${p.permalink}`
            : p.url,
          permalink: `https://www.reddit.com${p.permalink}`,
          author_name: p.author ?? 'unknown',
          score: p.score ?? 0,
          num_comments: p.num_comments ?? 0,
          subreddit: p.subreddit ?? sub,
          created_at: new Date((p.created_utc ?? Date.now() / 1000) * 1000).toISOString(),
        });
      }
    } catch (err) {
      console.error(`Reddit r/${sub} fetch error:`, err);
    }
  }

  return posts;
}

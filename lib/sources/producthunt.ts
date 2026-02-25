import { slugify } from '@/lib/utils';

const PH_ENDPOINT = 'https://api.producthunt.com/v2/api/graphql';

const PH_QUERY = `
  query GetAITools($daysAgo: DateTime) {
    posts(topic: "artificial-intelligence", first: 20, order: VOTES, postedAfter: $daysAgo) {
      edges {
        node {
          id
          name
          tagline
          url
          votesCount
          thumbnail { url }
          createdAt
        }
      }
    }
  }
`;

export interface RawTool {
  name: string;
  tagline: string;
  url: string;
  source_id: string;
  source_url: string;
  logo_url: string | null;
  upvotes: number;
  launched_at: string;
  source: string;
}

export async function fetchLatestAITools(): Promise<RawTool[]> {
  const token = process.env.PRODUCTHUNT_API_KEY;
  if (!token) throw new Error('PRODUCTHUNT_API_KEY not set');

  const daysAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(PH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: PH_QUERY,
      variables: { daysAgo },
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`ProductHunt API error: ${res.status}`);

  const data = await res.json();
  const posts = data?.data?.posts?.edges ?? [];

  return posts.map(({ node }: any) => ({
    name: node.name,
    tagline: node.tagline,
    url: node.url,
    source_id: node.id,
    source_url: `https://www.producthunt.com/posts/${slugify(node.name)}`,
    logo_url: node.thumbnail?.url ?? null,
    upvotes: node.votesCount ?? 0,
    launched_at: node.createdAt,
    source: 'producthunt',
  }));
}

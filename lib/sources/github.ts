export interface RawRepo {
  name: string;
  description: string | null;
  url: string;
  source_id: string;
  source_url: string;
  logo_url: string | null;
  upvotes: number;
  launched_at: string;
  source: string;
}

export async function fetchTrendingAIRepos(): Promise<RawRepo[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const url =
    `https://api.github.com/search/repositories?` +
    `q=topic:artificial-intelligence+created:>${sevenDaysAgo}` +
    `&sort=stars&order=desc&per_page=10`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  const repos = data?.items ?? [];

  return repos.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    url: repo.homepage || repo.html_url,
    source_id: String(repo.id),
    source_url: repo.html_url,
    logo_url: repo.owner?.avatar_url ?? null,
    upvotes: repo.stargazers_count ?? 0,
    launched_at: repo.created_at,
    source: 'github',
  }));
}

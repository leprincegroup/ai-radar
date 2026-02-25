export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  full_description: string | null;
  url: string;
  logo_url: string | null;
  category: string | null;
  tags: string[] | null;
  source: string;
  source_id: string | null;
  source_url: string | null;
  hype_score: number;
  upvotes: number;
  is_free: boolean | null;
  has_api: boolean | null;
  is_open_source: boolean | null;
  status: string;
  launched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  abstract: string | null;
  authors: string[] | null;
  arxiv_id: string | null;
  arxiv_url: string | null;
  pdf_url: string | null;
  categories: string[] | null;
  tags: string[] | null;
  hype_score: number;
  citation_count: number;
  published_at: string | null;
  created_at: string;
}

export interface HypePost {
  id: string;
  title: string | null;
  content: string | null;
  url: string;
  source: string;
  author_name: string | null;
  author_handle: string | null;
  author_avatar: string | null;
  likes: number;
  reposts: number;
  views: number;
  hype_score: number;
  related_tool_id: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'tool' | 'paper' | 'hype_post';
  created_at: string;
}

export type FeedItem =
  | ({ item_type: 'tool' } & Tool)
  | ({ item_type: 'paper' } & Paper)
  | ({ item_type: 'hype_post' } & HypePost);

export type Category =
  | 'all'
  | 'llm'
  | 'image-gen'
  | 'agent'
  | 'dev-tool'
  | 'productivity'
  | 'research'
  | 'other';

export type SortOrder = 'trending' | 'latest' | 'most-upvoted';

export type SourceFilter =
  | 'all'
  | 'producthunt'
  | 'github'
  | 'arxiv'
  | 'hackernews'
  | 'huggingface'
  | 'reddit';

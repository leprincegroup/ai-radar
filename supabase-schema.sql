-- ============================================================
-- AI Radar — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,
  category TEXT,
  tags TEXT[],
  source TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  hype_score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  is_free BOOLEAN,
  has_api BOOLEAN,
  is_open_source BOOLEAN,
  status TEXT DEFAULT 'active',
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tools_category_idx ON tools (category);
CREATE INDEX IF NOT EXISTS tools_hype_score_idx ON tools (hype_score DESC);
CREATE INDEX IF NOT EXISTS tools_created_at_idx ON tools (created_at DESC);
CREATE INDEX IF NOT EXISTS tools_source_idx ON tools (source);
CREATE UNIQUE INDEX IF NOT EXISTS tools_source_source_id_idx ON tools (source, source_id) WHERE source_id IS NOT NULL;

-- Full-text search
ALTER TABLE tools ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS tools_search_idx ON tools USING GIN(search_vector);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  abstract TEXT,
  authors TEXT[],
  arxiv_id TEXT UNIQUE,
  arxiv_url TEXT,
  pdf_url TEXT,
  categories TEXT[],
  tags TEXT[],
  hype_score INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS papers_hype_score_idx ON papers (hype_score DESC);
CREATE INDEX IF NOT EXISTS papers_created_at_idx ON papers (created_at DESC);

-- Hype posts table
CREATE TABLE IF NOT EXISTS hype_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  author_name TEXT,
  author_handle TEXT,
  author_avatar TEXT,
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  hype_score INTEGER DEFAULT 0,
  related_tool_id UUID REFERENCES tools(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks (user_id);

-- RLS Policies
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hype_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read access for tools, papers, hype_posts
CREATE POLICY "Public can read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public can read papers" ON papers FOR SELECT USING (true);
CREATE POLICY "Public can read hype_posts" ON hype_posts FOR SELECT USING (true);

-- Authenticated users can insert tools (pending status for submit form)
CREATE POLICY "Anyone can submit tools" ON tools FOR INSERT WITH CHECK (status = 'pending' OR status = 'active');

-- Bookmarks: users can only see/manage their own
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass (for cron jobs)
-- The service role key bypasses RLS automatically

-- Seed with some sample tools for testing
INSERT INTO tools (name, slug, description, url, category, source, hype_score, upvotes, is_free, has_api, is_open_source, status, launched_at) VALUES
  ('Claude', 'claude-anthropic', 'Advanced AI assistant by Anthropic with strong reasoning capabilities', 'https://claude.ai', 'llm', 'manual', 950, 5000, true, true, false, 'active', NOW() - INTERVAL '30 days'),
  ('Cursor', 'cursor-ai-editor', 'AI-powered code editor built on VS Code with inline completions', 'https://cursor.sh', 'dev-tool', 'manual', 890, 4200, false, false, false, 'active', NOW() - INTERVAL '20 days'),
  ('Midjourney', 'midjourney', 'AI image generation via Discord prompts, industry-leading quality', 'https://midjourney.com', 'image-gen', 'manual', 870, 8000, false, false, false, 'active', NOW() - INTERVAL '60 days'),
  ('LangChain', 'langchain', 'Open-source framework for building LLM-powered applications and agents', 'https://langchain.com', 'agent', 'manual', 820, 3500, true, true, true, 'active', NOW() - INTERVAL '45 days'),
  ('Perplexity AI', 'perplexity-ai', 'AI-powered search engine with real-time web access and citations', 'https://perplexity.ai', 'llm', 'manual', 800, 3000, true, true, false, 'active', NOW() - INTERVAL '25 days'),
  ('Replicate', 'replicate', 'Run open-source AI models via simple API, pay per prediction', 'https://replicate.com', 'dev-tool', 'manual', 780, 2800, false, true, false, 'active', NOW() - INTERVAL '15 days'),
  ('AutoGPT', 'autogpt', 'Autonomous AI agent that completes multi-step tasks independently', 'https://agpt.co', 'agent', 'manual', 760, 2600, true, false, true, 'active', NOW() - INTERVAL '40 days'),
  ('Stable Diffusion', 'stable-diffusion', 'Open-source text-to-image model, run locally or via API', 'https://stability.ai', 'image-gen', 'manual', 740, 2400, true, true, true, 'active', NOW() - INTERVAL '90 days'),
  ('Vercel AI SDK', 'vercel-ai-sdk', 'TypeScript library for building AI-powered streaming UIs', 'https://sdk.vercel.ai', 'dev-tool', 'manual', 720, 2200, true, false, true, 'active', NOW() - INTERVAL '10 days'),
  ('Groq', 'groq-api', 'Ultra-fast LLM inference API, 10x faster than competitors', 'https://groq.com', 'llm', 'manual', 700, 2000, false, true, false, 'active', NOW() - INTERVAL '5 days')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO papers (title, slug, summary, abstract, authors, arxiv_id, arxiv_url, pdf_url, categories, tags, hype_score, published_at) VALUES
  (
    'Attention Is All You Need',
    'attention-is-all-you-need',
    'Introduces the Transformer architecture, which uses self-attention mechanisms instead of recurrence. This paper revolutionized NLP and became the foundation of all modern LLMs.',
    'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    ARRAY['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    '1706.03762',
    'https://arxiv.org/abs/1706.03762',
    'https://arxiv.org/pdf/1706.03762',
    ARRAY['cs.CL', 'cs.LG'],
    ARRAY['transformer', 'attention', 'nlp', 'deep-learning'],
    980,
    NOW() - INTERVAL '7 years'
  ),
  (
    'Constitutional AI: Harmlessness from AI Feedback',
    'constitutional-ai-harmlessness',
    'Presents Constitutional AI, a method to train safer AI systems using AI-generated feedback based on a set of principles. Reduces the need for human feedback in safety training.',
    'We propose Constitutional AI (CAI), a new approach to AI alignment that uses AI-generated feedback instead of human feedback.',
    ARRAY['Yuntao Bai', 'Saurav Kadavath', 'Sandipan Kundu'],
    '2212.08073',
    'https://arxiv.org/abs/2212.08073',
    'https://arxiv.org/pdf/2212.08073',
    ARRAY['cs.AI', 'cs.CL'],
    ARRAY['alignment', 'safety', 'rlhf', 'anthropic'],
    850,
    NOW() - INTERVAL '2 years'
  )
ON CONFLICT (arxiv_id) DO NOTHING;

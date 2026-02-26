import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

export interface ToolEnrichment {
  one_liner: string;
  category: 'llm' | 'image-gen' | 'agent' | 'dev-tool' | 'productivity' | 'research' | 'other';
  tags: string[];
  is_free: boolean;
  has_api: boolean;
  is_open_source: boolean;
}

export async function enrichTool(tool: {
  name: string;
  tagline?: string;
  description?: string | null;
  url: string;
  source: string;
}): Promise<ToolEnrichment> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      one_liner: tool.tagline || tool.description || '',
      category: 'other',
      tags: [],
      is_free: false,
      has_api: false,
      is_open_source: false,
    };
  }
  const client = getClient();

  const result = await withRetry(() =>
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Given this AI tool:
Name: ${tool.name}
Description: ${tool.tagline || tool.description || 'N/A'}
URL: ${tool.url}
Source: ${tool.source}

Return JSON with exactly these fields:
- "one_liner": 1 sentence, max 80 chars, what it does
- "category": one of: llm, image-gen, agent, dev-tool, productivity, research, other
- "tags": array of 3-5 lowercase tags
- "is_free": boolean
- "has_api": boolean
- "is_open_source": boolean`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    })
  );

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(result.choices[0].message.content || '{}');
  } catch {
    return {
      one_liner: tool.tagline || tool.description || '',
      category: 'other',
      tags: [],
      is_free: false,
      has_api: false,
      is_open_source: false,
    };
  }
  return {
    one_liner: (raw.one_liner as string) || tool.tagline || '',
    category: (raw.category as ToolEnrichment['category']) || 'other',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    is_free: Boolean(raw.is_free),
    has_api: Boolean(raw.has_api),
    is_open_source: Boolean(raw.is_open_source),
  };
}

export interface PaperEnrichment {
  summary: string;
  tags: string[];
}

export async function enrichPaper(paper: {
  title: string;
  abstract: string;
}): Promise<PaperEnrichment> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: paper.abstract.slice(0, 300),
      tags: [],
    };
  }
  const client = getClient();

  const result = await withRetry(() =>
    client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Given this AI research paper:
Title: ${paper.title}
Abstract: ${paper.abstract.slice(0, 500)}

Return JSON with:
- "summary": 2-sentence plain English summary, what it does and why it matters
- "tags": array of 3-5 lowercase tags`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    })
  );

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(result.choices[0].message.content || '{}');
  } catch {
    return {
      summary: paper.abstract.slice(0, 200),
      tags: [],
    };
  }
  return {
    summary: (raw.summary as string) || paper.abstract.slice(0, 200),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

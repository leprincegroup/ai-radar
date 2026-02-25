import { XMLParser } from 'fast-xml-parser';

const ARXIV_URL =
  `https://export.arxiv.org/api/query?` +
  `search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL` +
  `&sortBy=lastUpdatedDate&sortOrder=descending&max_results=20`;

export interface RawPaper {
  title: string;
  abstract: string;
  authors: string[];
  arxiv_id: string;
  arxiv_url: string;
  pdf_url: string;
  categories: string[];
  published_at: string;
}

export async function fetchLatestPapers(): Promise<RawPaper[]> {
  const res = await fetch(ARXIV_URL, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const result = parser.parse(xml);

  const entries = result?.feed?.entry;
  if (!entries) return [];

  const items = Array.isArray(entries) ? entries : [entries];

  return items.map((entry: any) => {
    const idUrl: string = entry.id ?? '';
    const arxivId = idUrl.split('/abs/')[1]?.replace('v', '') ?? idUrl;

    const authorsRaw = entry.author;
    const authorsArr = Array.isArray(authorsRaw) ? authorsRaw : [authorsRaw];
    const authors = authorsArr.map((a: any) => (typeof a === 'object' ? a.name : a)).filter(Boolean);

    const categoriesRaw = entry.category;
    const catArr = Array.isArray(categoriesRaw) ? categoriesRaw : [categoriesRaw];
    const categories = catArr.map((c: any) => c?.['@_term'] ?? c).filter(Boolean);

    return {
      title: (entry.title ?? '').replace(/\s+/g, ' ').trim(),
      abstract: (entry.summary ?? '').replace(/\s+/g, ' ').trim(),
      authors,
      arxiv_id: arxivId,
      arxiv_url: `https://arxiv.org/abs/${arxivId}`,
      pdf_url: `https://arxiv.org/pdf/${arxivId}`,
      categories,
      published_at: entry.published ?? new Date().toISOString(),
    };
  });
}

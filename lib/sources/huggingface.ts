export interface RawHFItem {
  source_id: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  likes: number;
  tags: string[];
  kind: 'space' | 'model';
  created_at: string;
}

export async function fetchTrendingHFSpaces(): Promise<RawHFItem[]> {
  const items: RawHFItem[] = [];

  try {
    const res = await fetch(
      'https://huggingface.co/api/spaces?sort=trendingScore&direction=-1&limit=20',
      { headers: { 'User-Agent': 'AIRadar/1.0' }, next: { revalidate: 0 } }
    );
    if (res.ok) {
      const spaces = await res.json();
      for (const s of spaces) {
        if (!s.id) continue;
        items.push({
          source_id: `space-${s.id}`,
          name: s.cardData?.title || s.id.split('/').pop() || s.id,
          description:
            s.cardData?.short_description ||
            s.cardData?.tags?.join(', ') ||
            `Hugging Face Space by ${s.author}`,
          url: `https://huggingface.co/spaces/${s.id}`,
          logo_url: null,
          likes: s.likes ?? 0,
          tags: (s.tags ?? []).slice(0, 8),
          kind: 'space',
          created_at: s.createdAt ?? new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('HF spaces fetch error:', err);
  }

  return items;
}

export async function fetchTrendingHFModels(): Promise<RawHFItem[]> {
  const items: RawHFItem[] = [];

  // Fetch trending text-generation + multimodal models created recently
  const filters = ['text-generation', 'text-to-image', 'text-to-speech'];

  for (const filter of filters) {
    try {
      const res = await fetch(
        `https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=10&filter=${filter}`,
        { headers: { 'User-Agent': 'AIRadar/1.0' }, next: { revalidate: 0 } }
      );
      if (!res.ok) continue;
      const models = await res.json();

      for (const m of models) {
        if (!m.id) continue;
        items.push({
          source_id: `model-${m.id}`,
          name: m.cardData?.pretty_name || m.id.split('/').pop() || m.id,
          description:
            m.cardData?.short_description ||
            `Open-source ${filter.replace(/-/g, ' ')} model by ${m.author ?? m.id.split('/')[0]}`,
          url: `https://huggingface.co/${m.id}`,
          logo_url: null,
          likes: m.likes ?? 0,
          tags: (m.tags ?? []).slice(0, 8),
          kind: 'model',
          created_at: m.createdAt ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`HF models (${filter}) fetch error:`, err);
    }
  }

  return items;
}

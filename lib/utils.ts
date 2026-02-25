import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tool, Paper } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function calculateHypeScore(item: Tool | Paper): number {
  const ageHours =
    (Date.now() - new Date(item.created_at).getTime()) / 3600000;
  const agePenalty = Math.pow(ageHours + 2, 1.5);

  let rawScore = 0;

  if ('source' in item) {
    if (item.source === 'producthunt') {
      rawScore = item.upvotes * 2;
    } else if (item.source === 'github') {
      rawScore = item.upvotes * 1.5;
    } else if (item.source === 'huggingface') {
      rawScore = item.upvotes * 3;
    } else if (item.source === 'arxiv') {
      rawScore = (item as any).citation_count * 10 + 50;
    }
  }

  return Math.round((rawScore / agePenalty) * 100);
}

export const CATEGORY_COLORS: Record<string, string> = {
  llm: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'image-gen': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  agent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'dev-tool': 'bg-green-500/20 text-green-300 border-green-500/30',
  productivity: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  research: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export const CATEGORY_LABELS: Record<string, string> = {
  llm: 'LLM',
  'image-gen': 'Image Gen',
  agent: 'Agent',
  'dev-tool': 'Dev Tool',
  productivity: 'Productivity',
  research: 'Research',
  other: 'Other',
};

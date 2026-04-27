import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export function formatDate(d: string): string {
  return format(new Date(d), 'MMM d, yyyy');
}

export function timeAgo(d: string): string {
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function truncate(text: string, n: number): string {
  return text.length <= n ? text : text.slice(0, n) + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function readingTime(body: string): string {
  const words = stripHtml(body).split(' ').length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function isValidUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === 'http:' || p.protocol === 'https:';
  } catch {
    return false;
  }
}

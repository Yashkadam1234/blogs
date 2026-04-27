'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { formatDate, truncate } from '@/lib/utils';
import SafeImage from '@/components/UI/SafeImage';
import type { Post } from '@/types';
import { Search, X, ChevronLeft, ChevronRight, BookOpen, Sparkles, Loader2 } from 'lucide-react';

const PER = 9;

export default function BlogList({ page, q }: { page: number; q: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = (page - 1) * PER;
    const to = from + PER - 1;
    let query = getSupabase()
      .from('posts')
      .select('*, author:users(id,name)', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);

    query.then(({ data, count }) => {
      if (!cancelled) {
        setPosts((data as Post[]) || []);
        setTotal(count || 0);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [page, q]);

  const go = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('page', String(p));
    router.push(`${path}?${params}`);
  };

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    params.set('page', '1');
    router.push(`${path}?${params}`);
  };

  const totalPages = Math.ceil(total / PER);

  return (
    <div>
      <form onSubmit={doSearch} className="flex gap-2 mb-8 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..." className="inp pl-10 pr-8" />
          {search && (
            <button type="button" onClick={() => { setSearch(''); router.push(path); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-4">Search</button>
      </form>

      {q && <p className="mb-5 text-sm text-gray-500 font-mono">{total} result{total !== 1 ? 's' : ''} for &quot;{q}&quot;</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-yellow-700 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No articles found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card group overflow-hidden flex flex-col">
                <div className="aspect-video relative bg-gray-100 overflow-hidden">
                  <SafeImage src={post.image_url} alt={post.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="font-mono text-xs text-gray-400 mb-2">{formatDate(post.created_at)}</p>
                  <h2 className="font-bold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors flex-1 leading-snug">
                    {post.title}
                  </h2>
                  {post.summary && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-yellow-700" />
                        <span className="font-mono text-xs text-yellow-700 uppercase tracking-widest">AI Summary</span>
                      </div>
                      <p className="text-xs text-gray-500 italic line-clamp-3">{truncate(post.summary, 130)}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                      {post.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">{post.author?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => go(page - 1)} disabled={page <= 1}
                className="p-2 border border-gray-200 text-gray-600 hover:border-gray-700 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => go(p)}
                  className={`w-9 h-9 font-mono text-sm transition-colors ${p === page ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-700'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => go(page + 1)} disabled={page >= totalPages}
                className="p-2 border border-gray-200 text-gray-600 hover:border-gray-700 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-center mt-4 font-mono text-xs text-gray-400">
            Showing {(page - 1) * PER + 1}–{Math.min(page * PER, total)} of {total}
          </p>
        </>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getSupabase } from '@/lib/supabase';
import { formatDate, truncate } from '@/lib/utils';
import SafeImage from '@/components/UI/SafeImage';
import { Sparkles, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import type { Post } from '@/types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    getSupabase()
      .from('posts')
      .select('*, author:users(id,name,role)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(7)
      .then(({ data }) => {
        setPosts((data as Post[]) || []);
        setLoading(false);
      });
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1, 7);

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="bg-parchment border-b border-gray-200 py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-4">
              AI-Powered Publishing
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Where great ideas<br />find their voice.
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
              A blogging platform where every post is automatically summarized by Google Gemini AI.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/blog" className="btn-primary">
                Explore Articles <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/register" className="btn-secondary">Start Writing</Link>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-yellow-700 animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <section className="max-w-5xl mx-auto px-4 py-16">
                <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-6">Featured</p>
                <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <SafeImage src={featured.image_url} alt={featured.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-gray-400 mb-3">{formatDate(featured.created_at)}</p>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-yellow-700 transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    {featured.summary && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-700" />
                          <span className="font-mono text-xs uppercase tracking-widest text-yellow-700">AI Summary</span>
                        </div>
                        <p className="text-gray-600 italic text-sm leading-relaxed">{truncate(featured.summary, 200)}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">By {featured.author?.name}</p>
                  </div>
                </Link>
              </section>
            )}

            {posts.length === 0 && (
              <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No articles published yet.</p>
                <Link href="/auth/register" className="btn-primary">Be the first to write</Link>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 pb-20">
                <div className="flex items-center justify-between mb-8">
                  <p className="font-mono text-xs tracking-widest uppercase text-gray-500">Recent Articles</p>
                  <Link href="/blog" className="font-mono text-xs tracking-widest uppercase text-yellow-700 flex items-center gap-1 hover:text-gray-900 transition-colors">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="card group overflow-hidden flex flex-col">
                      <div className="aspect-video relative bg-gray-100 overflow-hidden">
                        <SafeImage src={post.image_url} alt={post.title} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <p className="font-mono text-xs text-gray-400 mb-2">{formatDate(post.created_at)}</p>
                        <h3 className="font-bold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors flex-1 leading-snug">{post.title}</h3>
                        {post.summary && (
                          <p className="text-xs text-gray-500 italic line-clamp-2">{truncate(post.summary, 100)}</p>
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
              </section>
            )}
          </>
        )}

        {/* Features */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-10">Built for Serious Writers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { title: 'AI Summaries', desc: 'Google Gemini auto-generates a 200-word summary for every post — stored once, never re-generated to save costs.' },
                { title: 'Role-Based Access', desc: 'Authors create posts, Viewers read and comment, Admins manage everything including all posts and users.' },
                { title: 'Real-time Comments', desc: 'Comments update live via Supabase real-time subscriptions — no page refresh needed.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border border-gray-700 p-6 hover:border-yellow-500/50 transition-colors">
                  <h3 className="font-bold text-lg mb-3 text-yellow-400">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

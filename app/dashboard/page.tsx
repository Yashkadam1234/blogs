'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types';
import {
  PenLine,
  BookOpen,
  Eye,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!user || fetched.current) return;
    fetched.current = true;

    const isAdmin = user.role === 'admin';

    let q = getSupabase()
      .from('posts')
      .select('*, author:users(id,name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!isAdmin) {
      q = q.eq('author_id', user.id);
    }

    q.then(({ data }) => {
      setPosts((data as Post[]) || []);
      setLoading(false);
    });
  }, [user]);

  // =========================
  // 🔥 FIX HERE (IMPORTANT)
  // Only AUTHOR can write
  // =========================
  const canWrite = user?.role === 'author';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-yellow-700 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-1">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Posts', value: posts.length, show: true },
          { label: 'Role', value: user?.role, show: true },
          { label: 'Status', value: 'Active', show: true },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 p-5"
          >
            <div className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-2">
              {label}
            </div>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          WRITE BUTTON (ONLY AUTHOR)
         ========================= */}
      {canWrite && (
        <div className="mb-8">
          <Link href="/dashboard/new" className="btn-primary gap-2">
            <PenLine className="w-4 h-4" />
            Write New Post
          </Link>
        </div>
      )}

      {/* POSTS SECTION (ONLY AUTHOR VIEW) */}
      {canWrite && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Posts</h2>

            <Link
              href="/dashboard/posts"
              className="font-mono text-xs text-yellow-700 flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white border border-gray-200 p-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 px-5 py-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate text-sm">
                      {post.title}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {formatDate(post.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="btn-secondary py-1.5 px-3 text-xs gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>

                    <Link
                      href={`/dashboard/edit/${post.id}`}
                      className="btn-primary py-1.5 px-3 text-xs gap-1"
                    >
                      <PenLine className="w-3 h-3" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEWER SECTION */}
      {user?.role === 'viewer' && (
        <div className="bg-white border border-gray-200 p-10 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-2">
            You&apos;re a Viewer
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Read and comment on all articles.
          </p>
          <Link href="/blog" className="btn-primary">
            Explore Articles
          </Link>
        </div>
      )}
    </div>
  );
}
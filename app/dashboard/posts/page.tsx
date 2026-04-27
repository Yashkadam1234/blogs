'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types';
import toast from 'react-hot-toast';
import { PenLine, Eye, Trash2, Plus, Loader2, BookOpen, MessageSquare } from 'lucide-react';

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!user || fetched.current) return;
    fetched.current = true;

    // Authors see only their posts | Admins see all posts
    let q = getSupabase()
      .from('posts')
      .select('*, author:users(id,name)')
      .order('created_at', { ascending: false });

    if (user.role === 'author') q = q.eq('author_id', user.id);

    q.then(({ data }) => {
      setPosts((data as Post[]) || []);
      setLoading(false);
    });
  }, [user]);

  const del = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await getSupabase().from('posts').delete().eq('id', id);
    toast.success('Deleted');
    setPosts(p => p.filter(x => x.id !== id));
  };

  const toggle = async (post: Post) => {
    await getSupabase().from('posts').update({ published: !post.published }).eq('id', post.id);
    toast.success(post.published ? 'Unpublished' : 'Published');
    setPosts(p => p.map(x => x.id === post.id ? { ...x, published: !x.published } : x));
  };

  const isAdmin = user?.role === 'admin';
  const isAuthor = user?.role === 'author';
  const canWrite = isAdmin || isAuthor;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-yellow-700 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-1">Content</p>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'All Posts' : isAuthor ? 'My Posts' : 'Articles'}
          </h1>
          {isAdmin && <p className="text-sm text-gray-500 mt-1">Viewing and managing all authors&apos; posts</p>}
          {isAuthor && <p className="text-sm text-gray-500 mt-1">Your published and draft posts</p>}
        </div>
        {canWrite && (
          <Link href="/dashboard/new" className="btn-primary gap-2">
            <Plus className="w-4 h-4" />New Post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No posts yet.</p>
          {canWrite && (
            <Link href="/dashboard/new" className="btn-primary gap-2 inline-flex">
              <Plus className="w-4 h-4" />Write First Post
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50">
              <div className="col-span-5 font-mono text-xs tracking-widest uppercase text-gray-500">Title</div>
              {isAdmin && <div className="col-span-2 font-mono text-xs tracking-widest uppercase text-gray-500 hidden md:block">Author</div>}
              <div className="col-span-2 font-mono text-xs tracking-widest uppercase text-gray-500 hidden md:block">Date</div>
              <div className="col-span-2 font-mono text-xs tracking-widest uppercase text-gray-500">Status</div>
              <div className="col-span-3 font-mono text-xs tracking-widest uppercase text-gray-500 text-right">Actions</div>
            </div>

            {posts.map(post => (
              <div key={post.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-5 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-sm">{post.title}</div>
                  {post.summary && <div className="text-xs text-yellow-700 font-mono mt-0.5">✦ AI summary</div>}
                </div>
                {isAdmin && (
                  <div className="col-span-2 hidden md:block">
                    <span className="text-xs text-gray-500">{post.author?.name}</span>
                  </div>
                )}
                <div className="col-span-2 hidden md:block">
                  <span className="font-mono text-xs text-gray-500">{formatDate(post.created_at)}</span>
                </div>
                <div className="col-span-2">
                  <button onClick={() => toggle(post)}
                    className={`font-mono text-xs px-2 py-1 transition-colors ${post.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {post.published ? 'Live' : 'Draft'}
                  </button>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-1">
                  <Link href={`/blog/${post.slug}`} className="p-2 text-gray-400 hover:text-gray-900 transition-colors" title="View post">
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  {/* Authors edit own, Admins edit any */}
                  {(user?.id === post.author_id || isAdmin) && (
                    <Link href={`/dashboard/edit/${post.id}`} className="p-2 text-gray-400 hover:text-yellow-700 transition-colors" title="Edit post">
                      <PenLine className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {/* Authors delete own, Admins delete any */}
                  {(user?.id === post.author_id || isAdmin) && (
                    <button onClick={() => del(post.id, post.title)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete post">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-gray-400 text-right">
            {posts.length} post{posts.length !== 1 ? 's' : ''} ·{' '}
            {posts.filter(p => p.published).length} live ·{' '}
            {posts.filter(p => !p.published).length} drafts
          </p>
        </>
      )}
    </div>
  );
}

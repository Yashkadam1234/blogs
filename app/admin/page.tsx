'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import { formatDate, timeAgo } from '@/lib/utils';
import type { User, Post, Comment } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Shield, Users, BookOpen, MessageSquare, Trash2, PenLine, Eye, Loader2 } from 'lucide-react';

type Tab = 'posts' | 'comments' | 'users';

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('posts');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) { router.push('/'); return; }
    if (!user || user.role !== 'admin' || fetched.current) return;
    fetched.current = true;

    const sb = getSupabase();
    Promise.all([
      sb.from('users').select('*').order('created_at', { ascending: false }),
      sb.from('posts').select('*, author:users(id,name)').order('created_at', { ascending: false }),
      sb.from('comments').select('*, user:users(id,name)').order('created_at', { ascending: false }).limit(100),
    ]).then(([u, p, c]) => {
      setUsers((u.data as User[]) || []);
      setPosts((p.data as Post[]) || []);
      setComments((c.data as Comment[]) || []);
      setDataLoading(false);
    });
  }, [user, loading, router]);

  const delPost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await getSupabase().from('posts').delete().eq('id', id);
    toast.success('Deleted');
    setPosts(p => p.filter(x => x.id !== id));
  };

  const delComment = async (id: string) => {
    await getSupabase().from('comments').delete().eq('id', id);
    toast.success('Deleted');
    setComments(p => p.filter(x => x.id !== id));
  };

  const setRole = async (uid: string, role: string) => {
    const { error } = await getSupabase().from('users').update({ role }).eq('id', uid);
    if (error) { toast.error('Failed'); return; }
    toast.success('Role updated');
    setUsers(p => p.map(u => u.id === uid ? { ...u, role: role as User['role'] } : u));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-yellow-700 animate-spin" /></div>;
  if (!user || user.role !== 'admin') return null;

  const tabs: { id: Tab; icon: any; label: string; count: number }[] = [
    { id: 'posts', icon: BookOpen, label: 'Posts', count: posts.length },
    { id: 'comments', icon: MessageSquare, label: 'Comments', count: comments.length },
    { id: 'users', icon: Users, label: 'Users', count: users.length },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-parchment">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-gray-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-yellow-700">Control Room</p>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Users', value: users.length },
              { label: 'Posts', value: posts.length },
              { label: 'Comments', value: comments.length },
              { label: 'Authors', value: users.filter(u => u.role === 'author').length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 p-5">
                <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map(({ id, icon: Icon, label, count }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3 font-mono text-xs tracking-widest uppercase border-b-2 -mb-px transition-colors ${tab === id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
                <span className="bg-gray-100 px-1.5 py-0.5 text-xs">{count}</span>
              </button>
            ))}
          </div>

          {dataLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-yellow-700 animate-spin" /></div>
          ) : (
            <>
              {tab === 'posts' && (
                <div className="space-y-2">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-gray-400 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">{post.title}</div>
                        <div className="font-mono text-xs text-gray-400">by {post.author?.name} · {formatDate(post.created_at)}</div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Link href={`/blog/${post.slug}`} className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link href={`/dashboard/edit/${post.id}`} className="p-2 text-gray-400 hover:text-yellow-700 border border-gray-200 transition-colors"><PenLine className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => delPost(post.id)} className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'comments' && (
                <div className="space-y-2">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white border border-gray-200 px-5 py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-800">{c.user?.name}</span>
                          <span className="font-mono text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{c.comment_text}</p>
                      </div>
                      <button onClick={() => delComment(c.id)} className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 flex-shrink-0 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'users' && (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="bg-white border border-gray-200 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-700">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{u.name}</div>
                          <div className="font-mono text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                      <select value={u.role} onChange={e => setRole(u.id, e.target.value)} disabled={u.id === user.id}
                        className="font-mono text-xs border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-700 disabled:opacity-50">
                        <option value="viewer">Viewer</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

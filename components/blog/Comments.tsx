'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { timeAgo } from '@/lib/utils';
import type { Comment } from '@/types';
import toast from 'react-hot-toast';
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';

export default function Comments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const fetched = useRef(false);

  const load = async () => {
    const { data } = await getSupabase()
      .from('comments')
      .select('*, user:users(id,name,role)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    load();

    const ch = getSupabase()
      .channel(`c-${postId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'comments',
        filter: `post_id=eq.${postId}`,
      }, () => load())
      .subscribe();

    return () => { getSupabase().removeChannel(ch); };
  }, [postId]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    const { error } = await getSupabase().from('comments').insert({
      post_id: postId, user_id: user.id, comment_text: text.trim(),
    });
    if (error) toast.error('Failed to post');
    else { toast.success('Posted!'); setText(''); load(); }
    setPosting(false);
  };

  const del = async (id: string) => {
    await getSupabase().from('comments').delete().eq('id', id);
    setComments(p => p.filter(c => c.id !== id));
    toast.success('Deleted');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-yellow-700" />
        <h3 className="text-xl font-bold text-gray-900">Comments</h3>
        <span className="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-1">{comments.length}</span>
      </div>

      {user ? (
        <form onSubmit={post} className="mb-8">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts..." rows={3} maxLength={2000}
            className="inp resize-none mb-2" required />
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-gray-400">{text.length}/2000</span>
            <button type="submit" disabled={posting || !text.trim()} className="btn-primary py-2 px-4 text-xs gap-2">
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-parchment border border-gray-200 text-center">
          <p className="text-gray-600 text-sm mb-3">Sign in to join the discussion</p>
          <div className="flex justify-center gap-3">
            <Link href="/auth/login" className="btn-primary py-2 px-4 text-xs">Sign In</Link>
            <Link href="/auth/register" className="btn-secondary py-2 px-4 text-xs">Register</Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-yellow-700 animate-spin" /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 flex-shrink-0">
                {c.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800">{c.user?.name}</span>
                    <span className="font-mono text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5">{c.user?.role}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  {(user?.id === c.user_id || user?.role === 'admin') && (
                    <button onClick={() => del(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.comment_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

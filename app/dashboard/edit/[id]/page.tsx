'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import Editor from '@/components/blog/Editor';
import SafeImage from '@/components/UI/SafeImage';
import toast from 'react-hot-toast';
import { Save, Trash2, Eye, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { isValidUrl } from '@/lib/utils';
import type { Post } from '@/types';

export default function EditPost() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regen, setRegen] = useState(false);
  const sb = getSupabase();

  useEffect(() => {
    if (!user) return;
    sb.from('posts').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { toast.error('Post not found'); router.push('/dashboard'); return; }
      const p = data as Post;
      if (user.id !== p.author_id && user.role !== 'admin') { toast.error('Not authorized'); router.push('/dashboard'); return; }
      setPost(p);
      setTitle(p.title);
      setBody(p.body);
      setImageUrl(p.image_url || '');
      setPreview(isValidUrl(p.image_url || '') ? (p.image_url || '') : '');
      setLoading(false);
    });
  }, [id, user, router, sb]);

  const handleImage = (url: string) => {
    setImageUrl(url);
    setPreview(isValidUrl(url) ? url : '');
  };

  const save = async () => {
    if (!title.trim() || !body) { toast.error('Title and content required'); return; }
    setSaving(true);
    const { error } = await sb.from('posts').update({ title: title.trim(), body, image_url: imageUrl || null }).eq('id', id);
    if (error) toast.error('Failed to save');
    else toast.success('Saved!');
    setSaving(false);
  };

  const regenSummary = async () => {
    setRegen(true);
    try {
      const r = await fetch('/api/ai/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) });
      const d = await r.json();
      if (d.summary) { await sb.from('posts').update({ summary: d.summary }).eq('id', id); toast.success('Summary regenerated!'); }
    } catch { toast.error('Failed'); }
    setRegen(false);
  };

  const del = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    await sb.from('posts').delete().eq('id', id);
    toast.success('Deleted');
    router.push('/dashboard');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-yellow-700 animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Dashboard
          </Link>
          <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-1">Editing</p>
          <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">{title}</h1>
        </div>
        <div className="flex gap-2">
          {post?.slug && <Link href={`/blog/${post.slug}`} className="btn-secondary gap-2 text-xs"><Eye className="w-3.5 h-3.5" />View</Link>}
          <button onClick={save} disabled={saving} className="btn-primary gap-2 text-xs">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={del} disabled={deleting} className="btn-danger gap-2 text-xs">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="inp text-lg font-semibold" maxLength={200} disabled={saving} />
        </div>

        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Featured Image URL</label>
          <input type="url" value={imageUrl} onChange={e => handleImage(e.target.value)} placeholder="https://..." className="inp" disabled={saving} />
          {preview && (
            <div className="mt-2 relative aspect-video max-h-48 overflow-hidden bg-gray-100">
              <SafeImage src={preview} alt="preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Content *</label>
          <Editor value={body} onChange={setBody} />
        </div>

        <div className="flex items-center justify-between p-4 bg-parchment border border-yellow-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-700" />
            <div>
              <p className="font-mono text-xs text-yellow-700 uppercase tracking-widest">AI Summary</p>
              <p className="text-xs text-gray-500">Regenerate after major edits</p>
            </div>
          </div>
          <button onClick={regenSummary} disabled={regen} className="btn-secondary text-xs gap-2">
            {regen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {regen ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button onClick={del} disabled={deleting} className="btn-danger gap-2"><Trash2 className="w-4 h-4" />Delete Post</button>
          <button onClick={save} disabled={saving} className="btn-primary gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

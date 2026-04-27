'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import { slugify, isValidUrl } from '@/lib/utils';
import Editor from '@/components/blog/Editor';
import SafeImage from '@/components/UI/SafeImage';
import toast from 'react-hot-toast';
import { Save, Eye, Loader2, Sparkles } from 'lucide-react';

export default function NewPost() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('');
  const sb = getSupabase();

  useEffect(() => {
    if (!loading && user && user.role === 'viewer') router.push('/dashboard');
  }, [user, loading, router]);

  const handleImage = (url: string) => {
    setImageUrl(url);
    setPreview(isValidUrl(url) ? url : '');
  };

  const save = async (publish: boolean) => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!body || body === '<p></p>') { toast.error('Content is required'); return; }
    if (!user) return;

    setSaving(true);

    try {
      const slug = `${slugify(title)}-${Date.now()}`;

      // Step 1: Get AI summary FIRST (server-side, won't be cancelled)
      setStep('Generating AI summary...');
      let summary = '';
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), body }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const d = await res.json();
          summary = d.summary || '';
        }
      } catch {
        // AI failed - continue without summary
        summary = '';
      }

      // Step 2: Save post with summary already included
      setStep('Saving post...');
      const { data, error } = await sb.from('posts').insert({
        title: title.trim(),
        body,
        image_url: imageUrl || null,
        author_id: user.id,
        summary,
        slug,
        published: publish,
      }).select().single();

      if (error) throw error;

      toast.success(publish ? 'Published! 🎉' : 'Draft saved!');
      router.push(`/blog/${data.slug}`);

    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
      setStep('');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-yellow-700 animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-1">New Article</p>
          <h1 className="text-3xl font-bold text-gray-900">Write Your Story</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="btn-secondary gap-2 text-xs">
            <Save className="w-3.5 h-3.5" />Draft
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary gap-2 text-xs min-w-[140px] justify-center">
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{step ? step.split(' ')[0] + '...' : 'Saving...'}</>
              : <><Eye className="w-3.5 h-3.5" />Publish</>}
          </button>
        </div>
      </div>

      {/* Progress indicator when saving */}
      {saving && step && (
        <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-yellow-700 animate-spin flex-shrink-0" />
          <p className="font-mono text-xs text-yellow-700">{step}</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Your post title..." className="inp text-lg font-semibold" maxLength={200} disabled={saving} />
          {title && <p className="font-mono text-xs text-gray-400 mt-1">slug: {slugify(title)}</p>}
        </div>

        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Featured Image URL</label>
          <input type="url" value={imageUrl} onChange={e => handleImage(e.target.value)}
            placeholder="https://images.unsplash.com/..." className="inp" disabled={saving} />
          {preview && (
            <div className="mt-2 relative aspect-video max-h-48 overflow-hidden bg-gray-100">
              <SafeImage src={preview} alt="preview" fill className="object-cover" />
              <button onClick={() => { setImageUrl(''); setPreview(''); }}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 font-mono">Remove</button>
            </div>
          )}
        </div>

        <div>
          <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Content *</label>
          <Editor value={body} onChange={setBody} />
        </div>

        <div className="flex items-start gap-3 p-4 bg-parchment border border-yellow-200">
          <Sparkles className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-yellow-700">AI Summary:</span> Google Gemini will generate a ~200-word summary when you publish. This may take up to 15 seconds.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button onClick={() => save(false)} disabled={saving} className="btn-secondary gap-2">
            <Save className="w-4 h-4" />Save Draft
          </button>
          <button onClick={() => save(true)} disabled={saving} className="btn-primary gap-2 min-w-[140px] justify-center">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />{step || 'Saving...'}</>
              : <><Eye className="w-4 h-4" />Publish Post</>}
          </button>
        </div>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getSupabaseServer } from '@/lib/supabase';
import { formatDate, readingTime } from '@/lib/utils';
import SafeImage from '@/components/UI/SafeImage';
import Comments from '@/components/blog/Comments';
import EditBtn from '@/components/blog/EditBtn';
import type { Post } from '@/types';
import { Sparkles } from 'lucide-react';

async function getPost(slug: string): Promise<Post | null> {
  const { data } = await getSupabaseServer().from('posts').select('*, author:users(id,name,role,email)').eq('slug', slug).eq('published', true).single();
  return data as Post | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return { title: post ? `${post.title} — NexBlog` : 'Not Found' };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 bg-gray-900">
          <SafeImage src={post.image_url} alt={post.title} fill className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 pb-8">
            <p className="font-mono text-xs text-gray-400 mb-3">{formatDate(post.created_at)} · {readingTime(post.body)}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{post.title}</h1>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center font-bold text-xs text-white">
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{post.author?.name}</span>
              <span className="text-gray-600">·</span>
              <span className="font-mono text-xs text-gray-400 uppercase">{post.author?.role}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* AI Summary */}
          {post.summary && (
            <div className="mb-10 p-5 bg-parchment border border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-700" />
                <span className="font-mono text-xs uppercase tracking-widest text-yellow-700">AI-Generated Summary</span>
              </div>
              <p className="text-gray-700 italic leading-relaxed">{post.summary}</p>
            </div>
          )}

          {/* Body */}
          <article className="prose-blog" dangerouslySetInnerHTML={{ __html: post.body }} />

          <EditBtn postId={post.id} authorId={post.author_id} />

          <hr className="my-12 border-gray-200" />

          <Comments postId={post.id} />
        </div>
      </main>
    </>
  );
}

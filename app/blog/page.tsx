import Navbar from '@/components/layout/Navbar';
import BlogList from '@/components/blog/BlogList';

export default function BlogPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-10">
            <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-2">Archive</p>
            <h1 className="text-4xl font-bold text-gray-900">All Articles</h1>
          </div>
          <BlogList page={parseInt(searchParams.page || '1')} q={searchParams.q || ''} />
        </div>
      </main>
    </>
  );
}

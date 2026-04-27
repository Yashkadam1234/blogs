import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/blog" className="btn-secondary">Browse Articles</Link>
        </div>
      </div>
    </div>
  );
}

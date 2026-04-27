'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { BookOpen, Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // After 3 seconds, stop showing loading regardless
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const isAdmin = user?.role === 'admin';
  const canWrite = user?.role === 'author' || user?.role === 'admin';
  const showLoading = loading && !forceShow;

  const linkCls = (href: string) => cn(
    'font-mono text-xs tracking-widest uppercase transition-colors',
    pathname.startsWith(href) ? 'text-yellow-700' : 'text-gray-600 hover:text-gray-900'
  );

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">
            Nex<span className="text-yellow-700">Blog</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blog" className={linkCls('/blog')}>Articles</Link>
          {canWrite && <Link href="/dashboard" className={linkCls('/dashboard')}>Dashboard</Link>}
          {isAdmin && (
            <Link href="/admin" className={linkCls('/admin')}>
              <Shield className="w-3 h-3 inline mr-1" />Admin
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {showLoading ? (
            // Small subtle loading — not a full spinner
            <div className="w-16 h-7 bg-gray-100 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono truncate max-w-32">{user.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 font-mono uppercase">{user.role}</span>
              <button onClick={handleSignOut} className="btn-secondary py-1.5 px-3 text-xs">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login" className="btn-secondary py-1.5 px-3">Sign In</Link>
              <Link href="/auth/register" className="btn-primary py-1.5 px-3">Join</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-gray-200 py-3 px-4 space-y-2">
          <Link href="/blog" className="block py-2 font-mono text-xs tracking-widest uppercase text-gray-700" onClick={() => setOpen(false)}>Articles</Link>
          {canWrite && <Link href="/dashboard" className="block py-2 font-mono text-xs tracking-widest uppercase text-gray-700" onClick={() => setOpen(false)}>Dashboard</Link>}
          {isAdmin && <Link href="/admin" className="block py-2 font-mono text-xs tracking-widest uppercase text-gray-700" onClick={() => setOpen(false)}>Admin</Link>}
          {user
            ? <button onClick={handleSignOut} className="block py-2 font-mono text-xs tracking-widest uppercase text-red-600">Sign Out</button>
            : <>
                <Link href="/auth/login" className="block py-2 font-mono text-xs tracking-widest uppercase text-gray-700" onClick={() => setOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="block py-2 font-mono text-xs tracking-widest uppercase text-gray-700" onClick={() => setOpen(false)}>Join</Link>
              </>
          }
        </div>
      )}
    </header>
  );
}

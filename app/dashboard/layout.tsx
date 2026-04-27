'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import {
  BookOpen,
  PenLine,
  LayoutDashboard,
  User,
  LogOut,
  Loader2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && !user && waited) {
      router.push('/auth/login');
    }
  }, [user, loading, router, waited]);

  if (loading && !waited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <Loader2 className="w-7 h-7 text-yellow-700 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <Loader2 className="w-7 h-7 text-yellow-700 animate-spin" />
      </div>
    );
  }

  // =========================
  // ROLE LOGIC
  // =========================
  const isAuthor = user.role === 'author';
  const isAdmin = user.role === 'admin';

  // ❌ IMPORTANT RULE:
  // Admin MUST NOT see New Post or My Posts

  const links = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      show: true,
    },

    // ✅ ONLY AUTHOR → NEW POST
    {
      href: '/dashboard/new',
      label: 'New Post',
      icon: PenLine,
      show: isAuthor,
    },

    // ✅ ONLY AUTHOR → MY POSTS
    {
      href: '/dashboard/posts',
      label: 'My Posts',
      icon: BookOpen,
      show: isAuthor,
    },

    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: User,
      show: true,
    },

    // ADMIN ONLY
    {
      href: '/admin',
      label: 'Admin Panel',
      icon: Shield,
      show: isAdmin,
    },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen flex bg-parchment">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">

        {/* LOGO */}
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-sm">
              Nex<span className="text-yellow-500">Blog</span>
            </span>
          </Link>
        </div>

        {/* USER INFO */}
        <div className="p-4 border-b border-gray-800">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center mb-2">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="text-sm font-semibold truncate">
            {user.name}
          </div>
          <div className="text-xs text-gray-400 uppercase">
            {user.role}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs uppercase font-mono',
                path === href
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Supabase REST API directly — zero SDK, zero locks
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error_description || data.msg || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Manually store session so AuthProvider can read it
      const sessionKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`;
      localStorage.setItem(sessionKey, JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        expires_in: data.expires_in,
        token_type: data.token_type,
        user: data.user,
      }));

      toast.success('Signed in!');
      setTimeout(() => window.location.replace('/dashboard'), 300);

    } catch (err: any) {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex bg-gray-900 text-white p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 border border-white/20 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-lg">Nex<span className="text-yellow-500">Blog</span></span>
        </Link>
        <blockquote className="text-3xl font-bold leading-tight">
          &quot;The scariest moment is always just before you start.&quot;
          <footer className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-4 font-normal">
            — Stephen King
          </footer>
        </blockquote>
        <div />
      </div>

      <div className="flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-2">Welcome back</p>
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="inp"
                autoComplete="email" disabled={loading} />
            </div>
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" className="inp pr-12" disabled={loading} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 gap-2 disabled:opacity-60">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link href="/auth/register" className="text-yellow-700 hover:text-gray-900">Create one</Link>
          </p>
          <div className="mt-3 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-700">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

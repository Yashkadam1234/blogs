'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BookOpen, Loader2 } from 'lucide-react';
import type { Role } from '@/types';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setLoading(true);

    try {
      // Sign up via REST API directly
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            email,
            password,
            data: { name, role },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || data.error_description || 'Registration failed');
        setLoading(false);
        return;
      }

      // If we got a session back (email confirm disabled), log them in
      if (data.access_token) {
        const sessionKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`;
        localStorage.setItem(sessionKey, JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
          expires_in: data.expires_in,
          token_type: data.token_type,
          user: data.user,
        }));
        toast.success('Account created!');
        setTimeout(() => window.location.replace('/dashboard'), 300);
      } else {
        // Email confirmation required
        toast.success('Check your email to confirm your account!');
        setLoading(false);
      }

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
          &quot;Start writing, no matter what.&quot;
          <footer className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-4 font-normal">
            — Louis L&apos;Amour
          </footer>
        </blockquote>
        <div />
      </div>

      <div className="flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-2">New account</p>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                required placeholder="Jane Doe" className="inp" disabled={loading} />
            </div>
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="inp"
                autoComplete="email" disabled={loading} />
            </div>
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Min. 6 characters" className="inp" disabled={loading} />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-gray-600 mb-3">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['viewer', 'Viver', 'Browse and comment'],
                  ['author', 'Author', 'Create blog posts'],
                ] as const).map(([v, l, d]) => (
                  <button key={v} type="button" onClick={() => setRole(v)}
                    className={`text-left p-4 border transition-all ${
                      role === v
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}>
                    <div className="font-bold text-sm mb-1">{l}</div>
                    <div className={`text-xs ${role === v ? 'text-gray-300' : 'text-gray-500'}`}>{d}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 gap-2 disabled:opacity-60">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Have an account?{' '}
            <Link href="/auth/login" className="text-yellow-700 hover:text-gray-900">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

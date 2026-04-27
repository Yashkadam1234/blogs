'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User } from '@/types';

interface Ctx {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<Ctx>({
  user: null, loading: true,
  signOut: async () => {}, refresh: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

// Get session token from localStorage — works with both SDK and manual storage
function getStoredSession(): { access_token: string; user: any } | null {
  try {
    // Find any supabase auth key in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth-token') || key.includes('supabase'))) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.access_token) return parsed;
          // SDK wraps it differently
          if (parsed?.currentSession?.access_token) return parsed.currentSession;
        }
      }
    }
  } catch {}
  return null;
}

async function fetchProfile(accessToken: string, userId: string): Promise<User | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
}

function sessionToUser(sessionUser: any): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
    role: sessionUser.user_metadata?.role || 'viewer',
    created_at: sessionUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const loadUser = async () => {
    try {
      const session = getStoredSession();
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to get full profile from DB
      const profile = await fetchProfile(session.access_token, session.user.id);
      setUser(profile || sessionToUser(session.user));
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadUser();
  }, []);

  const signOut = async () => {
    // Clear all supabase keys from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth-token') || key.includes('supabase') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Also call Supabase signout via REST
    try {
      const session = getStoredSession();
      if (session?.access_token) {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
      }
    } catch {}

    setUser(null);
    window.location.replace('/');
  };

  const refresh = async () => {
    await loadUser();
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signOut, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

declare global { interface Window { _sb: SupabaseClient } }

// Get stored access token for authenticated requests
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?.access_token || parsed?.currentSession?.access_token || null;
        }
      }
    }
  } catch {}
  return null;
}

export function getSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createClient(SUPA_URL, SUPA_ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  if (!window._sb) {
    window._sb = createClient(SUPA_URL, SUPA_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // We handle this manually
        detectSessionInUrl: false,
        // Bypass navigator.locks completely
        lock: async (_n: string, _t: number, fn: () => Promise<any>) => fn(),
      },
    });
  }
  return window._sb;
}

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(SUPA_URL, SUPA_SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseServer(): SupabaseClient {
  return createClient(SUPA_URL, SUPA_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

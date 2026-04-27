'use client';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSupabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Save, Key, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const sb = getSupabase();

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSaving(true);
    const { error } = await sb.from('users').update({ name: name.trim() }).eq('id', user.id);
    if (error) toast.error('Failed to update');
    else { toast.success('Profile updated!'); await refresh(); }
    setSaving(false);
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Min 6 characters'); return; }
    setChangingPw(true);
    const { error } = await sb.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); setPassword(''); }
    setChangingPw(false);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-widest uppercase text-yellow-700 mb-1">Account</p>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900">{user?.name}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
          <div className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 mt-1 inline-block uppercase">{user?.role}</div>
        </div>
      </div>

      {/* Name form */}
      <form onSubmit={saveName} className="bg-white border border-gray-200 p-5 mb-5">
        <h2 className="font-bold text-gray-900 mb-4">Display Name</h2>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="inp mb-4" maxLength={100} />
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Name'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={changePw} className="bg-white border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 6 chars)" className="inp mb-4" minLength={6} />
        <button type="submit" disabled={changingPw || password.length < 6} className="btn-secondary gap-2">
          {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          {changingPw ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

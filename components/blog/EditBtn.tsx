'use client';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { PenLine } from 'lucide-react';

export default function EditBtn({ postId, authorId }: { postId: string; authorId: string }) {
  const { user } = useAuth();
  if (!user || (user.id !== authorId && user.role !== 'admin')) return null;
  return (
    <div className="mt-8 flex justify-end">
      <Link href={`/dashboard/edit/${postId}`} className="btn-secondary gap-2 text-xs">
        <PenLine className="w-3.5 h-3.5" />Edit Post
      </Link>
    </div>
  );
}

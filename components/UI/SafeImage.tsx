'use client';
import Image from 'next/image';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { isValidUrl } from '@/lib/utils';

interface Props {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
}

const Fallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <BookOpen className="w-10 h-10 text-gray-300" />
  </div>
);

export default function SafeImage({ src, alt, fill, className }: Props) {
  const [err, setErr] = useState(false);

  // Show fallback if: no src, invalid URL, or image failed to load
  if (!src || !isValidUrl(src) || err) return <Fallback />;

  // Only allow actual image file extensions or known image CDNs
  // If URL ends in .html or has no image extension, skip next/image
  const lowerSrc = src.toLowerCase();
  const isLikelyImage =
    lowerSrc.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)(\?.*)?$/) ||
    lowerSrc.includes('images.unsplash.com') ||
    lowerSrc.includes('imgur.com') ||
    lowerSrc.includes('cloudinary.com') ||
    lowerSrc.includes('githubusercontent.com') ||
    lowerSrc.includes('pexels.com') ||
    lowerSrc.includes('pixabay.com') ||
    lowerSrc.includes('supabase.co/storage');

  if (!isLikelyImage) return <Fallback />;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setErr(true)}
      unoptimized
    />
  );
}

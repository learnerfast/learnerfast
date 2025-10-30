'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function LazyImage({ src, alt, className, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {!loaded && (
        <div className={`absolute inset-0 bg-muted animate-pulse ${className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}

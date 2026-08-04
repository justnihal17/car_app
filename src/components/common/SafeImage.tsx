import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEAD_URLS = [
  'example.com/profile.jpg',
  'e91tprhei2dwfjnnt3qv.png',
  'kehrsxb6cbzrmpwfwlza.png'
];

export function SafeImage({ 
  src, 
  alt = '', 
  fallbackSrc = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image', 
  allowBlob = false,
  ...props 
}: SafeImageProps & { allowBlob?: boolean }) {
  const isDead = src ? DEAD_URLS.some(dead => src.includes(dead)) || (!allowBlob && src.startsWith('blob:')) : false;
  const [imgSrc, setImgSrc] = useState<string | undefined>(isDead ? fallbackSrc : src);

  useEffect(() => {
    const checkDead = src ? DEAD_URLS.some(dead => src.includes(dead)) || (!allowBlob && src.startsWith('blob:')) : false;
    setImgSrc(checkDead ? fallbackSrc : src);
  }, [src, allowBlob]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}

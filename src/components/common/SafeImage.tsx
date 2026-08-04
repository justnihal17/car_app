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
  fallbackSrc = '', 
  allowBlob = false,
  onError,
  ...props 
}: SafeImageProps & { allowBlob?: boolean }) {
  const isDead = !src || DEAD_URLS.some(dead => src.includes(dead)) || (!allowBlob && src.startsWith('blob:'));
  const [imgSrc, setImgSrc] = useState<string | undefined>(isDead ? (fallbackSrc || undefined) : src);
  const [hasError, setHasError] = useState(isDead);

  useEffect(() => {
    const checkDead = !src || DEAD_URLS.some(dead => src.includes(dead)) || (!allowBlob && src.startsWith('blob:'));
    setHasError(checkDead);
    setImgSrc(checkDead ? (fallbackSrc || undefined) : src);
  }, [src, allowBlob, fallbackSrc]);

  if (hasError && !fallbackSrc) {
    return null;
  }

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={(e) => {
        setHasError(true);
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setImgSrc(undefined);
        }
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}

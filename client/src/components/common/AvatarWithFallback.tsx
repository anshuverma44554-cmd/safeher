import React, { useState } from 'react';

interface AvatarWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  fallbackSrc?: string;
  className?: string;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt = 'User avatar',
  name,
  fallbackSrc = '/avatars/default-guardian.svg',
  className = 'w-10 h-10 rounded-full object-cover',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'SH';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  // If both original src and fallbackSrc fail, render colored circle with initials
  if (hasError && (!imgSrc || imgSrc === fallbackSrc)) {
    const initials = getInitials(name || alt);
    return (
      <div
        className={`inline-flex items-center justify-center font-bold text-white bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/40 select-none shadow-sm ${className}`}
        aria-label={alt}
        role="img"
      >
        <span className="text-[11px] tracking-wider">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...rest}
    />
  );
};


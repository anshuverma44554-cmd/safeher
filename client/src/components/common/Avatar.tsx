import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  alt?: string;
  className?: string;
  sizeClass?: string;
}

// Generate a consistent, attractive gradient background based on the person's name
function getGradientByName(name: string): string {
  const gradients = [
    'from-purple-600 to-indigo-600',
    'from-pink-600 to-rose-600',
    'from-emerald-600 to-teal-700',
    'from-blue-600 to-cyan-600',
    'from-amber-600 to-orange-600',
    'from-violet-600 to-purple-800',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  alt,
  className = '',
  sizeClass = 'w-10 h-10',
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute initials (e.g., "Sunita Rao" -> "SR", "Priya" -> "P")
  const displayName = name || alt || 'User';
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SH';

  const gradient = getGradientByName(displayName);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt || displayName}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  // Fallback: Initial badge with WCAG AA high-contrast white text on rich gradient
  return (
    <div
      role="img"
      aria-label={displayName}
      title={displayName}
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradient} text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm border border-white/20 select-none ${className}`}
      style={{
        fontSize: 'clamp(0.65rem, 40%, 1rem)',
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  );
};

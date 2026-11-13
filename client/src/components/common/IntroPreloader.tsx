import React, { useState, useEffect } from 'react';
import './IntroPreloader.css';

interface IntroPreloaderProps {
  /** Force show regardless of sessionStorage (useful for testing or dedicated previews) */
  forceShow?: boolean;
  /** Callback fired when the preloader completely finishes and disappears */
  onComplete?: () => void;
}

export const IntroPreloader: React.FC<IntroPreloaderProps> = ({
  forceShow = false,
  onComplete,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if intro has already been seen in this session, unless forced or preview param is in URL
    const hasSeenIntro = sessionStorage.getItem('safeher_intro_seen') === 'true';
    const isUrlOverride =
      typeof window !== 'undefined' &&
      (window.location.search.includes('intro=true') ||
        window.location.search.includes('preview=intro') ||
        window.location.hash.includes('intro'));

    if (!forceShow && hasSeenIntro && !isUrlOverride) {
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setShouldRender(true);

    // Lock page scrolling while preloader is visible
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // If reduced motion is requested, finish quickly (400ms)
    const activeDuration = prefersReducedMotion ? 400 : 2550;
    const exitDuration = prefersReducedMotion ? 200 : 700;

    let exitTimeout: ReturnType<typeof setTimeout>;
    let completeTimeout: ReturnType<typeof setTimeout>;

    // Trigger exit animation
    exitTimeout = setTimeout(() => {
      setIsExiting(true);

      // Restore scrolling as curtain slides up
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      completeTimeout = setTimeout(() => {
        setShouldRender(false);
        sessionStorage.setItem('safeher_intro_seen', 'true');
        if (onComplete) onComplete();
      }, exitDuration);
    }, activeDuration);

    // Escape key to skip intro immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(exitTimeout);
      clearTimeout(completeTimeout);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceShow, onComplete]);

  const skipIntro = () => {
    setIsExiting(true);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    setTimeout(() => {
      setShouldRender(false);
      sessionStorage.setItem('safeher_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 300);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`safeher-preloader-root ${isExiting ? 'is-exiting' : ''}`}
      role="status"
      aria-label="SafeHer Intro Animation"
      aria-live="polite"
      aria-hidden={isExiting}
    >
      {/* Ambient Radial Background Glow */}
      <div className="safeher-preloader-glow" aria-hidden="true" />

      {/* Skip button for accessibility */}
      <button
        type="button"
        onClick={skipIntro}
        className="safeher-skip-btn"
        aria-label="Skip intro animation"
      >
        Skip ✕
      </button>

      {/* Central Brand Animation */}
      <div className="safeher-preloader-content">
        
        {/* Shield Icon with Stroke-Draw and Pulsing Heart */}
        <div className="safeher-shield-box">
          <div className="safeher-radar-ring" aria-hidden="true" />
          
          <svg
            className="safeher-svg-shield"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="shBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Classical Security Shield Contour */}
            <path
              d="M 50 12 L 86 26 C 86 60 50 86 50 86 C 50 86 14 60 14 26 Z"
              className="safeher-shield-stroke"
            />
          </svg>

          {/* Heart / Location Beacon inside Shield Center */}
          <div className="safeher-center-heart" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f472b6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                fill="url(#shBrandGradient)"
              />
            </svg>
          </div>
        </div>

        {/* Brand Title: SafeHer */}
        <h1 className="safeher-brand-title">
          <span className="safeher-title-safe">Safe</span>
          <span className="safeher-title-her">Her</span>
        </h1>

        {/* Tagline */}
        <p className="safeher-tagline">
          Travel Freely. Stay Safely.
        </p>

        {/* Glowing Progress Track */}
        <div className="safeher-progress-track" aria-hidden="true">
          <div className="safeher-progress-fill" />
        </div>

      </div>
    </div>
  );
};


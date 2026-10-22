import React, { useState } from 'react';

interface StarLogoProps {
  className?: string;
  size?: number;
  src?: string;
  alt?: string;
  useSvgOnly?: boolean;
}

export const StarLogo: React.FC<StarLogoProps> = ({ 
  className = 'w-8 h-8', 
  size = 32,
  src = '/assets/aistudio/Logo_Little_Star_Learning_-_full_color_e3de3950.png',
  alt = 'Little Star School Pamekasan Logo',
  useSvgOnly = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // If not forcing SVG and image hasn't errored, render high-fidelity brand logo image
  if (!useSvgOnly && !imgError && src) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`object-contain rounded-full shadow-xs shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  // Graceful SVG fallback with cheerful star matching brand colors
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft warm glow */}
      <circle cx="24" cy="24" r="22" fill="#FEF3C7" opacity="0.6" />
      {/* Friendly 5-pointed star in Little Star warm golden amber */}
      <path
        d="M24 6L29.56 17.27L42 19.08L33 27.85L35.12 40.24L24 34.39L12.88 40.24L15 27.85L6 19.08L18.44 17.27L24 6Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Cute friendly face features */}
      <circle cx="19.5" cy="22.5" r="2" fill="#78350F" />
      <circle cx="28.5" cy="22.5" r="2" fill="#78350F" />
      {/* Gentle smile */}
      <path
        d="M20 27.5C21.2 29 22.5 29.5 24 29.5C25.5 29.5 26.8 29 28 27.5"
        stroke="#78350F"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Soft pink cheeks */}
      <circle cx="16.5" cy="25.5" r="2" fill="#FCA5A5" opacity="0.75" />
      <circle cx="31.5" cy="25.5" r="2" fill="#FCA5A5" opacity="0.75" />
    </svg>
  );
};

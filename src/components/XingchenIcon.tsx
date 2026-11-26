import React from "react";

interface XingchenIconProps {
  size?: number;
  className?: string;
}

const XingchenIcon = ({ size = 56, className }: XingchenIconProps) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className} role="img" aria-label="星辰云">
    <defs>
      <linearGradient id="xc-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2A2F9E" />
        <stop offset="0.55" stopColor="#4B35C8" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
      <radialGradient id="xc-glow" cx="0.62" cy="0.4" r="0.5">
        <stop offset="0" stopColor="#A5B4FC" stopOpacity="0.55" />
        <stop offset="1" stopColor="#A5B4FC" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="xc-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="xc-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0B0A3A" stopOpacity="0" />
        <stop offset="1" stopColor="#0B0A3A" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id="xc-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="xc-f1" gradientUnits="userSpaceOnUse" x1="96" y1="268" x2="416" y2="126">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#DDE3FF" />
      </linearGradient>
      <linearGradient id="xc-f2" gradientUnits="userSpaceOnUse" x1="416" y1="126" x2="300" y2="400">
        <stop offset="0" stopColor="#C9D0FF" />
        <stop offset="1" stopColor="#8B93F4" />
      </linearGradient>
      <linearGradient id="xc-f3" gradientUnits="userSpaceOnUse" x1="204" y1="302" x2="230" y2="382">
        <stop offset="0" stopColor="#5E52E6" />
        <stop offset="1" stopColor="#372CAE" />
      </linearGradient>
      <linearGradient id="xc-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FEF3C7" />
        <stop offset="0.5" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="xc-blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="xc-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <clipPath id="xc-clip">
        <rect width="512" height="512" rx="112" />
      </clipPath>
    </defs>
    <g clipPath="url(#xc-clip)">
      <rect width="512" height="512" fill="url(#xc-bg)" />
      <rect width="512" height="512" fill="url(#xc-glow)" />
      <ellipse cx="300" cy="260" rx="190" ry="150" fill="#818CF8" opacity="0.35" filter="url(#xc-blur)" />
      <ellipse cx="256" cy="-50" rx="340" ry="200" fill="url(#xc-gloss)" />
      <rect y="360" width="512" height="152" fill="url(#xc-shade)" />
    </g>
    <rect x="3" y="3" width="506" height="506" rx="109" fill="none" stroke="url(#xc-rim)" strokeWidth="5" />
    <polygon points="96,268 416,126 318,414 256,332 214,382 204,302" transform="translate(24 46)" fill="#0B0A3A" opacity="0.5" filter="url(#xc-blur)" />
    <path d="M60 424 Q150 414 204 384" fill="none" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" strokeDasharray="2 22" opacity="0.8" filter="url(#xc-soft)" />
    <path d="M60 424 Q150 414 204 384" fill="none" stroke="url(#xc-gold)" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 22" />
    <polygon points="96,268 416,126 204,302" fill="url(#xc-f1)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="416,126 318,414 256,332 204,302" fill="url(#xc-f2)" stroke="#E0E7FF" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="204,302 256,332 214,382" fill="url(#xc-f3)" stroke="#7C74F0" strokeWidth="2" strokeLinejoin="round" />
    <line x1="204" y1="302" x2="416" y2="126" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    <path d="M112 110 Q116 136 142 140 Q116 144 112 170 Q108 144 82 140 Q108 136 112 110Z" fill="#FBBF24" opacity="0.9" filter="url(#xc-soft)" />
    <path d="M112 110 Q116 136 142 140 Q116 144 112 170 Q108 144 82 140 Q108 136 112 110Z" fill="url(#xc-gold)" />
    <circle cx="196" cy="82" r="5" fill="#E0E7FF" />
    <circle cx="440" cy="404" r="5" fill="#C7D2FE" />
    <circle cx="458" cy="236" r="4" fill="#C7D2FE" />
    <circle cx="70" cy="330" r="3.5" fill="#C7D2FE" />
  </svg>
);

export default XingchenIcon;

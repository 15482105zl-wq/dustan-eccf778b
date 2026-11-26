import React from "react";

interface LingyunIconProps {
  size?: number;
  className?: string;
}

// 凌云图标：与星辰云图标同款做法（蓝紫渐变圆角底 + 高光 + 金色星星），
// 前景换成白色云朵（凌云就是云）。凌云官网没有 logo（后台 logo 为空），所以现设计。
const LingyunIcon = ({ size = 56, className }: LingyunIconProps) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className} role="img" aria-label="凌云">
    <defs>
      <linearGradient id="ly-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2A2F9E" />
        <stop offset="0.55" stopColor="#4B35C8" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
      <radialGradient id="ly-glow" cx="0.62" cy="0.4" r="0.5">
        <stop offset="0" stopColor="#A5B4FC" stopOpacity="0.55" />
        <stop offset="1" stopColor="#A5B4FC" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ly-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ly-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0B0A3A" stopOpacity="0" />
        <stop offset="1" stopColor="#0B0A3A" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id="ly-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="ly-cloud" gradientUnits="userSpaceOnUse" x1="150" y1="230" x2="360" y2="370">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#DDE3FF" />
      </linearGradient>
      <linearGradient id="ly-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FEF3C7" />
        <stop offset="0.5" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="ly-blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="ly-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <clipPath id="ly-clip">
        <rect width="512" height="512" rx="112" />
      </clipPath>
      <clipPath id="ly-cloud-clip">
        <circle cx="175" cy="305" r="60" />
        <circle cx="255" cy="245" r="85" />
        <circle cx="340" cy="305" r="55" />
        <rect x="150" y="295" width="210" height="70" rx="35" />
      </clipPath>
    </defs>
    <g clipPath="url(#ly-clip)">
      <rect width="512" height="512" fill="url(#ly-bg)" />
      <rect width="512" height="512" fill="url(#ly-glow)" />
      <ellipse cx="300" cy="260" rx="190" ry="150" fill="#818CF8" opacity="0.35" filter="url(#ly-blur)" />
      <ellipse cx="256" cy="-50" rx="340" ry="200" fill="url(#ly-gloss)" />
      <rect y="360" width="512" height="152" fill="url(#ly-shade)" />
    </g>
    <rect x="3" y="3" width="506" height="506" rx="109" fill="none" stroke="url(#ly-rim)" strokeWidth="5" />
    <ellipse cx="260" cy="382" rx="125" ry="20" fill="#0B0A3A" opacity="0.45" filter="url(#ly-blur)" />
    <g clipPath="url(#ly-cloud-clip)">
      <circle cx="175" cy="305" r="60" fill="url(#ly-cloud)" />
      <circle cx="255" cy="245" r="85" fill="url(#ly-cloud)" />
      <circle cx="340" cy="305" r="55" fill="url(#ly-cloud)" />
      <rect x="150" y="295" width="210" height="70" rx="35" fill="url(#ly-cloud)" />
      <ellipse cx="260" cy="360" rx="120" ry="26" fill="#8B93F4" opacity="0.3" />
    </g>
    <path d="M430 96 Q434 122 460 126 Q434 130 430 156 Q426 130 400 126 Q426 122 430 96Z" fill="#FBBF24" opacity="0.9" filter="url(#ly-soft)" />
    <path d="M430 96 Q434 122 460 126 Q434 130 430 156 Q426 130 400 126 Q426 122 430 96Z" fill="url(#ly-gold)" />
    <circle cx="120" cy="110" r="5" fill="#E0E7FF" />
    <circle cx="440" cy="420" r="5" fill="#C7D2FE" />
    <circle cx="80" cy="400" r="4" fill="#C7D2FE" />
    <circle cx="70" cy="200" r="3.5" fill="#C7D2FE" />
  </svg>
);

export default LingyunIcon;

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 64 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logo_grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#60A5FA" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="20" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Orb */}
    <circle cx="256" cy="256" r="256" fill="url(#logo_grad)" />
    
    {/* Swirling Aperture / Aura Lines */}
    <g stroke="white" strokeWidth="12" strokeOpacity="0.3" strokeLinecap="round" fill="none">
       {/* 8 Rotated curves to form aperture */}
       <path d="M256 256 Q 360 120 480 256" transform="rotate(0 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(45 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(90 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(135 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(180 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(225 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(270 256 256)" />
       <path d="M256 256 Q 360 120 480 256" transform="rotate(315 256 256)" />
    </g>
    
    {/* Center Glow */}
    <circle cx="256" cy="256" r="60" fill="white" fillOpacity="0.9" filter="url(#glow)" />
    <circle cx="256" cy="256" r="45" fill="white" />
  </svg>
);

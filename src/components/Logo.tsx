import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // Ukuran icon
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  // Ukuran typography
  const textSizes = {
    sm: { title: 'text-base', subtitle: 'text-[9px]' },
    md: { title: 'text-lg', subtitle: 'text-[10px]' },
    lg: { title: 'text-xl', subtitle: 'text-xs' },
    xl: { title: 'text-2xl', subtitle: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Graphic: Harmonisasi Atap Rumah/Joglo + Pin Lokasi + Huruf K */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 p-0.5 shadow-md shadow-orange-700/20 flex items-center justify-center overflow-hidden shrink-0 group`}>
        {/* Subtle glow / highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 pointer-events-none" />

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Siluet Atap Kost / Rumah Khas Solo */}
          <path
            d="M24 6L6 20H12V38C12 39.1046 12.8954 40 14 40H34C35.1046 40 36 39.1046 36 38V20H42L24 6Z"
            fill="white"
            fillOpacity="0.18"
          />
          {/* Garis Atap Utama */}
          <path
            d="M24 8L8 21H13V38C13 38.5523 13.4477 39 14 39H34C34.5523 39 35 38.5523 35 38V21H40L24 8Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Aksen Jendela / Huruf K Stylized */}
          <path
            d="M21 21V33M21 27L29 21M23.5 25L29 33"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pin Lokasi Kecil / Golden Spark di Puncak Atap */}
          <circle cx="24" cy="7" r="2.5" fill="#FEF08A" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes.title}`}>
            Info Kost <span className="text-orange-700">Solo</span>
          </span>
          <span className={`uppercase font-bold tracking-widest text-slate-600 -mt-0.5 ${textSizes.subtitle}`}>
            Surakarta Kost Network
          </span>
        </div>
      )}
    </div>
  );
}

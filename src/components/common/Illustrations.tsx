import React from 'react';

export const HeroStarIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-amber-50/50 to-emerald-50 border border-amber-100/60 p-6 sm:p-8 flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[380px] drop-shadow-sm"
      >
        {/* Soft decorative cloud/blobs */}
        <ellipse cx="300" cy="350" rx="260" ry="60" fill="#E0F2FE" />
        <circle cx="110" cy="120" r="45" fill="#FEF08A" opacity="0.4" />
        <circle cx="500" cy="140" r="55" fill="#BBF7D0" opacity="0.4" />
        
        {/* Soft pastel rainbow arc */}
        <path
          d="M 120 320 A 180 180 0 0 1 480 320"
          stroke="#BAE6FD"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 140 320 A 160 160 0 0 1 460 320"
          stroke="#FEF08A"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 160 320 A 140 140 0 0 1 440 320"
          stroke="#BBF7D0"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Happy Little Star */}
        <g transform="translate(230, 80)">
          {/* Outer glow */}
          <circle cx="70" cy="70" r="75" fill="#FEF3C7" opacity="0.8" />
          {/* Star Shape */}
          <path
            d="M 70 10 L 87 50 L 130 54 L 98 84 L 106 126 L 70 104 L 34 126 L 42 84 L 10 54 L 53 50 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Eyes with cheerful spark */}
          <circle cx="56" cy="66" r="5" fill="#451A03" />
          <circle cx="84" cy="66" r="5" fill="#451A03" />
          <circle cx="58" cy="64" r="1.5" fill="#FFFFFF" />
          <circle cx="86" cy="64" r="1.5" fill="#FFFFFF" />
          {/* Pink Cheeks */}
          <ellipse cx="48" cy="74" rx="5" ry="3.5" fill="#F87171" opacity="0.7" />
          <ellipse cx="92" cy="74" rx="5" ry="3.5" fill="#F87171" opacity="0.7" />
          {/* Broad smile */}
          <path
            d="M 58 76 Q 70 88 82 76"
            stroke="#451A03"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Sensory Wooden Building Blocks */}
        {/* Block 1 (Blue) */}
        <rect x="180" y="270" width="55" height="55" rx="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
        <circle cx="207" cy="297" r="12" fill="#E0F2FE" />
        <text x="207" y="302" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0369A1">A</text>

        {/* Block 2 (Mint Green Triangle roof) */}
        <polygon points="265,220 235,270 295,270" fill="#4ADE80" stroke="#16A34A" strokeWidth="2.5" />
        
        {/* Block 3 (Yellow Square) */}
        <rect x="235" y="270" width="60" height="55" rx="10" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
        <text x="265" y="303" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#854D0E">★</text>

        {/* Block 4 (Coral/Peach Cube) */}
        <rect x="295" y="270" width="55" height="55" rx="10" fill="#FB923C" stroke="#EA580C" strokeWidth="2.5" />
        <text x="322" y="302" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#9A3412">B</text>

        {/* Block 5 (Lavender arch) */}
        <rect x="350" y="270" width="55" height="55" rx="10" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2.5" />
        <text x="377" y="302" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#5B21B6">K</text>

        {/* Playful Floating Stars */}
        <path d="M 120 180 L 126 195 L 142 196 L 130 207 L 133 222 L 120 214 L 107 222 L 110 207 L 98 196 L 114 195 Z" fill="#FCD34D" opacity="0.9" />
        <path d="M 470 190 L 475 203 L 489 204 L 478 213 L 481 226 L 470 219 L 459 226 L 462 213 L 451 204 L 465 203 Z" fill="#67E8F9" opacity="0.9" />
        <path d="M 430 110 L 434 120 L 445 121 L 437 128 L 439 138 L 430 133 L 421 138 L 423 128 L 415 121 L 426 120 Z" fill="#86EFAC" opacity="0.8" />
        <path d="M 170 120 L 174 130 L 185 131 L 177 138 L 179 148 L 170 143 L 161 148 L 163 138 L 155 131 L 166 130 Z" fill="#FCA5A5" opacity="0.8" />
      </svg>
    </div>
  );
};

export const PlayObservationIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50/40 border border-emerald-100 p-6 flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[260px]"
      >
        {/* Warm round stage */}
        <ellipse cx="200" cy="240" rx="160" ry="40" fill="#DCFCE7" />
        
        {/* Clipboard with observation rubric */}
        <rect x="80" y="60" width="120" height="170" rx="12" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
        {/* Clip */}
        <rect x="115" y="48" width="50" height="20" rx="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
        {/* Lines representing observation criteria */}
        <line x1="100" y1="90" x2="180" y2="90" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="115" x2="170" y2="115" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="135" x2="160" y2="135" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="155" x2="175" y2="155" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        {/* Checkmarks */}
        <circle cx="102" cy="180" r="5" fill="#22C55E" />
        <line x1="115" y1="180" x2="170" y2="180" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        <circle cx="102" cy="200" r="5" fill="#22C55E" />
        <line x1="115" y1="200" x2="165" y2="200" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

        {/* Magnifying Glass with glowing warm star */}
        <g transform="translate(190, 80)">
          <circle cx="70" cy="70" r="45" fill="#FEF9C3" stroke="#D97706" strokeWidth="5" />
          <line x1="102" y1="102" x2="145" y2="145" stroke="#B45309" strokeWidth="9" strokeLinecap="round" />
          {/* Star inside glass */}
          <path
            d="M 70 45 L 75 60 L 90 62 L 78 72 L 82 87 L 70 78 L 58 87 L 62 72 L 50 62 L 65 60 Z"
            fill="#F59E0B"
          />
          {/* Sparkles */}
          <circle cx="85" cy="50" r="3" fill="#38BDF8" />
          <circle cx="55" cy="80" r="2.5" fill="#4ADE80" />
        </g>

        {/* Sensory Shape Sorter & Soft Toy */}
        <g transform="translate(240, 190)">
          {/* Soft ball */}
          <circle cx="45" cy="40" r="24" fill="#F472B6" />
          <circle cx="40" cy="35" r="5" fill="#FCE7F3" opacity="0.6" />
          {/* Wooden Triangle */}
          <polygon points="90,20 70,60 110,60" fill="#38BDF8" stroke="#0369A1" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

export const SensoryRoomIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/60 via-emerald-50/40 to-sky-50 border border-amber-100 p-6 flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[260px]"
      >
        {/* Soft rug */}
        <ellipse cx="200" cy="240" rx="170" ry="35" fill="#FEF08A" opacity="0.6" />
        
        {/* Cozy Soft Bean Bag */}
        <path
          d="M 90 220 C 80 180 110 140 160 140 C 210 140 230 180 230 220 C 230 240 190 250 160 250 C 120 250 90 240 90 220 Z"
          fill="#38BDF8"
          stroke="#0284C7"
          strokeWidth="3"
        />
        <path
          d="M 125 180 C 140 200 180 200 195 180"
          stroke="#0369A1"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gentle calming plant */}
        <g transform="translate(290, 140)">
          <path d="M 25 70 L 35 110 L 15 110 Z" fill="#F97316" />
          {/* Leaves */}
          <ellipse cx="15" cy="55" rx="12" ry="22" transform="rotate(-30 15 55)" fill="#4ADE80" />
          <ellipse cx="35" cy="55" rx="12" ry="22" transform="rotate(30 35 55)" fill="#22C55E" />
          <ellipse cx="25" cy="40" rx="10" ry="24" fill="#86EFAC" />
        </g>

        {/* Sensory tactile panels on the wall */}
        <rect x="70" y="40" width="60" height="75" rx="8" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
        <circle cx="85" cy="60" r="4" fill="#CA8A04" />
        <circle cx="105" cy="60" r="4" fill="#CA8A04" />
        <circle cx="95" cy="80" r="4" fill="#CA8A04" />
        <circle cx="85" cy="95" r="4" fill="#CA8A04" />
        <circle cx="105" cy="95" r="4" fill="#CA8A04" />

        <rect x="145" y="40" width="60" height="75" rx="8" fill="#BBF7D0" stroke="#16A34A" strokeWidth="2" />
        <line x1="155" y1="55" x2="195" y2="55" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="155" y1="75" x2="195" y2="75" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="155" y1="95" x2="195" y2="95" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />

        <rect x="220" y="40" width="60" height="75" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
        <path d="M 235 75 Q 250 60 265 75 T 275 75" stroke="#0284C7" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  );
};

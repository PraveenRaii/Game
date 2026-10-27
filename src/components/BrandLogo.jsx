import React from 'react';
import { motion } from 'framer-motion';

export const BrandLogo = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none">
      {/* Ambient Lime Glow behind central emblem */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[var(--primary-accent)] opacity-[0.08] blur-3xl pointer-events-none" />

      {/* Top Header Row of the Card */}
      <div className="w-full flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
          <span className="w-2 h-2 rounded-full bg-[var(--primary-accent)] animate-pulse" />
          <span className="font-mono-stats text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase">
            Official Emblem
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono-stats text-[11px] font-bold text-[var(--primary-accent)]">
          <span>PRO</span>
          <span className="text-[var(--text-secondary)]">·</span>
          <span>v2.0</span>
        </div>
      </div>

      {/* Centerpiece: Symmetrical Floating Pro Gaming Emblem */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center my-auto py-2"
      >
        <div className="relative flex items-center justify-center">
          {/* Outer Decorative Dashed Orbital Ring */}
          <div className="absolute inset-0 -m-3 rounded-full border border-dashed border-[var(--border-color)] opacity-70 pointer-events-none" />

          {/* SVG GameZone Pro Controller Crest */}
          <svg
            viewBox="0 0 200 200"
            className="w-36 h-36 sm:w-40 sm:h-40 drop-shadow-md relative z-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Geometric Octagon / Rounded Shield Surface */}
            <rect
              x="12"
              y="12"
              width="176"
              height="176"
              rx="44"
              fill="var(--bg-elevated)"
              stroke="var(--border-color)"
              strokeWidth="2"
            />
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              rx="36"
              stroke="var(--primary-accent-border)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              opacity="0.8"
            />

            {/* Corner Decorative Tech Marks */}
            <path d="M26 36 V26 H36" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />
            <path d="M174 36 V26 H164" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />
            <path d="M26 164 V174 H36" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />
            <path d="M174 164 V174 H164" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" />

            {/* Pro Controller Body - Symmetrical, clean, modern lines */}
            <g transform="translate(20, 20)">
              {/* Controller Main Body Contour */}
              <path
                d="M44 42 C30 42 22 54 24 76 L30 110 C34 124 48 130 60 122 L72 114 C76 111 84 111 88 114 L100 122 C112 130 126 124 130 110 L136 76 C138 54 130 42 116 42 C100 42 94 52 80 52 C66 52 60 42 44 42 Z"
                fill="var(--bg-card)"
                stroke="var(--primary-accent)"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Grip Detail Slots */}
              <line x1="33" y1="88" x2="36" y2="104" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="127" y1="88" x2="124" y2="104" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />

              {/* D-Pad (Left side) */}
              <path
                d="M52 68 H58 V60 H66 V68 H72 V76 H66 V84 H58 V76 H52 Z"
                fill="var(--bg-elevated)"
                stroke="var(--primary-accent)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="62" cy="72" r="2" fill="var(--primary-accent)" />

              {/* Action Buttons (Right side - Diamond layout) */}
              <circle cx="98" cy="72" r="4.5" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="1.5" />
              <circle cx="108" cy="62" r="4.5" fill="var(--primary-accent)" />
              <circle cx="108" cy="82" r="4.5" fill="var(--primary-accent)" />
              <circle cx="118" cy="72" r="4.5" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="1.5" />

              {/* Center GameZone Power Gem */}
              <circle cx="80" cy="66" r="8" fill="var(--primary-accent)" />
              <polygon points="80,61 85,71 75,71" fill="var(--btn-text-on-accent)" />

              {/* Left & Right Analog Thumbsticks */}
              <circle cx="62" cy="98" r="9" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="2" />
              <circle cx="62" cy="98" r="4.5" fill="var(--primary-accent)" />

              <circle cx="98" cy="98" r="9" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="2" />
              <circle cx="98" cy="98" r="4.5" fill="var(--primary-accent)" />
            </g>
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="text-center mt-3">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--text-primary)]">
            Game<span className="text-[var(--primary-accent)]">Zone</span>
          </h2>
          <p className="font-mono-stats text-[11px] font-bold text-[var(--text-secondary)] tracking-widest uppercase mt-0.5">
            Small Games · Big Brain
          </p>
        </div>
      </motion.div>

      {/* Bottom Row: 5 Game Identity Badges */}
      <div className="w-full pt-3 border-t border-[var(--border-color)]">
        <div className="grid grid-cols-5 gap-1 text-center">
          <div className="py-1 px-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[9px] font-mono-stats font-semibold text-[var(--text-secondary)]">
            #1 Guess
          </div>
          <div className="py-1 px-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[9px] font-mono-stats font-semibold text-[var(--text-secondary)]">
            #2 Tactics
          </div>
          <div className="py-1 px-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[9px] font-mono-stats font-semibold text-[var(--text-secondary)]">
            #3 Puzzle
          </div>
          <div className="py-1 px-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[9px] font-mono-stats font-semibold text-[var(--text-secondary)]">
            #4 Racing
          </div>
          <div className="py-1 px-0.5 rounded-lg bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[9px] font-mono-stats font-bold text-[var(--primary-accent)]">
            #5 Strike
          </div>
        </div>
      </div>
    </div>
  );
};

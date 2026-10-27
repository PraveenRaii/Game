import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Code2,
  Target,
  Grid3X3,
  Puzzle,
  Keyboard,
  Car,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';

export const About = ({ setCurrentView }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-[var(--primary-accent)]" />
          About GameZone
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed font-sans">
          <strong>GameZone — Small Games. Big Brain.</strong> is a high-performance minimalist gaming hub engineered with React, Tailwind CSS, Framer Motion, and Web Audio synthesis.
        </p>
      </div>

      {/* Game Rules & Strategies */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] space-y-6">
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--primary-accent)]" />
          Game Strategies &amp; Guides
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Game 1 */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary-accent)] font-bold text-sm">
              <Target className="w-4 h-4" />
              Number Guessing
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Deduce the secret number chosen by the engine. High and Low feedback narrows down the candidates.
            </p>
            <div className="text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
              <strong className="text-[var(--text-primary)]">Strategy:</strong> Always split remaining intervals in half (Binary Search) to solve with minimum tries.
            </div>
          </div>

          {/* Game 2 */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary-accent)] font-bold text-sm">
              <Grid3X3 className="w-4 h-4" />
              Tic-Tac-Toe
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Form 3 consecutive marks horizontally, vertically, or diagonally. Choose 2-Player local or challenge Minimax AI.
            </p>
            <div className="text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
              <strong className="text-[var(--text-primary)]">Strategy:</strong> Secure corners first. Against Minimax, forcing early forks is the only route to victory.
            </div>
          </div>

          {/* Game 3 */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary-accent)] font-bold text-sm">
              <Puzzle className="w-4 h-4" />
              Sliding Puzzle
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Slide tiles sequentially from 1 to N into the blank cell. Solvability is mathematically guaranteed.
            </p>
            <div className="text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
              <strong className="text-[var(--text-primary)]">Strategy:</strong> Lock the top row and leftmost column first to reduce the problem to smaller sub-grids.
            </div>
          </div>

          {/* Game 4 */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary-accent)] font-bold text-sm">
              <Car className="w-4 h-4" />
              Car Racing
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Dodge oncoming highway vehicles across 3 lanes, collect score coins, and ignite nitro boosts.
            </p>
            <div className="text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]">
              <strong className="text-[var(--text-primary)]">Strategy:</strong> Maintain center lane when possible to react quickly in either direction, and burn nitro on straight stretches.
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] space-y-6">
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[var(--primary-accent)]" />
          Modern Architecture
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
            <span className="text-2xl mb-1 block">⚛️</span>
            <h4 className="font-bold text-[var(--text-primary)] text-xs">React 19</h4>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Component tree</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
            <span className="text-2xl mb-1 block">🎨</span>
            <h4 className="font-bold text-[var(--text-primary)] text-xs">Tailwind CSS v4</h4>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Dual-theme tokens</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
            <span className="text-2xl mb-1 block">⚡</span>
            <h4 className="font-bold text-[var(--text-primary)] text-xs">Framer Motion</h4>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Fluid transitions</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
            <span className="text-2xl mb-1 block">🔊</span>
            <h4 className="font-bold text-[var(--text-primary)] text-xs">Web Audio API</h4>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Synthesized SFX</p>
          </div>
        </div>
      </div>

      {/* Controls & Shortcuts */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] space-y-4">
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-[var(--primary-accent)]" />
          Shortcuts &amp; Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Slide Puzzle Tile</span>
            <span className="font-mono-stats text-[var(--primary-accent)] font-semibold">Arrow Keys / WASD</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Car Racing Steer / Nitro</span>
            <span className="font-mono-stats text-[var(--primary-accent)] font-semibold">← / → &amp; SPACE</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Submit Guess</span>
            <span className="font-mono-stats text-[var(--primary-accent)] font-semibold">Enter Key</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Theme Toggle</span>
            <span className="font-mono-stats text-[var(--primary-accent)] font-semibold">Navbar Sun / Moon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

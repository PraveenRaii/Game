import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Trophy, Zap, Clock, Hash, Grid3X3, Car, Lock } from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';

export const GameCard = ({
  id,
  title,
  tagline,
  description,
  difficultyOptions = [],
  activeDifficulty,
  onSelectDifficulty,
  statsBadge,
  ctaText = 'Play Now',
  illustrationType = 'generic',
  icon: Icon,
  isLocked = false,
  onPlay,
}) => {
  // Render distinctive visual illustration for each game
  const renderIllustration = () => {
    switch (illustrationType) {
      case 'number-guess':
        return (
          <div className="relative h-28 w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center mb-5">
            {/* Floating numbers with lime accent */}
            <span className="font-mono-stats text-4xl font-extrabold text-[var(--primary-accent)] tracking-wider">
              ?
            </span>
            <span className="absolute top-3 left-4 font-mono-stats text-xs font-bold text-[var(--text-secondary)] opacity-50">
              #42
            </span>
            <span className="absolute bottom-3 left-6 font-mono-stats text-xs font-bold text-[var(--primary-accent)] opacity-60">
              1..100
            </span>
            <span className="absolute top-4 right-6 font-mono-stats text-xs font-bold text-[var(--text-secondary)] opacity-40">
              #7
            </span>
            <span className="absolute bottom-3 right-5 font-mono-stats text-xs font-bold text-[var(--text-secondary)] opacity-60">
              #88
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/40 to-transparent pointer-events-none" />
          </div>
        );

      case 'tic-tac-toe':
        return (
          <div className="relative h-28 w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center mb-5">
            {/* Monochrome 3x3 preview with lime-green highlight */}
            <div className="grid grid-cols-3 gap-1.5 p-2">
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-primary)]">X</span>
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-secondary)]">O</span>
              <span className="w-6 h-6 rounded bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--primary-accent)]">X</span>
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-secondary)]">O</span>
              <span className="w-6 h-6 rounded bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--primary-accent)]">X</span>
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-secondary)]">O</span>
              <span className="w-6 h-6 rounded bg-[var(--primary-accent)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--btn-text-on-accent)]">X</span>
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-secondary)]">O</span>
              <span className="w-6 h-6 rounded bg-[var(--bg-card)] flex items-center justify-center font-heading font-extrabold text-xs text-[var(--text-primary)]">X</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/30 to-transparent pointer-events-none" />
          </div>
        );

      case 'puzzle':
        return (
          <div className="relative h-28 w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center mb-5">
            {/* Sliding puzzle preview */}
            <div className="grid grid-cols-3 gap-1.5 p-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <span
                  key={num}
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono-stats text-xs font-bold ${
                    num === 1 || num === 5
                      ? 'bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                  }`}
                >
                  {num}
                </span>
              ))}
              <span className="w-6 h-6 rounded border border-dashed border-[var(--border-color)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/30 to-transparent pointer-events-none" />
          </div>
        );

      case 'car-racing':
        return (
          <div className="relative h-28 w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center mb-5">
            {/* Speed tracks & racing lane */}
            <div className="w-3/4 h-full flex justify-between relative py-2">
              <div className="w-px h-full border-r border-dashed border-[var(--border-color)]" />
              <div className="w-px h-full border-r border-dashed border-[var(--primary-accent-border)]" />
              <div className="w-px h-full border-r border-dashed border-[var(--border-color)]" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Car className="w-7 h-7 text-[var(--primary-accent)]" />
                <span className="w-4 h-1 bg-[var(--primary-accent)] rounded-full blur-[2px] mt-0.5" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)]/30 to-transparent pointer-events-none" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="surface-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between surface-card-hover group relative overflow-hidden"
    >
      <div>
        {/* Visual Illustration */}
        {renderIllustration()}

        {/* Card Header: Icon & Top Tagline */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--primary-accent)] group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
                {title}
              </h3>
              <p className="text-xs font-medium text-[var(--primary-accent)] tracking-wide">
                {tagline}
              </p>
            </div>
          </div>

          {isLocked && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary-accent)] px-2.5 py-1 rounded-full bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] shrink-0 tracking-wide"
              title="Sign up required to play"
            >
              <Lock className="w-3 h-3" />
              Sign Up
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {description}
        </p>

        {/* Difficulty Options */}
        {difficultyOptions.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              Difficulty:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {difficultyOptions.map((opt) => {
                const isSelected = activeDifficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectDifficulty && onSelectDifficulty(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Badge / Personal Best */}
        {statsBadge && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-5 text-xs">
            <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              {statsBadge.label}
            </span>
            <span className="font-mono-stats font-bold text-[var(--primary-accent)]">
              {statsBadge.value}
            </span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onPlay(id);
        }}
        className="w-full py-3 px-5 rounded-2xl btn-primary flex items-center justify-center gap-2 group/btn focus:outline-none"
      >
        <span>{ctaText}</span>
        {isLocked ? (
          <Lock className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
        ) : (
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        )}
      </button>
    </motion.div>
  );
};

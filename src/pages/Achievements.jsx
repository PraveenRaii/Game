import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  ArrowLeft,
  Sparkles,
  Lock,
  CheckCircle2,
  Trophy,
  Zap,
} from 'lucide-react';
import { ACHIEVEMENTS_LIST, useGameStats } from '../context/GameStatsContext';
import { soundEffects } from '../audio/soundEffects';

export const Achievements = ({ setCurrentView }) => {
  const { unlockedAchievements } = useGameStats();

  const totalPossible = ACHIEVEMENTS_LIST.length;
  const totalUnlocked = unlockedAchievements.length;
  const progressPercent = Math.round((totalUnlocked / totalPossible) * 100);
  const totalXP = unlockedAchievements.reduce((acc, curr) => acc + (curr.xp || 50), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => {
              soundEffects.playClick();
              setCurrentView('home');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
          <h1 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
            <Award className="w-8 h-8 text-[var(--primary-accent)]" />
            Player Achievements
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Complete tactical challenges, unlock badges, and accumulate XP!
          </p>
        </div>

        {/* Total XP Badge */}
        <div className="self-start sm:self-auto px-4 py-2 rounded-2xl surface-card border border-[var(--primary-accent-border)] flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-[var(--primary-accent)]" />
          <div>
            <p className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Total XP</p>
            <p className="font-mono-stats text-base font-bold text-[var(--text-primary)]">
              {totalXP.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] mb-8 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[var(--text-secondary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary-accent)]" />
            Overall Progress
          </span>
          <span className="font-mono-stats text-[var(--primary-accent)] font-bold">
            {totalUnlocked} / {totalPossible} ({progressPercent}%)
          </span>
        </div>

        <div className="h-3 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-[var(--primary-accent)] rounded-full"
          />
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS_LIST.map((badge) => {
          const unlockedItem = unlockedAchievements.find((a) => a.id === badge.id);
          const isUnlocked = !!unlockedItem;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2 }}
              className={`p-5 rounded-3xl border transition-all duration-200 flex items-start gap-4 relative overflow-hidden ${
                isUnlocked
                  ? 'surface-card border-[var(--primary-accent-border)] bg-[var(--bg-card)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                  isUnlocked
                    ? 'bg-[var(--primary-accent-subtle)] border-[var(--primary-accent-border)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] grayscale'
                }`}
              >
                {badge.icon}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] truncate">
                    {badge.title}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-lime uppercase tracking-wider">
                    {badge.rarity}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2 font-sans">
                  {badge.desc}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-color)]">
                  <span className="font-mono-stats font-semibold text-[var(--primary-accent)] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    +{badge.xp} XP
                  </span>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold text-[var(--primary-accent)] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

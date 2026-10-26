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
  Flame,
} from 'lucide-react';
import { ACHIEVEMENTS_LIST, useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../audio/soundEffects';

export const Achievements = ({ setCurrentView }) => {
  const { unlockedAchievements } = useGameStats();
  const { currentUser } = useAuth();

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-purple-500/40 transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
          <h1 className="font-['Orbitron'] text-3xl font-extrabold text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-400" />
            Player Achievements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete milestones, defeat challenges, and level up your player profile!
          </p>
        </div>

        {/* Total XP Badge */}
        <div className="self-start sm:self-auto px-4 py-2 rounded-2xl glass-panel-glow border border-purple-500/40 flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Gamer XP</p>
            <p className="font-['Orbitron'] text-base font-extrabold text-white">
              {totalXP.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 mb-8 shadow-xl">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Overall Achievement Progress
          </span>
          <span className="font-['Orbitron'] text-purple-300">
            {totalUnlocked} / {totalPossible} ({progressPercent}%)
          </span>
        </div>

        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full"
          />
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS_LIST.map((badge) => {
          const unlockedItem = unlockedAchievements.find((a) => a.id === badge.id);
          const isUnlocked = !!unlockedItem;

          const rarityColor =
            badge.rarity === 'Legendary'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : badge.rarity === 'Epic'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : badge.rarity === 'Rare'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-500/20 text-slate-300 border-slate-500/40';

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-3xl border transition-all duration-200 flex items-start gap-4 relative overflow-hidden ${
                isUnlocked
                  ? 'glass-panel-glow border-purple-500/40 bg-purple-950/20'
                  : 'glass-panel border-white/5 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border shadow-lg ${
                  isUnlocked
                    ? 'bg-purple-500/20 border-purple-500/40 scale-105'
                    : 'bg-white/5 border-white/10 grayscale'
                }`}
              >
                {badge.icon}
              </div>

              {/* Badge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-['Orbitron'] font-bold text-sm text-white truncate">
                    {badge.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${rarityColor}`}>
                    {badge.rarity}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {badge.desc}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    +{badge.xp} XP
                  </span>

                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
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

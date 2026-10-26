import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Trophy, Users, Zap, Brain, Grid } from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';

export const GameCard = ({
  id,
  title,
  tagline,
  description,
  difficulty,
  badges,
  accentColor = 'cyan', // 'cyan' | 'purple' | 'pink'
  icon: Icon,
  bestRecord,
  onPlay,
}) => {
  const getThemeStyles = () => {
    switch (accentColor) {
      case 'purple':
        return {
          glow: 'group-hover:shadow-purple-500/25 group-hover:border-purple-500/50',
          badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          btnBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500',
          iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          borderGrad: 'from-purple-500/50 via-indigo-500/30 to-transparent',
        };
      case 'pink':
        return {
          glow: 'group-hover:shadow-pink-500/25 group-hover:border-pink-500/50',
          badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
          btnBg: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
          iconBg: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
          borderGrad: 'from-pink-500/50 via-rose-500/30 to-transparent',
        };
      case 'cyan':
      default:
        return {
          glow: 'group-hover:shadow-cyan-500/25 group-hover:border-cyan-500/50',
          badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          btnBg: 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500',
          iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          borderGrad: 'from-cyan-500/50 via-blue-500/30 to-transparent',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`relative group rounded-3xl p-6 sm:p-7 glass-panel border border-white/10 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${theme.glow}`}
    >
      {/* Top subtle glow line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.borderGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div>
        {/* Header: Icon & Difficulty Pill */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-lg ${theme.iconBg}`}
          >
            <Icon className="w-7 h-7" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${theme.badgeBg}`}
            >
              {difficulty}
            </span>
            {bestRecord && (
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
                <Trophy className="w-3 h-3 text-amber-400" />
                Best: <strong className="text-white">{bestRecord}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-['Orbitron'] font-bold text-xl sm:text-2xl text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-3">
          {tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {description}
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {badges.map((b, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onPlay(id);
        }}
        className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-95 group-hover:shadow-xl ${theme.btnBg}`}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Play Now</span>
      </button>
    </motion.div>
  );
};

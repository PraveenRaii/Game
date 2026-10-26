import React from 'react';
import { motion } from 'framer-motion';

export const ScoreCard = ({ title, value, subtitle, icon: Icon, color = 'cyan' }) => {
  const colorMap = {
    cyan: {
      border: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      textGlow: 'text-cyan-300',
    },
    purple: {
      border: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      textGlow: 'text-purple-300',
    },
    pink: {
      border: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      iconBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      textGlow: 'text-pink-300',
    },
    amber: {
      border: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      textGlow: 'text-amber-300',
    },
  };

  const theme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`glass-panel rounded-2xl p-5 border border-white/10 transition-all duration-200 flex items-center justify-between shadow-lg ${theme.border}`}
    >
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className={`font-['Orbitron'] text-2xl sm:text-3xl font-extrabold ${theme.textGlow}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-md ${theme.iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

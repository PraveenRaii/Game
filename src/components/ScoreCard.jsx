import React from 'react';
import { motion } from 'framer-motion';

export const ScoreCard = ({ title, value, subtitle, icon: Icon, isAccent = false }) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`rounded-2xl p-5 border transition-all duration-200 flex items-center justify-between shadow-sm ${
        isAccent
          ? 'bg-[var(--primary-accent-subtle)] border-[var(--primary-accent-border)]'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--border-hover)]'
      }`}
    >
      <div>
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="font-mono-stats text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--primary-accent)] shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

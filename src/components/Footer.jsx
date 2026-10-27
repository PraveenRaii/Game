import React from 'react';
import { Gamepad2, Heart, Code2 } from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';

export const Footer = ({ setCurrentView }) => {
  const handleNav = (viewId) => {
    soundEffects.playClick();
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] relative overflow-hidden transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <Gamepad2 className="w-5 h-5 text-[var(--primary-accent)]" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-[var(--text-primary)]">
                Game<span className="text-[var(--primary-accent)]">Zone</span>
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              Small Games. Big Brain. Ultra-responsive gaming experience with minimalist design and instant playability.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--primary-accent)] font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary-accent)]"></span>
              </span>
              Operational • Dark &amp; Light Modes
            </div>
          </div>

          {/* Quick Games */}
          <div>
            <h4 className="font-heading text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase mb-4">
              Featured Games
            </h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <button
                  onClick={() => handleNav('guess-game')}
                  className="hover:text-[var(--primary-accent)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)] group-hover:scale-125 transition-transform"></span>
                  Number Guessing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('tic-tac-toe')}
                  className="hover:text-[var(--primary-accent)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)] group-hover:scale-125 transition-transform"></span>
                  Tic-Tac-Toe (AI &amp; 2P)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('puzzle-game')}
                  className="hover:text-[var(--primary-accent)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)] group-hover:scale-125 transition-transform"></span>
                  Sliding Puzzle
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('car-racing')}
                  className="hover:text-[var(--primary-accent)] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)] group-hover:scale-125 transition-transform"></span>
                  Highway Car Racing
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[var(--primary-accent)] transition-colors">
                  Home Arena
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('games')} className="hover:text-[var(--primary-accent)] transition-colors">
                  Explore Games
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('leaderboard')} className="hover:text-[var(--primary-accent)] transition-colors">
                  Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('achievements')} className="hover:text-[var(--primary-accent)] transition-colors">
                  Achievements
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[var(--primary-accent)] transition-colors">
                  About GameZone
                </button>
              </li>
            </ul>
          </div>

          {/* Design Identity Note */}
          <div>
            <h4 className="font-heading text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase mb-4">
              Design &amp; Identity
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 font-sans">
              Designed with a premium black, charcoal, white, and lime-green palette. Outfit headings, Inter body typography, and Space Mono telemetry statistics.
            </p>
            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] font-mono-stats">
              Theme: Dark / Light Adaptive
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <p>© {new Date().getFullYear()} GameZone. Built with precision and care.</p>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>Crafted for strategy, speed, and focus</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

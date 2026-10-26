import React from 'react';
import { Gamepad2, Heart, MessageSquare, ShieldCheck, Sparkles, Code2, Globe, Share2 } from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';

export const Footer = ({ setCurrentView }) => {
  const handleNav = (viewId) => {
    soundEffects.playClick();
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#06070d] text-slate-400 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-[#0a0c1a] rounded-[10px] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="font-['Orbitron'] font-extrabold text-xl tracking-wider text-white">
                GameZone
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Play, Think &amp; Win! Experience ultra-responsive mini games built with React, Tailwind CSS, and Framer Motion.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational • Offline ready
            </div>
          </div>

          {/* Quick Games */}
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white tracking-widest uppercase mb-4">
              Featured Games
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNav('car-racing')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-150 transition-transform"></span>
                  Cyber Racer (Car Racing)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('guess-game')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:scale-150 transition-transform"></span>
                  Number Guessing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('tic-tac-toe')}
                  className="hover:text-purple-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                  Tic-Tac-Toe (AI &amp; 2P)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('puzzle-game')}
                  className="hover:text-pink-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 group-hover:scale-150 transition-transform"></span>
                  Sliding Number Puzzle
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white tracking-widest uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-cyan-400 transition-colors">
                  Gaming Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('leaderboard')} className="hover:text-cyan-400 transition-colors">
                  Local Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('achievements')} className="hover:text-cyan-400 transition-colors">
                  Achievements Showcase
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-cyan-400 transition-colors">
                  Rules &amp; About
                </button>
              </li>
            </ul>
          </div>

          {/* Connect & Tech */}
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white tracking-widest uppercase mb-4">
              Community &amp; Tech
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Crafted with modern frontend tech: React 19, Tailwind CSS, Framer Motion &amp; Web Audio API.
            </p>
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="#github"
                onClick={(e) => { e.preventDefault(); soundEffects.playClick(); }}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="#twitter"
                onClick={(e) => { e.preventDefault(); soundEffects.playClick(); }}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-cyan-400 transition-all"
                title="X / Twitter"
                aria-label="X / Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Discord / Community */}
              <a
                href="#discord"
                onClick={(e) => { e.preventDefault(); soundEffects.playClick(); }}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-indigo-400 transition-all"
                title="Community"
                aria-label="Community"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              {/* Website / Share */}
              <a
                href="#share"
                onClick={(e) => { e.preventDefault(); soundEffects.playClick(); }}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-rose-500 transition-all"
                title="Share GameZone"
                aria-label="Share GameZone"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} GameZone. All rights reserved. Play, Think &amp; Win!</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with precision &amp; passion for gamers</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

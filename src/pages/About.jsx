import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  Target,
  Grid3X3,
  Puzzle,
  Keyboard,
  Cpu,
  Layers,
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-cyan-500/40 transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <h1 className="font-['Orbitron'] text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-cyan-400" />
          About GameZone
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          <strong>GameZone – Play, Think &amp; Win!</strong> is an ultra-fast, modern, responsive gaming platform engineered with precision frontend architecture, procedural audio synthesis, and tactical game algorithms.
        </p>
      </div>

      {/* Game Rules & Strategies */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
        <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Game Rules &amp; Pro Strategies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Game 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Target className="w-4 h-4" />
              Number Guessing
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deduce the secret number chosen by the CPU. Pay attention to "Too High" and "Too Low" hints.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <strong>Strategy:</strong> Always split the remaining range in half (Binary Search) to solve it in minimum steps!
            </div>
          </div>

          {/* Game 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Grid3X3 className="w-4 h-4" />
              Tic-Tac-Toe
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Place 3 matching symbols in a row, column, or diagonal. Play 2-Player local or face our AI.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <strong>Strategy:</strong> Hard AI runs the mathematical Minimax algorithm. Securing corners and center is crucial!
            </div>
          </div>

          {/* Game 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
              <Puzzle className="w-4 h-4" />
              Sliding Puzzle
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Slide tiles into the empty space to arrange numbers 1 to N in ascending order.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <strong>Strategy:</strong> Solve the top row first, then the leftmost column, reducing the remaining subgrid!
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack & Architecture */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
        <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-400" />
          Technology Stack
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-2xl mb-1 block">⚛️</span>
            <h4 className="font-bold text-white text-xs">React 19</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Component hierarchy</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-2xl mb-1 block">🎨</span>
            <h4 className="font-bold text-white text-xs">Tailwind CSS v4</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Neon glass styling</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-2xl mb-1 block">✨</span>
            <h4 className="font-bold text-white text-xs">Framer Motion</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Spring animations</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-2xl mb-1 block">🔊</span>
            <h4 className="font-bold text-white text-xs">Web Audio API</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Zero-latency synth audio</p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-pink-400" />
          Shortcuts &amp; Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-300">Slide Puzzle Tile</span>
            <span className="font-mono text-cyan-300 bg-white/5 px-2 py-1 rounded">Arrow Keys / WASD</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-300">Submit Number Guess</span>
            <span className="font-mono text-purple-300 bg-white/5 px-2 py-1 rounded">Enter Key</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-300">Sound Toggle</span>
            <span className="font-mono text-pink-300 bg-white/5 px-2 py-1 rounded">Navbar Volume Icon</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-300">Guest / Sign In</span>
            <span className="font-mono text-emerald-300 bg-white/5 px-2 py-1 rounded">Top-Right Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

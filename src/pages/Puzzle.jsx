import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Shuffle,
  Lightbulb,
  Clock,
  Footprints,
  Trophy,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import {
  generateSolvablePuzzle,
  isSolved,
  canMoveTile,
  getBestHintMove,
} from '../utils/puzzleSolver';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

export const Puzzle = ({ setCurrentView }) => {
  const { stats, recordPuzzleResult } = useGameStats();
  const { addToast } = useToast();

  const [gridSize, setGridSize] = useState(3); // 3 (3x3), 4 (4x4), 5 (5x5)
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [highlightTile, setHighlightTile] = useState(null); // Hinted tile index

  const timerRef = useRef(null);

  // Initialize & shuffle puzzle
  const initPuzzle = (size = gridSize) => {
    soundEffects.playShuffle();
    const newTiles = generateSolvablePuzzle(size);
    setTiles(newTiles);
    setMoves(0);
    setSeconds(0);
    setIsRunning(false);
    setIsVictory(false);
    setHighlightTile(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    initPuzzle(gridSize);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gridSize]);

  // Timer runner
  useEffect(() => {
    if (isRunning && !isVictory) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isVictory]);

  // Move tile handler
  const handleTileClick = (index) => {
    if (isVictory) return;
    const blankIndex = tiles.indexOf(0);

    if (canMoveTile(index, blankIndex, gridSize)) {
      if (!isRunning) setIsRunning(true);

      const newTiles = [...tiles];
      newTiles[blankIndex] = newTiles[index];
      newTiles[index] = 0;

      setTiles(newTiles);
      setMoves((prev) => prev + 1);
      setHighlightTile(null);
      soundEffects.playMove();

      // Check win
      if (isSolved(newTiles)) {
        setIsRunning(false);
        setIsVictory(true);
        soundEffects.playWin();
        triggerConfetti();

        const totalTime = seconds + 1; // current second
        recordPuzzleResult({ size: gridSize, moves: moves + 1, timeSeconds: totalTime });
        addToast({
          title: `Puzzle Solved! 🧩`,
          message: `Grid ${gridSize}x${gridSize} completed in ${formatTime(totalTime)} and ${moves + 1} moves!`,
          type: 'success',
        });
      }
    } else {
      soundEffects.playHint(false);
    }
  };

  // Keyboard navigation (Arrow keys & WASD to slide tile into blank space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isVictory) return;
      const blankIndex = tiles.indexOf(0);
      if (blankIndex === -1) return;

      const blankRow = Math.floor(blankIndex / gridSize);
      const blankCol = blankIndex % gridSize;

      let targetIndex = null;

      // When player presses ArrowUp, tile BELOW the blank slides UP into the blank
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        if (blankRow < gridSize - 1) targetIndex = (blankRow + 1) * gridSize + blankCol;
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        // Tile ABOVE the blank slides DOWN
        if (blankRow > 0) targetIndex = (blankRow - 1) * gridSize + blankCol;
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        // Tile to the RIGHT of the blank slides LEFT
        if (blankCol < gridSize - 1) targetIndex = blankRow * gridSize + (blankCol + 1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        // Tile to the LEFT of the blank slides RIGHT
        if (blankCol > 0) targetIndex = blankRow * gridSize + (blankCol - 1);
      }

      if (targetIndex !== null) {
        e.preventDefault();
        handleTileClick(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, gridSize, isVictory, isRunning, seconds, moves]);

  // Hint engine
  const handleHint = () => {
    if (isVictory) return;
    const bestMoveIndex = getBestHintMove(tiles, gridSize);
    if (bestMoveIndex !== null) {
      setHighlightTile(bestMoveIndex);
      soundEffects.playHint(true);
      addToast({
        title: '💡 Hint Provided!',
        message: `Slide tile #${tiles[bestMoveIndex]} to reduce disorder.`,
        type: 'info',
        duration: 3000,
      });
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const bestRecordKey = gridSize === 3 ? 'best3x3' : gridSize === 4 ? 'best4x4' : 'best5x5';
  const bestRecord = stats.puzzle[bestRecordKey];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-pink-500/40 transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Grid Size Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 self-start sm:self-auto">
          {[3, 4, 5].map((size) => (
            <button
              key={size}
              onClick={() => {
                soundEffects.playClick();
                setGridSize(size);
              }}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                gridSize === size
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {size}×{size} {size === 3 ? '(Classic)' : size === 4 ? '(Master)' : '(Expert)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Puzzle Board Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-pink-500/30 shadow-2xl relative">
            {/* Top Counters: Timer & Moves */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Elapsed Time
                  </p>
                  <p className="font-['Orbitron'] text-xl font-bold text-white">
                    {formatTime(seconds)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Moves Count
                  </p>
                  <p className="font-['Orbitron'] text-xl font-bold text-white">
                    {moves}
                  </p>
                </div>
              </div>
            </div>

            {/* Sliding Tiles Grid */}
            <div
              className="relative aspect-square max-w-[340px] sm:max-w-[400px] mx-auto p-3 rounded-2xl bg-black/50 border border-white/10 shadow-inner grid gap-2.5"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((tile, idx) => {
                const isEmpty = tile === 0;
                const isHinted = highlightTile === idx;
                const isCorrect = tile === idx + 1;

                if (isEmpty) {
                  return (
                    <div
                      key="empty-tile"
                      className="rounded-2xl bg-slate-900/40 border border-dashed border-white/10 flex items-center justify-center"
                    >
                      <span className="text-slate-600 text-xs font-mono">SPACE</span>
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={tile}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={() => handleTileClick(idx)}
                    className={`relative rounded-2xl flex items-center justify-center font-['Orbitron'] font-extrabold select-none shadow-md transition-all active:scale-95 ${
                      gridSize === 5
                        ? 'text-lg sm:text-xl'
                        : gridSize === 4
                        ? 'text-2xl sm:text-3xl'
                        : 'text-3xl sm:text-4xl'
                    } ${
                      isHinted
                        ? 'bg-amber-400 text-black border-2 border-amber-300 shadow-lg shadow-amber-400/50 scale-105'
                        : isCorrect
                        ? 'bg-gradient-to-tr from-pink-600/70 to-rose-700/80 text-white border border-pink-400/40 hover:brightness-110'
                        : 'bg-white/10 text-slate-200 border border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <span>{tile}</span>
                    {isCorrect && (
                      <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Victory Announcement Banner */}
            <AnimatePresence>
              {isVictory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-purple-500/20 border border-pink-500/40 text-center"
                >
                  <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2 animate-spin" />
                  <h3 className="font-['Orbitron'] font-bold text-2xl text-white">
                    Puzzle Master! 🏆
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Completed in <strong>{formatTime(seconds)}</strong> using <strong>{moves} moves</strong>!
                  </p>
                  <p className="text-[11px] text-pink-300 mt-2 font-semibold">
                    New record saved to your local profile!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls Bar */}
            <div className="grid grid-cols-3 gap-2.5 mt-6">
              <button
                onClick={() => initPuzzle(gridSize)}
                className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-pink-400" />
                Shuffle
              </button>

              <button
                onClick={handleHint}
                disabled={isVictory}
                className="py-3 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-40"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Hint
              </button>

              <button
                onClick={() => initPuzzle(gridSize)}
                className="py-3 px-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-pink-500/30 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-pink-400" />
                Restart
              </button>
            </div>
          </div>
        </div>

        {/* Records & Keyboard Shortcuts Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Best Record Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-['Orbitron'] font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-pink-400" />
              Best Record ({gridSize}×{gridSize})
            </h3>

            {bestRecord ? (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Fastest Time
                  </span>
                  <span className="font-['Orbitron'] text-xl font-bold text-pink-400 mt-1 block">
                    {formatTime(bestRecord.timeSeconds)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Fewest Moves
                  </span>
                  <span className="font-['Orbitron'] text-xl font-bold text-white mt-1 block">
                    {bestRecord.moves}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-3 rounded-2xl bg-white/5 border border-dashed border-white/10">
                <p className="text-xs text-slate-400">No completion on {gridSize}x{gridSize} yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Complete your first game to set a record!</p>
              </div>
            )}
          </div>

          {/* Keyboard Controls Info */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-['Orbitron'] text-xs font-bold text-pink-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-pink-400" />
              Keyboard Navigation Controls
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>Arrow Keys</span>
                <span className="font-mono text-pink-300">↑ ↓ ← →</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>WASD Keys</span>
                <span className="font-mono text-pink-300">W A S D</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                Pressing an arrow moves adjacent tiles directly into the vacant space!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

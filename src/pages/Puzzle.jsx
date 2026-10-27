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
  Lock,
} from 'lucide-react';
import {
  generateSolvablePuzzle,
  isSolved,
  canMoveTile,
  getBestHintMove,
} from '../utils/puzzleSolver';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

export const Puzzle = ({ setCurrentView, openAuthModal }) => {
  const { stats, recordPuzzleResult } = useGameStats();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [gridSize, setGridSize] = useState(3); // 3 (3x3), 4 (4x4), 5 (5x5)
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [highlightTile, setHighlightTile] = useState(null); // Hinted tile index

  const timerRef = useRef(null);

  if (currentUser?.isGuest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full surface-card rounded-3xl p-8 border border-[var(--border-color)] text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-[var(--text-primary)]">
              Sign Up Required
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 font-sans leading-relaxed">
              You must create an account or sign in to solve sliding puzzles, test your IQ, and save completion times.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openAuthModal && openAuthModal('signup')}
              className="flex-1 py-3 rounded-2xl btn-primary font-bold text-sm"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => openAuthModal && openAuthModal('signin')}
              className="flex-1 py-3 rounded-2xl btn-secondary font-bold text-sm"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

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

        const totalTime = seconds + 1;
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
        if (blankRow > 0) targetIndex = (blankRow - 1) * gridSize + blankCol;
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        if (blankCol < gridSize - 1) targetIndex = blankRow * gridSize + (blankCol + 1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if (blankCol > 0) targetIndex = blankRow * gridSize + (blankCol - 1);
      }

      if (targetIndex !== null) {
        e.preventDefault();
        handleTileClick(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, gridSize, isVictory, moves, seconds, isRunning]);

  const handleHint = () => {
    soundEffects.playHint(true);
    const hint = getBestHintMove(tiles, gridSize);
    if (hint !== null) {
      setHighlightTile(hint);
      addToast({
        title: 'Tactical Hint 💡',
        message: `Slide the highlighted tile into the empty slot.`,
        type: 'info',
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bestKey = gridSize === 3 ? 'best3x3' : gridSize === 4 ? 'best4x4' : 'best5x5';
  const bestRecord = stats.puzzle?.[bestKey];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Grid Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Grid Dimensions Switcher: 3x3, 4x4, 5x5 */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] self-start sm:self-auto">
          {[3, 4, 5].map((size) => {
            const isSelected = gridSize === size;
            return (
              <button
                key={size}
                onClick={() => {
                  soundEffects.playClick();
                  setGridSize(size);
                }}
                className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {size}×{size} {size === 3 ? 'Classic' : size === 4 ? 'Pro' : 'Expert'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Puzzle Board Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full surface-card rounded-3xl p-6 sm:p-8 relative">
            {/* HUD Status Bar */}
            <div className="flex items-center justify-between gap-3 mb-6">
              {/* Timer */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <Clock className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                <span className="font-mono-stats text-sm font-bold text-[var(--text-primary)]">
                  {formatTime(seconds)}
                </span>
              </div>

              {/* Moves Counter */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <Footprints className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                <span className="font-mono-stats text-sm font-bold text-[var(--text-primary)]">
                  {moves} <span className="font-sans text-[11px] text-[var(--text-secondary)] font-normal">moves</span>
                </span>
              </div>

              {/* Best Record */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl badge-lime text-xs">
                <Trophy className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Best:</span>
                <span className="font-mono-stats font-bold">
                  {bestRecord ? `${bestRecord.moves}m · ${formatTime(bestRecord.timeSeconds)}` : '—'}
                </span>
              </div>
            </div>

            {/* Sliding Puzzle Dynamic Grid */}
            <div
              className="relative aspect-square max-w-[340px] sm:max-w-[400px] mx-auto p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] grid gap-2.5 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {tiles.map((num, idx) => {
                const isBlank = num === 0;
                const isHinted = highlightTile === idx;
                const isCorrectPosition = num === idx + 1;

                if (isBlank) {
                  return (
                    <div
                      key="blank"
                      className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/30 flex items-center justify-center transition-all"
                    />
                  );
                }

                return (
                  <motion.button
                    key={num}
                    layout
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    onClick={() => handleTileClick(idx)}
                    className={`rounded-xl flex items-center justify-center font-mono-stats font-bold select-none transition-all duration-150 relative ${
                      gridSize === 3 ? 'text-2xl sm:text-3xl' : gridSize === 4 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                    } ${
                      isHinted
                        ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] ring-2 ring-[var(--primary-accent)] scale-105 shadow-md'
                        : isCorrectPosition
                        ? 'bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)] hover:bg-[var(--primary-accent)] hover:text-[var(--btn-text-on-accent)]'
                        : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--primary-accent-border)]'
                    }`}
                  >
                    <span>{num}</span>
                    {isCorrectPosition && !isHinted && (
                      <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Victory Card */}
            {isVictory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-5 rounded-2xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-center space-y-2"
              >
                <div className="inline-flex p-2 rounded-xl bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                  Puzzle Solved!
                </h4>
                <p className="font-mono-stats text-sm text-[var(--primary-accent)] font-semibold">
                  {moves} Moves • {formatTime(seconds)} Elapsed
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => initPuzzle(gridSize)}
                    className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle New Game</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bottom Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => initPuzzle(gridSize)}
                className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold flex items-center gap-1.5 focus:outline-none"
              >
                <Shuffle className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={handleHint}
                disabled={isVictory}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] hover:border-[var(--primary-accent-border)] hover:text-[var(--primary-accent)] transition-all flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                <span>Show Hint</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  initPuzzle(gridSize);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[var(--primary-accent)]" />
                Controls &amp; Solvability
              </h3>
              <span className="badge-lime text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                100% Solvable
              </span>
            </div>

            <div className="space-y-4 text-xs text-[var(--text-secondary)]">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                <span>Keyboard Slide:</span>
                <span className="font-mono-stats font-bold text-[var(--text-primary)]">
                  Arrow Keys / WASD
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                <span>Click / Tap:</span>
                <span className="font-mono-stats font-bold text-[var(--text-primary)]">
                  Any Adjacent Tile
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
                <span className="font-heading font-bold text-sm text-[var(--primary-accent)] block">
                  How To Solve
                </span>
                <p className="leading-relaxed">
                  Arrange tiles in numerical order from left to right, top to bottom. Green dots indicate a tile currently sitting in its correct final spot!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

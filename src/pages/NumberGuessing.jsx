import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Hash,
  Activity,
  Heart,
  Sparkles,
  Lock,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    min: 1,
    max: 50,
    maxAttempts: 10,
  },
  medium: {
    label: 'Medium',
    min: 1,
    max: 100,
    maxAttempts: 7,
  },
  hard: {
    label: 'Hard',
    min: 1,
    max: 500,
    maxAttempts: 8,
  },
};

export const NumberGuessing = ({ setCurrentView, openAuthModal }) => {
  const { stats, recordNumberGuessResult } = useGameStats();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [difficulty, setDifficulty] = useState('medium');
  const config = DIFFICULTY_CONFIG[difficulty];

  const [targetNumber, setTargetNumber] = useState(1);
  const [userGuess, setUserGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [errorInput, setErrorInput] = useState('');

  const inputRef = useRef(null);

  // Initialize new secret number
  const initGame = (diff = difficulty) => {
    const curConfig = DIFFICULTY_CONFIG[diff];
    const secret = Math.floor(Math.random() * (curConfig.max - curConfig.min + 1)) + curConfig.min;
    setTargetNumber(secret);
    setGuessHistory([]);
    setFeedback({
      type: 'info',
      text: `Engine ready! Guess a number between ${curConfig.min} and ${curConfig.max}.`,
    });
    setGameState('playing');
    setUserGuess('');
    setErrorInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty]);

  const attemptsUsed = guessHistory.length;
  const attemptsRemaining = config.maxAttempts - attemptsUsed;
  const progressPercent = Math.max(0, (attemptsRemaining / config.maxAttempts) * 100);

  const bestScoreKey = difficulty === 'easy' ? 'bestEasy' : difficulty === 'hard' ? 'bestHard' : 'bestMedium';
  const bestScore = stats.numberGuessing?.[bestScoreKey];

  // Handle Guess submission
  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    setErrorInput('');
    const parsed = parseInt(userGuess, 10);

    // Validation
    if (isNaN(parsed)) {
      setErrorInput('Please enter a valid numeric guess.');
      soundEffects.playHint(false);
      return;
    }

    if (parsed < config.min || parsed > config.max) {
      setErrorInput(`Guess must be between ${config.min} and ${config.max}.`);
      soundEffects.playHint(false);
      return;
    }

    if (guessHistory.some((g) => g.number === parsed)) {
      setErrorInput(`You already guessed ${parsed}! Try another number.`);
      soundEffects.playHint(false);
      return;
    }

    const newAttemptsUsed = attemptsUsed + 1;
    const diffFromTarget = Math.abs(parsed - targetNumber);
    const isClose = diffFromTarget > 0 && diffFromTarget <= Math.ceil(config.max * 0.05);

    let hintType = 'info';
    let hintText = '';

    if (parsed === targetNumber) {
      hintType = 'correct';
      hintText = `Spot on! The secret number is indeed ${targetNumber}.`;
      setGameState('won');
      soundEffects.playWin();
      triggerConfetti();
      recordNumberGuessResult({ won: true, attempts: newAttemptsUsed, difficulty });
      addToast({
        title: 'Victory! 🎉',
        message: `You guessed ${targetNumber} in ${newAttemptsUsed} ${newAttemptsUsed === 1 ? 'try' : 'tries'}!`,
        type: 'success',
      });
    } else if (parsed > targetNumber) {
      hintType = 'high';
      hintText = isClose
        ? `Very Close, but Too High! (Try a slightly lower number)`
        : `Too High! Try a lower number.`;
      soundEffects.playHint(true);
    } else {
      hintType = 'low';
      hintText = isClose
        ? `Very Close, but Too Low! (Try a slightly higher number)`
        : `Too Low! Try a higher number.`;
      soundEffects.playHint(false);
    }

    const newRecord = {
      attempt: newAttemptsUsed,
      number: parsed,
      type: hintType,
      isClose,
      text: hintText,
    };

    setGuessHistory([newRecord, ...guessHistory]);
    setFeedback({ type: hintType, text: hintText });
    setUserGuess('');

    // Check if out of attempts
    if (parsed !== targetNumber && newAttemptsUsed >= config.maxAttempts) {
      setGameState('lost');
      soundEffects.playGameOver();
      recordNumberGuessResult({ won: false, attempts: newAttemptsUsed, difficulty });
      addToast({
        title: 'Out of Attempts',
        message: `The secret number was ${targetNumber}. Play again!`,
        type: 'error',
      });
    }
  };

  // Auth Guard for Guest Users
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
              You must create an account or sign in to play Number Guessing, track attempts, and compete on the leaderboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openAuthModal && openAuthModal('signup')}
              className="flex-1 py-3 rounded-2xl btn-primary font-bold text-sm cursor-pointer"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => openAuthModal && openAuthModal('signin')}
              className="flex-1 py-3 rounded-2xl btn-secondary font-bold text-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4 cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Difficulty Selector */}
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

        {/* Difficulty Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] self-start sm:self-auto">
          {Object.entries(DIFFICULTY_CONFIG).map(([key, item]) => {
            const isSelected = difficulty === key;
            return (
              <button
                key={key}
                onClick={() => {
                  soundEffects.playClick();
                  setDifficulty(key);
                }}
                className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label} ({item.min}-{item.max})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Play Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="surface-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top Stat Pills */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full badge-lime uppercase tracking-wider">
                Range: {config.min}–{config.max}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 bg-[var(--bg-elevated)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                  <Trophy className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                  Best:{' '}
                  <strong className="font-mono-stats text-[var(--text-primary)]">
                    {bestScore ? `${bestScore} tries` : '—'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Target Display or Mystery Box */}
            <div className="text-center my-6">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--primary-accent-border)] mb-4 shadow-sm">
                <motion.span
                  key={gameState === 'playing' ? 'hidden' : targetNumber}
                  initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className="font-mono-stats text-5xl font-extrabold text-[var(--primary-accent)]"
                >
                  {gameState === 'playing' ? '?' : targetNumber}
                </motion.span>
              </div>

              <div className="space-y-1.5 mb-6">
                <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  {gameState === 'playing'
                    ? 'Guess the Secret Number'
                    : gameState === 'won'
                    ? 'Mission Accomplished!'
                    : 'Target Not Found!'}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto font-sans leading-relaxed">
                  {gameState === 'playing'
                    ? `Enter a number between ${config.min} and ${config.max}. Observe the high/low feedback.`
                    : gameState === 'won'
                    ? `You identified the secret number in ${attemptsUsed} tries!`
                    : `The hidden number was ${targetNumber}. Try again with binary search!`}
                </p>
              </div>
            </div>

            {/* Guess Input Form */}
            {gameState === 'playing' ? (
              <form onSubmit={handleGuessSubmit} className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-stats text-xs text-[var(--text-secondary)]">
                      #
                    </span>
                    <input
                      ref={inputRef}
                      type="number"
                      min={config.min}
                      max={config.max}
                      value={userGuess}
                      onChange={(e) => {
                        setUserGuess(e.target.value);
                        setErrorInput('');
                      }}
                      placeholder={`Enter guess (${config.min}-${config.max})`}
                      className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono-stats text-base placeholder:text-[var(--text-secondary)] placeholder:font-sans focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)] transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl btn-primary font-bold text-sm tracking-wide focus:outline-none"
                  >
                    Guess
                  </button>
                </div>

                {errorInput && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 font-medium flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {errorInput}
                  </motion.p>
                )}
              </form>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => initGame(difficulty)}
                  className="w-full py-3.5 rounded-2xl btn-primary font-bold text-sm flex items-center justify-center gap-2 focus:outline-none"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            )}

            {/* Active Feedback Banner */}
            {feedback && (
              <motion.div
                key={feedback.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 ${
                  feedback.type === 'correct'
                    ? 'bg-[var(--primary-accent-subtle)] border-[var(--primary-accent-border)] text-[var(--primary-accent)]'
                    : feedback.type === 'high'
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-primary)]'
                    : feedback.type === 'low'
                    ? 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {feedback.type === 'correct' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--primary-accent)]" />
                ) : feedback.type === 'high' ? (
                  <ArrowDown className="w-5 h-5 shrink-0 text-[var(--primary-accent)]" />
                ) : feedback.type === 'low' ? (
                  <ArrowUp className="w-5 h-5 shrink-0 text-[var(--primary-accent)]" />
                ) : (
                  <HelpCircle className="w-5 h-5 shrink-0 text-[var(--text-secondary)]" />
                )}
                <span className="text-xs sm:text-sm font-medium">{feedback.text}</span>
              </motion.div>
            )}

            {/* Attempts Gauge & Remaining Counter */}
            <div className="mt-6 pt-5 border-t border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  Attempts Used: <strong className="font-mono-stats text-[var(--text-primary)]">{attemptsUsed} / {config.maxAttempts}</strong>
                </span>
                <span className="text-[var(--text-secondary)] font-medium">
                  Remaining: <strong className="font-mono-stats text-[var(--primary-accent)]">{attemptsRemaining}</strong>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-accent)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guess History Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
              <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--primary-accent)]" />
                Attempts History
              </h3>
              <span className="font-mono-stats text-xs font-semibold text-[var(--text-secondary)]">
                {guessHistory.length} Recorded
              </span>
            </div>

            {guessHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-[var(--text-secondary)]">
                <Hash className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs font-medium">No attempts recorded yet.</p>
                <p className="text-[11px] opacity-60">Enter a number to start deducing.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {guessHistory.map((item, index) => (
                  <motion.div
                    key={item.attempt}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      item.type === 'correct'
                        ? 'bg-[var(--primary-accent-subtle)] border-[var(--primary-accent-border)] text-[var(--primary-accent)]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono-stats text-[10px] text-[var(--text-secondary)]">
                        #{item.attempt}
                      </span>
                      <span className="font-mono-stats text-base font-bold">
                        {item.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-[11px]">
                      {item.type === 'correct' && (
                        <span className="text-[var(--primary-accent)] font-bold">Correct!</span>
                      )}
                      {item.type === 'high' && (
                        <span className="text-[var(--text-secondary)] flex items-center gap-1">
                          <ArrowDown className="w-3.5 h-3.5 text-[var(--primary-accent)]" /> Too High
                        </span>
                      )}
                      {item.type === 'low' && (
                        <span className="text-[var(--text-secondary)] flex items-center gap-1">
                          <ArrowUp className="w-3.5 h-3.5 text-[var(--primary-accent)]" /> Too Low
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

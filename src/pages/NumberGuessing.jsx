import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Hash,
  Activity,
  Heart,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    min: 1,
    max: 50,
    maxAttempts: 10,
    color: 'from-emerald-400 to-teal-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  medium: {
    label: 'Medium',
    min: 1,
    max: 100,
    maxAttempts: 7,
    color: 'from-cyan-400 to-blue-500',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  hard: {
    label: 'Hard',
    min: 1,
    max: 500,
    maxAttempts: 8,
    color: 'from-purple-500 to-pink-500',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
};

export const NumberGuessing = ({ setCurrentView }) => {
  const { stats, recordNumberGuessResult } = useGameStats();
  const { addToast } = useToast();

  const [difficulty, setDifficulty] = useState('medium');
  const config = DIFFICULTY_CONFIG[difficulty];

  const [targetNumber, setTargetNumber] = useState(1);
  const [userGuess, setUserGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'high' | 'low' | 'correct' | 'close', text: string }
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
      text: `Game ready! Guess a number between ${curConfig.min} and ${curConfig.max}.`,
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
  const bestScore = stats.numberGuessing[bestScoreKey];

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
      hintText = `Correct Guess! 🎉 The secret number was indeed ${targetNumber}!`;
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
        ? `🔥 Super Close but Too High! (Try a slightly lower number)`
        : `🔻 Too High! Try a lower number.`;
      soundEffects.playHint(true);
    } else {
      hintType = 'low';
      hintText = isClose
        ? `🔥 Super Close but Too Low! (Try a slightly higher number)`
        : `🔺 Too Low! Try a higher number.`;
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
        title: 'Out of Attempts! 💀',
        message: `The secret number was ${targetNumber}. Give it another try!`,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-cyan-500/40 transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Difficulty Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 self-start sm:self-auto">
          {Object.entries(DIFFICULTY_CONFIG).map(([key, item]) => {
            const isSelected = difficulty === key;
            return (
              <button
                key={key}
                onClick={() => {
                  soundEffects.playClick();
                  setDifficulty(key);
                }}
                className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label} ({item.min}-{item.max})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Play Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-cyan rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden shadow-2xl">
            {/* Top Stat Pills */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${config.badge}`}>
                {config.label} Range: {config.min}–{config.max}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  Best: <strong className="text-white">{bestScore ? `${bestScore} tries` : 'None'}</strong>
                </span>
              </div>
            </div>

            {/* Target Display or Mystery Box */}
            <div className="text-center my-6">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 mb-3">
                <motion.span
                  key={gameState === 'playing' ? 'hidden' : targetNumber}
                  initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="font-['Orbitron'] text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300"
                >
                  {gameState === 'playing' ? '?' : targetNumber}
                </motion.span>
                <div className="absolute -inset-1 rounded-3xl bg-cyan-400/20 blur-md pointer-events-none" />
              </div>

              <h2 className="font-['Orbitron'] text-2xl font-bold text-white tracking-wide">
                {gameState === 'playing'
                  ? 'Guess the Secret Number'
                  : gameState === 'won'
                  ? 'Mission Accomplished!'
                  : 'Better Luck Next Time!'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {gameState === 'playing'
                  ? `Enter a number between ${config.min} and ${config.max}. Observe the hints carefully!`
                  : gameState === 'won'
                  ? `Spectacular deduction! You solved it in ${attemptsUsed} ${attemptsUsed === 1 ? 'attempt' : 'attempts'}.`
                  : `You ran out of attempts. The secret number was ${targetNumber}.`}
              </p>
            </div>

            {/* Progress Gauge: Remaining Attempts */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Remaining Attempts
                </span>
                <span className={attemptsRemaining <= 2 ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                  {attemptsRemaining} / {config.maxAttempts}
                </span>
              </div>

              <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full rounded-full transition-all ${
                    attemptsRemaining <= 2
                      ? 'bg-gradient-to-r from-rose-500 to-red-600'
                      : attemptsRemaining <= 4
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  }`}
                />
              </div>

              {/* Heart indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {Array.from({ length: config.maxAttempts }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 transition-all ${
                      i < attemptsRemaining
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-700 fill-slate-800 scale-90 opacity-40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Hint / Feedback Box */}
            {feedback && (
              <motion.div
                key={feedback.text}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl mb-6 text-xs sm:text-sm font-semibold flex items-center gap-3 border ${
                  feedback.type === 'correct'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : feedback.type === 'high'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : feedback.type === 'low'
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="shrink-0">
                  {feedback.type === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {feedback.type === 'high' && <ArrowDown className="w-5 h-5 text-amber-400" />}
                  {feedback.type === 'low' && <ArrowUp className="w-5 h-5 text-sky-400" />}
                  {feedback.type === 'info' && <HelpCircle className="w-5 h-5 text-cyan-400" />}
                </div>
                <span>{feedback.text}</span>
              </motion.div>
            )}

            {/* Input Form or Restart Action */}
            {gameState === 'playing' ? (
              <form onSubmit={handleGuessSubmit} className="space-y-3">
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      ref={inputRef}
                      type="number"
                      placeholder={`Enter guess (${config.min}-${config.max})`}
                      value={userGuess}
                      onChange={(e) => {
                        setUserGuess(e.target.value);
                        setErrorInput('');
                      }}
                      min={config.min}
                      max={config.max}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-['Orbitron'] text-lg placeholder:text-sm placeholder:font-sans placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-['Orbitron'] font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Guess
                  </button>
                </div>

                {errorInput && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 pl-2 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errorInput}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    initGame();
                  }}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 text-black font-['Orbitron'] font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History & Stats Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Stats Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Orbitron'] font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Guess History
              </h3>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  initGame();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                title="Restart Game"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
            </div>

            {guessHistory.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-white/5 border border-dashed border-white/10">
                <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No guesses entered yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Type a number and click Guess to start tracking clues!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {guessHistory.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                        #{item.attempt}
                      </span>
                      <span className="font-['Orbitron'] font-bold text-white text-base">
                        {item.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.type === 'correct' && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correct!
                        </span>
                      )}
                      {item.type === 'high' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> Too High
                        </span>
                      )}
                      {item.type === 'low' && (
                        <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" /> Too Low
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Strategy Tip Box */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-['Orbitron'] text-xs font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Pro Gamer Tip: Binary Search
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always guess the exact middle of the remaining range! For instance, in 1–100, begin at <strong>50</strong>. If it’s Too High, guess <strong>25</strong>; if Too Low, guess <strong>75</strong>. This guarantees finding any number within 7 guesses!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Trophy,
  Bot,
  User,
  Users,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { checkWinner, getBestMove, getEasyMove, WINNING_COMBOS } from '../utils/minimax';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

export const TicTacToe = ({ setCurrentView }) => {
  const { recordTicTacToeResult } = useGameStats();
  const { addToast } = useToast();

  // Settings
  const [gameMode, setGameMode] = useState('ai'); // 'ai' | 'pvp'
  const [aiDifficulty, setAiDifficulty] = useState('hard'); // 'easy' | 'hard'
  const [playerSymbol, setPlayerSymbol] = useState('X'); // 'X' | 'O'
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Board state: Array of 9 (null | 'X' | 'O')
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X'); // 'X' | 'O'
  const [gameResult, setGameResult] = useState(null); // null | { winner: 'X'|'O'|'draw', line: number[]|null }
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Match Scoreboard
  const [scores, setScores] = useState({
    player1: 0,
    player2OrAI: 0,
    draws: 0,
  });

  // Reset current board
  const resetBoard = () => {
    soundEffects.playClick();
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setGameResult(null);
    setIsAiThinking(false);
  };

  // Reset entire match and scores
  const resetMatch = () => {
    soundEffects.playClick();
    resetBoard();
    setScores({ player1: 0, player2OrAI: 0, draws: 0 });
    addToast({
      title: 'Match Reset',
      message: 'Scoreboard reset to 0 - 0. Good luck!',
      type: 'info',
    });
  };

  // AI Turn trigger
  useEffect(() => {
    if (
      gameMode === 'ai' &&
      currentTurn === aiSymbol &&
      !gameResult &&
      !isAiThinking
    ) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const boardCopy = [...board];
        let moveIndex;

        if (aiDifficulty === 'hard') {
          moveIndex = getBestMove(boardCopy, aiSymbol, playerSymbol);
        } else {
          moveIndex = getEasyMove(boardCopy, aiSymbol, playerSymbol);
        }

        if (moveIndex !== null && moveIndex !== undefined) {
          executeMove(moveIndex, aiSymbol);
        }
        setIsAiThinking(false);
      }, 450); // slight delay for natural feel

      return () => clearTimeout(timer);
    }
  }, [board, currentTurn, gameMode, aiSymbol, playerSymbol, gameResult, aiDifficulty]);

  // Execute a move on the board
  const executeMove = (index, symbol) => {
    if (board[index] !== null || gameResult) return;

    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);
    soundEffects.playMove();

    // Check winner
    const result = checkWinner(newBoard);
    if (result) {
      setGameResult(result);

      if (result.winner === 'draw') {
        soundEffects.playHint(false);
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        recordTicTacToeResult({
          outcome: 'draw',
          mode: gameMode,
          difficulty: aiDifficulty,
          winnerSymbol: null,
        });
        addToast({
          title: 'Game Drawn! 🤝',
          message: 'Both players matched tactics evenly.',
          type: 'info',
        });
      } else {
        const isHumanWinner =
          gameMode === 'pvp' || result.winner === playerSymbol;

        if (isHumanWinner) {
          soundEffects.playWin();
          triggerConfetti();
          setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
          recordTicTacToeResult({
            outcome: 'win',
            mode: gameMode,
            difficulty: aiDifficulty,
            winnerSymbol: result.winner,
          });
          addToast({
            title: `Player ${result.winner} Wins! 🏆`,
            message:
              gameMode === 'ai'
                ? `You vanquished the ${aiDifficulty.toUpperCase()} AI!`
                : `Superb match! Player ${result.winner} took the crown.`,
            type: 'success',
          });
        } else {
          soundEffects.playGameOver();
          setScores((prev) => ({ ...prev, player2OrAI: prev.player2OrAI + 1 }));
          recordTicTacToeResult({
            outcome: 'loss',
            mode: gameMode,
            difficulty: aiDifficulty,
            winnerSymbol: result.winner,
          });
          addToast({
            title: 'AI Won! 🤖',
            message: 'The AI executed a flawless sequence. Rematch?',
            type: 'error',
          });
        }
      }
    } else {
      // Toggle turn
      setCurrentTurn(symbol === 'X' ? 'O' : 'X');
    }
  };

  // Human click cell
  const handleCellClick = (index) => {
    if (board[index] !== null || gameResult || isAiThinking) return;

    // In AI mode, ignore clicks when it's AI's turn
    if (gameMode === 'ai' && currentTurn !== playerSymbol) return;

    executeMove(index, currentTurn);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-purple-500/40 transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Mode & AI Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('ai');
                resetBoard();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                gameMode === 'ai'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Vs AI
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('pvp');
                resetBoard();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                gameMode === 'pvp'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              2 Players
            </button>
          </div>

          {/* AI Difficulty (only in AI mode) */}
          {gameMode === 'ai' && (
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAiDifficulty('easy');
                  resetBoard();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  aiDifficulty === 'easy'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Easy AI
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAiDifficulty('hard');
                  resetBoard();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  aiDifficulty === 'hard'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Minimax (Hard)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Game Board Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative">
            {/* Status & Turn Banner */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Turn:
                </span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    currentTurn === 'X'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}
                >
                  <span className="font-['Orbitron']">{currentTurn}</span>
                  {gameMode === 'ai' && (
                    <span className="text-[10px] opacity-75">
                      ({currentTurn === playerSymbol ? 'You' : 'AI'})
                    </span>
                  )}
                </div>
              </div>

              {/* Symbol selector when board is untouched */}
              {board.every((c) => c === null) && gameMode === 'ai' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 text-[11px] mr-1">You play:</span>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayerSymbol('X');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      playerSymbol === 'X'
                        ? 'bg-cyan-500 text-black shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    X
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayerSymbol('O');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      playerSymbol === 'O'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    O
                  </button>
                </div>
              )}
            </div>

            {/* 3x3 Grid Board */}
            <div className="relative aspect-square max-w-[340px] sm:max-w-[380px] mx-auto grid grid-cols-3 gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
              {board.map((cell, idx) => {
                const isWinningCell = gameResult?.line?.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={cell !== null || isAiThinking || !!gameResult}
                    className={`relative rounded-2xl flex items-center justify-center font-['Orbitron'] text-4xl sm:text-5xl font-extrabold transition-all duration-200 select-none ${
                      cell === null
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 cursor-pointer'
                        : 'bg-white/[0.07] border border-white/15 cursor-default'
                    } ${
                      isWinningCell
                        ? cell === 'X'
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/40 scale-105'
                          : 'bg-purple-500/30 border-2 border-purple-400 shadow-lg shadow-purple-500/40 scale-105'
                        : ''
                    }`}
                    aria-label={`Cell ${idx + 1}, ${cell || 'empty'}`}
                  >
                    <AnimatePresence>
                      {cell && (
                        <motion.span
                          initial={{ scale: 0, rotate: -45, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                          className={
                            cell === 'X'
                              ? 'text-cyan-400 text-glow-cyan'
                              : 'text-purple-400 text-glow-purple'
                          }
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            {/* AI Thinking Overlay or Winner Announcement */}
            {isAiThinking && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-purple-300">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>AI is calculating optimal move...</span>
              </div>
            )}

            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
              >
                <h3 className="font-['Orbitron'] font-bold text-lg text-white mb-1">
                  {gameResult.winner === 'draw'
                    ? "It's a Stalemate Draw!"
                    : gameMode === 'ai'
                    ? gameResult.winner === playerSymbol
                      ? 'Victory! You Won!'
                      : 'AI Outsmarted You!'
                    : `Player ${gameResult.winner} Triumphs!`}
                </h3>
                <p className="text-xs text-slate-400">
                  {gameResult.winner === 'draw'
                    ? 'Remarkable defensive play from both sides.'
                    : `Winning combo: cells [${gameResult.line?.map((n) => n + 1).join(', ')}]`}
                </p>
              </motion.div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={resetBoard}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Board
              </button>
              <button
                onClick={resetMatch}
                className="py-3 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-purple-500/40 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                New Match
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard & Mode Information Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scoreboard */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-['Orbitron'] font-bold text-sm text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              Match Scoreboard
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Player 1 */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[11px] font-bold text-cyan-300 uppercase block">
                  {gameMode === 'ai' ? 'You (P1)' : 'Player X'}
                </span>
                <span className="font-['Orbitron'] text-3xl font-extrabold text-white mt-1 block">
                  {scores.player1}
                </span>
                <span className="text-[10px] text-slate-400">Wins</span>
              </div>

              {/* Draws */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Ties
                </span>
                <span className="font-['Orbitron'] text-3xl font-extrabold text-slate-300 mt-1 block">
                  {scores.draws}
                </span>
                <span className="text-[10px] text-slate-400">Draws</span>
              </div>

              {/* Player 2 or AI */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[11px] font-bold text-purple-300 uppercase block">
                  {gameMode === 'ai' ? 'AI Bot' : 'Player O'}
                </span>
                <span className="font-['Orbitron'] text-3xl font-extrabold text-white mt-1 block">
                  {scores.player2OrAI}
                </span>
                <span className="text-[10px] text-slate-400">Wins</span>
              </div>
            </div>
          </div>

          {/* Minimax Algorithm Explainer */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-['Orbitron'] text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Minimax Algorithm Powered
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In <strong>Minimax (Hard)</strong> mode, the AI simulates every possible permutation of remaining moves and chooses the mathematically optimal pathway with alpha-beta pruning. It is practically unbeatable! Can you force a draw or spot an opening?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

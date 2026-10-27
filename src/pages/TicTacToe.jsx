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
  Shield,
  HelpCircle,
  Sparkles,
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
      message: 'Scoreboard reset to 0 - 0.',
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
      }, 450);

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
                ? `You outplayed Minimax AI on ${aiDifficulty} mode!`
                : `Player ${result.winner} secured victory.`,
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
            title: 'AI Claimed Victory',
            message: 'Minimax AI found the optimal sequence. Try again!',
            type: 'error',
          });
        }
      }
    } else {
      // Toggle turn
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    }
  };

  const handleCellClick = (index) => {
    if (isAiThinking || gameResult) return;
    if (gameMode === 'ai' && currentTurn !== playerSymbol) return;
    executeMove(index, currentTurn);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Navigation */}
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

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('ai');
                resetBoard();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                gameMode === 'ai'
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>vs AI</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('pvp');
                resetBoard();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                gameMode === 'pvp'
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Players</span>
            </button>
          </div>

          {gameMode === 'ai' && (
            <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAiDifficulty('easy');
                  resetBoard();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  aiDifficulty === 'easy'
                    ? 'bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setAiDifficulty('hard');
                  resetBoard();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  aiDifficulty === 'hard'
                    ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
          <div className="w-full surface-card rounded-3xl p-6 sm:p-8 relative">
            {/* Status & Turn Banner */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Turn:
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-lime">
                  <span className="font-mono-stats">{currentTurn}</span>
                  {gameMode === 'ai' && (
                    <span className="text-[10px] opacity-80">
                      ({currentTurn === playerSymbol ? 'You' : 'AI'})
                    </span>
                  )}
                </div>
              </div>

              {/* Symbol selector when board is untouched */}
              {board.every((c) => c === null) && gameMode === 'ai' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[var(--text-secondary)] text-[11px]">Symbol:</span>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayerSymbol('X');
                    }}
                    className={`px-2.5 py-0.5 rounded-lg font-mono-stats font-bold transition-all ${
                      playerSymbol === 'X'
                        ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}
                  >
                    X
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayerSymbol('O');
                    }}
                    className={`px-2.5 py-0.5 rounded-lg font-mono-stats font-bold transition-all ${
                      playerSymbol === 'O'
                        ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                    }`}
                  >
                    O
                  </button>
                </div>
              )}
            </div>

            {/* 3x3 Monochrome Board with Lime-Green Highlights */}
            <div className="relative aspect-square max-w-[340px] sm:max-w-[380px] mx-auto grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              {board.map((cell, idx) => {
                const isWinningCell = gameResult?.line?.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={cell !== null || isAiThinking || !!gameResult}
                    className={`relative rounded-2xl flex items-center justify-center font-heading text-4xl sm:text-5xl font-extrabold transition-all duration-200 select-none ${
                      cell === null
                        ? 'bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/80 border border-[var(--border-color)] hover:border-[var(--primary-accent-border)] active:scale-95 cursor-pointer'
                        : 'bg-[var(--bg-card)] border border-[var(--border-color)] cursor-default'
                    } ${
                      isWinningCell
                        ? 'bg-[var(--primary-accent-subtle)] border-2 border-[var(--primary-accent)] scale-105 shadow-md shadow-[var(--primary-accent)]/20'
                        : ''
                    }`}
                    aria-label={`Grid cell ${idx + 1}, ${cell || 'empty'}`}
                  >
                    <AnimatePresence>
                      {cell && (
                        <motion.span
                          initial={{ scale: 0, rotate: -30, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', damping: 14 }}
                          className={
                            cell === 'X'
                              ? 'text-[var(--primary-accent)]'
                              : 'text-[var(--text-primary)]'
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

            {/* AI Calculating indicator */}
            {isAiThinking && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--primary-accent)]">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>AI evaluating optimal response...</span>
              </div>
            )}

            {/* Winner Announcement Banner */}
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center space-y-2"
              >
                <h4 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                  {gameResult.winner === 'draw'
                    ? 'Game Tied!'
                    : `Player ${gameResult.winner} Triumphs!`}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  {gameResult.winner === 'draw'
                    ? 'Both sides played balanced moves.'
                    : gameMode === 'ai'
                    ? gameResult.winner === playerSymbol
                      ? 'You successfully bypassed Minimax calculation!'
                      : 'AI claimed 3-in-a-row.'
                    : `Player ${gameResult.winner} connected 3 in a row.`}
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetBoard}
                    className="px-6 py-2 rounded-xl btn-primary text-xs font-bold inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Next Round</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={resetBoard}
                className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold flex items-center gap-1.5 focus:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Board
              </button>

              <button
                onClick={resetMatch}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/40 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Match
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--primary-accent)]" />
                Match Scoreboard
              </h3>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                {gameMode === 'ai' ? `vs AI (${aiDifficulty})` : '2 Players (PvP)'}
              </span>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Player 1 */}
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                  {gameMode === 'ai' ? 'You' : 'Player X'}
                </p>
                <p className="font-mono-stats text-3xl font-extrabold text-[var(--primary-accent)] my-1">
                  {scores.player1}
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">Wins</span>
              </div>

              {/* Draws */}
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                <p className="text-[11px] font-medium text-[var(--text-secondary)]">Draws</p>
                <p className="font-mono-stats text-3xl font-extrabold text-[var(--text-primary)] my-1">
                  {scores.draws}
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">Ties</span>
              </div>

              {/* Player 2 or AI */}
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                  {gameMode === 'ai' ? 'AI Bot' : 'Player O'}
                </p>
                <p className="font-mono-stats text-3xl font-extrabold text-[var(--text-secondary)] my-1">
                  {scores.player2OrAI}
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">Wins</span>
              </div>
            </div>

            {/* Strategy Insight */}
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
              <span className="font-heading font-bold text-[var(--primary-accent)] block text-sm">
                Minimax Intelligence
              </span>
              <p className="leading-relaxed">
                Minimax evaluates all remaining game paths depth-first. Securing corners or forcing forks is key to a tie or victory on Hard mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

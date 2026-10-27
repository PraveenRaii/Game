import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Globe,
  Link,
  Copy,
  Check,
  Share2,
  LogOut,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { checkWinner, getBestMove, getEasyMove, WINNING_COMBOS } from '../utils/minimax';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';
import { multiplayer } from '../utils/multiplayer';

export const TicTacToe = ({ setCurrentView, openAuthModal, initialRoomCode = '' }) => {
  const { recordTicTacToeResult } = useGameStats();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Settings: 'ai' | 'pvp' | 'online'
  const [gameMode, setGameMode] = useState(initialRoomCode ? 'online' : 'ai');
  const [aiDifficulty, setAiDifficulty] = useState('hard'); // 'easy' | 'hard'
  const [playerSymbol, setPlayerSymbol] = useState('X'); // 'X' | 'O'
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Online Multiplayer State
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState(initialRoomCode || '');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'code' | 'link' | null
  const [onlineError, setOnlineError] = useState('');

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

  /* ========================================================
     ONLINE 2-DEVICE ROOM LOGIC
  ======================================================== */

  const isHost =
    onlineRoom?.host?.id === currentUser?.id ||
    onlineRoom?.host?.username === currentUser?.username;
  const myOnlineSymbol = isHost ? 'X' : 'O';
  const isMyOnlineTurn = onlineRoom?.currentTurn === myOnlineSymbol;

  // Auto-join if initialRoomCode provided
  useEffect(() => {
    if (initialRoomCode && !currentUser?.isGuest) {
      setGameMode('online');
      setJoinCodeInput(initialRoomCode);
      handleJoinOnlineRoom(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Subscribe to live room updates (Polling + BroadcastChannel)
  useEffect(() => {
    if (gameMode !== 'online' || !onlineRoom?.code) return;

    // 1. Polling interval
    const interval = setInterval(async () => {
      const res = await multiplayer.fetchRoom(onlineRoom.code);
      if (res.success && res.room) {
        setOnlineRoom(res.room);
      }
    }, 750);

    // 2. BroadcastChannel subscription for multi-tab
    const unsubscribe = multiplayer.subscribe((updatedRoom) => {
      if (updatedRoom.code === onlineRoom.code) {
        setOnlineRoom(updatedRoom);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [gameMode, onlineRoom?.code]);

  // Play audio & show toast on online winner change
  const prevOnlineWinnerRef = useRef(null);
  useEffect(() => {
    if (gameMode !== 'online' || !onlineRoom) return;

    if (onlineRoom.winner && onlineRoom.winner !== prevOnlineWinnerRef.current) {
      if (onlineRoom.winner === myOnlineSymbol) {
        soundEffects.playWin();
        triggerConfetti();
        addToast({
          title: 'You Won! 🏆',
          message: 'Victory in 2-Device Online Match!',
          type: 'success',
        });
      } else if (onlineRoom.winner === 'draw') {
        soundEffects.playHint(false);
        addToast({
          title: 'Match Tied! 🤝',
          message: 'Both players matched tactics evenly.',
          type: 'info',
        });
      } else {
        soundEffects.playGameOver();
        addToast({
          title: 'Opponent Won This Round',
          message: `${onlineRoom.winner === 'X' ? onlineRoom.host.name : onlineRoom.guest?.name} took the round. Rematch?`,
          type: 'info',
        });
      }
    }
    prevOnlineWinnerRef.current = onlineRoom.winner;
  }, [gameMode, onlineRoom?.winner, myOnlineSymbol]);

  // Create room
  const handleCreateOnlineRoom = async () => {
    soundEffects.playClick();
    setIsCreatingRoom(true);
    setOnlineError('');
    const res = await multiplayer.createRoom(currentUser, 'tic-tac-toe');
    setIsCreatingRoom(false);
    if (res.success && res.room) {
      setOnlineRoom(res.room);
      soundEffects.playWin();
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('room', res.room.code);
        window.history.replaceState({}, '', url.toString());
      }
      addToast({
        title: `Room Created: ${res.room.code} 🎮`,
        message: 'Share the Room Code or Invite Link with Player 2!',
        type: 'success',
      });
    } else {
      setOnlineError(res.message || 'Could not create room.');
    }
  };

  // Join room with code
  const handleJoinOnlineRoom = async (codeToJoin = joinCodeInput) => {
    const code = (codeToJoin || '').trim().toUpperCase();
    if (!code) {
      setOnlineError('Please enter a valid Room Code (e.g. GZ-4821).');
      soundEffects.playHint(false);
      return;
    }
    soundEffects.playClick();
    setIsJoining(true);
    setOnlineError('');
    const res = await multiplayer.joinRoom(code, currentUser);
    setIsJoining(false);
    if (res.success && res.room) {
      setOnlineRoom(res.room);
      soundEffects.playWin();
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('room', res.room.code);
        window.history.replaceState({}, '', url.toString());
      }
      addToast({
        title: `Joined Room ${res.room.code}! ⚔️`,
        message: `Playing against ${res.room.host.name}!`,
        type: 'success',
      });
    } else {
      setOnlineError(res.message || 'Could not join room. Please check code.');
      soundEffects.playHint(false);
    }
  };

  // Make move in online room
  const handleOnlineCellClick = async (index) => {
    if (!onlineRoom || onlineRoom.status !== 'playing') {
      soundEffects.playHint(false);
      addToast({
        title: 'Waiting for Opponent',
        message: 'Send the code or shareable link to Player 2 to join!',
        type: 'info',
      });
      return;
    }
    if (onlineRoom.winner) return;
    if (onlineRoom.board[index] !== null) return;
    if (!isMyOnlineTurn) {
      soundEffects.playHint(false);
      addToast({
        title: "Opponent's Turn",
        message: `Please wait for ${onlineRoom.currentTurn === 'X' ? onlineRoom.host.name : onlineRoom.guest?.name} to move.`,
        type: 'info',
      });
      return;
    }

    soundEffects.playMove();

    // Optimistic local update
    const previous = { ...onlineRoom };
    const optimisticBoard = [...onlineRoom.board];
    optimisticBoard[index] = myOnlineSymbol;
    setOnlineRoom({
      ...onlineRoom,
      board: optimisticBoard,
      currentTurn: myOnlineSymbol === 'X' ? 'O' : 'X',
    });

    const res = await multiplayer.makeMove(onlineRoom.code, {
      playerId: currentUser.id || currentUser.username,
      cellIndex: index,
      symbol: myOnlineSymbol,
    });

    if (res.success && res.room) {
      setOnlineRoom(res.room);
    } else {
      setOnlineRoom(previous);
      if (res.message) {
        addToast({ title: 'Move Failed', message: res.message, type: 'error' });
      }
    }
  };

  // Rematch
  const handleOnlineRematch = async () => {
    if (!onlineRoom?.code) return;
    soundEffects.playClick();
    const res = await multiplayer.rematch(onlineRoom.code);
    if (res.success && res.room) {
      setOnlineRoom(res.room);
      addToast({
        title: 'New Round Started! ⚔️',
        message: 'Board reset for both devices.',
        type: 'info',
      });
    }
  };

  // Leave room
  const handleLeaveOnlineRoom = () => {
    soundEffects.playClick();
    setOnlineRoom(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      url.searchParams.delete('join');
      window.history.replaceState({}, '', url.toString());
    }
    addToast({
      title: 'Left Room',
      message: 'Returned to multiplayer lobby.',
      type: 'info',
    });
  };

  // Copy code
  const handleCopyCode = () => {
    if (!onlineRoom?.code) return;
    soundEffects.playClick();
    navigator.clipboard.writeText(onlineRoom.code);
    setCopiedType('code');
    setTimeout(() => setCopiedType(null), 2000);
    addToast({
      title: 'Room Code Copied! 📋',
      message: `Code ${onlineRoom.code} copied to clipboard.`,
      type: 'info',
    });
  };

  // Copy shareable link
  const handleCopyLink = () => {
    if (!onlineRoom?.code) return;
    soundEffects.playClick();
    const link = multiplayer.getShareableLink(onlineRoom.code);
    navigator.clipboard.writeText(link);
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 2000);
    addToast({
      title: 'Invite Link Copied! 🔗',
      message: 'Send this link to your friend on mobile or desktop to play!',
      type: 'success',
    });
  };

  // Mobile native share (WhatsApp, Messages, etc.)
  const handleNativeShare = async () => {
    if (!onlineRoom?.code) return;
    const link = multiplayer.getShareableLink(onlineRoom.code);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my GameZone Match!',
          text: `Hey! Join my Tic-Tac-Toe 1v1 match on GameZone. Room Code: ${onlineRoom.code}`,
          url: link,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
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
              You must create an account or sign in to play Tic-Tac-Toe, challenge AI, and record match victories.
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
              <span>Local 2P</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('online');
                resetBoard();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                gameMode === 'online'
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>2-Device Room 🌐</span>
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

      {/* 2-DEVICE MULTIPLAYER LOBBY (When Online Mode & No Active Room) */}
      {gameMode === 'online' && !onlineRoom && (
        <div className="surface-card rounded-3xl p-6 sm:p-10 border border-[var(--border-color)] shadow-xl mb-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Real-Time 2-Device Multiplayer</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
              Play Across 2 Devices via Code or Share Link
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
              Host a private room and send the 6-digit code or link to your friend on any mobile, tablet, or PC to battle live.
            </p>
          </div>

          {onlineError && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{onlineError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Card 1: Create Private Room */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-col justify-between space-y-4 text-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[var(--text-primary)]">
                  Create Private Room
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                  Start a match as Host (X). You will get a unique code &amp; one-click invite link to send your friend.
                </p>
              </div>

              <button
                onClick={handleCreateOnlineRoom}
                disabled={isCreatingRoom}
                className="w-full py-3 rounded-xl btn-primary font-bold text-xs flex items-center justify-center gap-2"
              >
                {isCreatingRoom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Room...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Create Room &amp; Get Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Join with Code */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-col justify-between space-y-4 text-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--primary-accent)] flex items-center justify-center mx-auto mb-3">
                  <Link className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[var(--text-primary)]">
                  Join with Room Code
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                  Enter the 6-character code (e.g. GZ-4821) shared by your friend to join.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. GZ-4821"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setOnlineError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinOnlineRoom()}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono-stats font-bold text-center tracking-widest text-sm uppercase focus:outline-none focus:border-[var(--primary-accent)]"
                />

                <button
                  onClick={() => handleJoinOnlineRoom()}
                  disabled={isJoining}
                  className="w-full py-3 rounded-xl btn-secondary font-bold text-xs flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Join Match</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GAME VIEW: Shown when playing AI, Local 2P, or Connected to Online Room */}
      {(gameMode !== 'online' || onlineRoom) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Game Board Column */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full surface-card rounded-3xl p-6 sm:p-8 relative">
              {/* Online Room Control Banner (Top of Card) */}
              {gameMode === 'online' && onlineRoom && (
                <div className="mb-6 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Room Code:
                    </span>
                    <span className="font-mono-stats font-bold text-sm text-[var(--primary-accent)] px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                      {onlineRoom.code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary-accent-border)] transition-all cursor-pointer"
                      title="Copy Room Code"
                    >
                      {copiedType === 'code' ? (
                        <Check className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-secondary cursor-pointer"
                    >
                      {copiedType === 'link' ? (
                        <Check className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                      ) : (
                        <Link className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Link</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="p-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors sm:hidden cursor-pointer"
                      title="Share via App"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleLeaveOnlineRoom}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Leave</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting for Opponent Pulse Banner */}
              {gameMode === 'online' && onlineRoom && onlineRoom.status === 'waiting' && (
                <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--primary-accent-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-accent)] animate-ping" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-accent)] absolute" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Waiting for Player 2 to Connect...
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                        Share Code <span className="font-mono-stats text-[var(--primary-accent)] font-bold">{onlineRoom.code}</span> or the invite link.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold btn-primary shrink-0 cursor-pointer"
                  >
                    Share Link
                  </button>
                </div>
              )}

              {/* Status & Turn Banner */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Turn:
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-lime">
                    <span className="font-mono-stats">
                      {gameMode === 'online' && onlineRoom ? onlineRoom.currentTurn : currentTurn}
                    </span>
                    {gameMode === 'ai' && (
                      <span className="text-[10px] opacity-80">
                        ({currentTurn === playerSymbol ? 'You' : 'AI'})
                      </span>
                    )}
                    {gameMode === 'online' && onlineRoom && (
                      <span className="text-[10px] opacity-80">
                        ({isMyOnlineTurn ? 'Your Turn' : 'Opponent'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Symbol selector when board is untouched (AI mode) */}
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

                {/* Online Player Badge */}
                {gameMode === 'online' && onlineRoom && (
                  <div className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                    <span>You:</span>
                    <span className="font-mono-stats font-bold text-[var(--primary-accent)] px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                      {myOnlineSymbol} ({isHost ? 'Host' : 'Challenger'})
                    </span>
                  </div>
                )}
              </div>

              {/* 3x3 Monochrome Board with Lime-Green Highlights */}
              <div className="relative aspect-square max-w-[340px] sm:max-w-[380px] mx-auto grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                {(gameMode === 'online' && onlineRoom ? onlineRoom.board : board).map((cell, idx) => {
                  const winningLine =
                    gameMode === 'online' && onlineRoom ? onlineRoom.winningLine : gameResult?.line;
                  const isWinningCell = winningLine?.includes(idx);
                  const isOnlineDisabled =
                    gameMode === 'online'
                      ? cell !== null ||
                        !isMyOnlineTurn ||
                        onlineRoom?.status !== 'playing' ||
                        !!onlineRoom?.winner
                      : cell !== null || isAiThinking || !!gameResult;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        gameMode === 'online' ? handleOnlineCellClick(idx) : handleCellClick(idx)
                      }
                      disabled={isOnlineDisabled}
                      className={`relative rounded-2xl flex items-center justify-center font-heading text-4xl sm:text-5xl font-extrabold transition-all duration-200 select-none ${
                        cell === null
                          ? isOnlineDisabled
                            ? 'bg-[var(--bg-card)] border border-[var(--border-color)] opacity-60 cursor-not-allowed'
                            : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/80 border border-[var(--border-color)] hover:border-[var(--primary-accent-border)] active:scale-95 cursor-pointer'
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

              {/* Winner Announcement Banner (Local & AI) */}
              {gameMode !== 'online' && gameResult && (
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
                      className="px-6 py-2 rounded-xl btn-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Next Round</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Winner Announcement Banner (Online 2-Device Mode) */}
              {gameMode === 'online' && onlineRoom?.winner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--primary-accent-border)] text-center space-y-2"
                >
                  <h4 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                    {onlineRoom.winner === 'draw'
                      ? 'Match Tied! 🤝'
                      : onlineRoom.winner === myOnlineSymbol
                      ? 'You Won This Round! 🏆'
                      : 'Opponent Won This Round!'}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    {onlineRoom.winner === 'draw'
                      ? 'Both players defended flawlessly.'
                      : onlineRoom.winner === myOnlineSymbol
                      ? `Great tactics! You connected 3 in a row with ${myOnlineSymbol}.`
                      : `${onlineRoom.winner === 'X' ? onlineRoom.host.name : onlineRoom.guest?.name} made the winning connection.`}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={handleOnlineRematch}
                      className="px-6 py-2 rounded-xl btn-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Play Rematch ⚔️</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                {gameMode === 'online' ? (
                  <>
                    <button
                      onClick={handleOnlineRematch}
                      className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold flex items-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Board
                    </button>

                    <button
                      onClick={handleLeaveOnlineRoom}
                      className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Leave Room
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={resetBoard}
                      className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold flex items-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Board
                    </button>

                    <button
                      onClick={resetMatch}
                      className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Match
                    </button>
                  </>
                )}
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
                  {gameMode === 'ai'
                    ? `vs AI (${aiDifficulty})`
                    : gameMode === 'pvp'
                    ? '2 Players (Local)'
                    : `Online 2P (Room ${onlineRoom?.code})`}
                </span>
              </div>

              {/* Score Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Player 1 (Host in Online) */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                  <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                    {gameMode === 'ai'
                      ? 'You'
                      : gameMode === 'online' && onlineRoom
                      ? `${onlineRoom.host.name} (X)`
                      : 'Player X'}
                  </p>
                  <p className="font-mono-stats text-3xl font-extrabold text-[var(--primary-accent)] my-1">
                    {gameMode === 'online' && onlineRoom ? onlineRoom.scores.host : scores.player1}
                  </p>
                  <span className="text-[10px] text-[var(--text-secondary)]">Wins</span>
                </div>

                {/* Draws */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                  <p className="text-[11px] font-medium text-[var(--text-secondary)]">Draws</p>
                  <p className="font-mono-stats text-3xl font-extrabold text-[var(--text-primary)] my-1">
                    {gameMode === 'online' && onlineRoom ? onlineRoom.scores.draws : scores.draws}
                  </p>
                  <span className="text-[10px] text-[var(--text-secondary)]">Ties</span>
                </div>

                {/* Player 2 or AI */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center">
                  <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                    {gameMode === 'ai'
                      ? 'AI Bot'
                      : gameMode === 'online' && onlineRoom
                      ? onlineRoom.guest
                        ? `${onlineRoom.guest.name} (O)`
                        : 'Waiting...'
                      : 'Player O'}
                  </p>
                  <p className="font-mono-stats text-3xl font-extrabold text-[var(--text-secondary)] my-1">
                    {gameMode === 'online' && onlineRoom
                      ? onlineRoom.scores.guest
                      : scores.player2OrAI}
                  </p>
                  <span className="text-[10px] text-[var(--text-secondary)]">Wins</span>
                </div>
              </div>

              {/* Online Match Overview or Strategy Insight */}
              {gameMode === 'online' && onlineRoom ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5 text-xs">
                  <span className="font-heading font-bold text-[var(--primary-accent)] block text-sm">
                    Live 2-Device Connection
                  </span>
                  <div className="space-y-1.5 text-[var(--text-secondary)]">
                    <p className="flex justify-between">
                      <span>Room Code:</span>
                      <span className="font-mono-stats font-bold text-[var(--text-primary)]">
                        {onlineRoom.code}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Your Role:</span>
                      <span className="font-semibold text-[var(--primary-accent)]">
                        {isHost ? 'Host (Player X)' : 'Challenger (Player O)'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {onlineRoom.status === 'playing' ? '🟢 Playing Live' : '🟡 Waiting for Player 2'}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <span className="font-heading font-bold text-[var(--primary-accent)] block text-sm">
                    Tactical Strategy
                  </span>
                  <p className="leading-relaxed">
                    Control the center square and opposite corners to create unblockable double forks. Use 2-Device Room mode to duel with friends on mobile or desktop!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

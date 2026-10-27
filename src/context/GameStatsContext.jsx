import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS, DEFAULT_LEADERBOARD } from '../utils/storage';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { soundEffects } from '../audio/soundEffects';
import { api } from '../utils/api';

const GameStatsContext = createContext(null);

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_blood',
    title: 'First Victory',
    desc: 'Win any game on GameZone',
    icon: '🏆',
    rarity: 'Common',
    xp: 50,
  },
  {
    id: 'mind_reader',
    title: 'Mind Reader',
    desc: 'Guess the secret number in 3 or fewer attempts',
    icon: '🧠',
    rarity: 'Rare',
    xp: 150,
  },
  {
    id: 'number_master',
    title: 'Number Master',
    desc: 'Win 5 Number Guessing games',
    icon: '🔢',
    rarity: 'Epic',
    xp: 200,
  },
  {
    id: 'tic_tac_champ',
    title: 'Grid Tactician',
    desc: 'Win a Tic-Tac-Toe match',
    icon: '⚔️',
    rarity: 'Common',
    xp: 50,
  },
  {
    id: 'ai_slayer',
    title: 'AI Conqueror',
    desc: 'Defeat Tic-Tac-Toe on Hard AI difficulty',
    icon: '🤖',
    rarity: 'Legendary',
    xp: 300,
  },
  {
    id: 'puzzle_starter',
    title: 'Tile Slider',
    desc: 'Complete your first Sliding Puzzle game',
    icon: '🧩',
    rarity: 'Common',
    xp: 75,
  },
  {
    id: 'puzzle_pro',
    title: 'Speed Solver',
    desc: 'Solve a 3x3 puzzle in under 60 seconds',
    icon: '⚡',
    rarity: 'Epic',
    xp: 200,
  },
  {
    id: 'grid_conqueror',
    title: 'Dimension Breaker',
    desc: 'Solve a 4x4 or 5x5 sliding puzzle',
    icon: '🌌',
    rarity: 'Legendary',
    xp: 350,
  },
  {
    id: 'streak_king',
    title: 'Unstoppable Streak',
    desc: 'Achieve a winning streak of 3 games',
    icon: '🔥',
    rarity: 'Rare',
    xp: 150,
  },
  {
    id: 'gaming_legend',
    title: 'Tri-Game Master',
    desc: 'Earn at least one victory in all 3 games',
    icon: '👑',
    rarity: 'Legendary',
    xp: 500,
  },
];

const DEFAULT_STATS = {
  totalGamesPlayed: 0,
  totalWins: 0,
  totalDraws: 0,
  totalLosses: 0,
  currentStreak: 0,
  bestStreak: 0,
  numberGuessing: {
    played: 0,
    wins: 0,
    bestEasy: null,
    bestMedium: null,
    bestHard: null,
  },
  ticTacToe: {
    played: 0,
    winsVsAI: 0,
    winsVsHuman: 0,
    lossesVsAI: 0,
    draws: 0,
    hardAiWins: 0,
  },
  puzzle: {
    played: 0,
    wins: 0,
    best3x3: null,
    best4x4: null,
    best5x5: null,
  },
  galaxyStrike: {
    played: 0,
    wins: 0,
    highScoreSolo: 0,
    highScoreTeam: 0,
    highestWave: 1,
  },
};

export const GameStatsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(() => {
    return getFromStorage(STORAGE_KEYS.STATS, DEFAULT_STATS);
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    return getFromStorage(STORAGE_KEYS.ACHIEVEMENTS, []);
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    return getFromStorage(STORAGE_KEYS.LEADERBOARD, DEFAULT_LEADERBOARD);
  });

  const [customGames, setCustomGames] = useState([]);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'disconnected'

  // Load custom games and MongoDB Leaderboard on mount
  useEffect(() => {
    const fetchMongoData = async () => {
      try {
        const health = await api.checkHealth();
        setDbStatus(health.database === 'connected' ? 'connected' : 'disconnected');

        // Fetch games from MongoDB
        const gamesRes = await api.getGames(true);
        if (gamesRes.success && gamesRes.games) {
          setCustomGames(gamesRes.games);
        }

        // Fetch scores from MongoDB
        const scoresRes = await api.getScores();
        if (scoresRes.success && scoresRes.scores?.length > 0) {
          const formatted = scoresRes.scores.map((s) => ({
            id: s._id,
            name: s.playerName,
            avatar: s.playerAvatar,
            photo: s.playerPhoto,
            game: s.game,
            score: s.score,
            points: s.points,
            date: s.date,
          }));
          setLeaderboard(formatted);
        }
      } catch (err) {
        console.warn('Initial MongoDB sync notice:', err);
        setDbStatus('disconnected');
      }
    };

    fetchMongoData();
  }, []);

  // Sync stats to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STATS, stats);
  }, [stats]);

  // Sync achievements
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, unlockedAchievements);
  }, [unlockedAchievements]);

  // Sync leaderboard
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LEADERBOARD, leaderboard);
  }, [leaderboard]);

  // Refresh games list (used by Admin)
  const refreshGames = async () => {
    try {
      const res = await api.getGames(true);
      if (res.success && res.games) {
        setCustomGames(res.games);
      }
    } catch (err) {
      console.warn('Failed to refresh games:', err);
    }
  };

  // Unlock achievement helper
  const unlockAchievement = useCallback(
    (achievementId) => {
      setUnlockedAchievements((prev) => {
        if (prev.some((a) => a.id === achievementId)) return prev;

        const ach = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
        if (!ach) return prev;

        const newUnlocked = {
          ...ach,
          unlockedAt: new Date().toISOString(),
          unlockedBy: currentUser.username,
        };

        soundEffects.playAchievement();
        addToast({
          title: `Achievement Unlocked: ${ach.icon} ${ach.title}!`,
          message: `${ach.desc} (+${ach.xp} XP)`,
          type: 'achievement',
          duration: 5000,
        });

        return [...prev, newUnlocked];
      });
    },
    [addToast, currentUser.username]
  );

  // Add record to leaderboard (MongoDB sync + LocalStorage)
  const addLeaderboardEntry = useCallback(
    async ({ game, score, points }) => {
      const entryPoints = points || Math.floor(Math.random() * 200 + 700);

      // Attempt to post to MongoDB
      try {
        await api.submitScore({
          playerName: currentUser.name || currentUser.username,
          playerAvatar: currentUser.avatar || '🎮',
          playerPhoto: currentUser.photo || '',
          userId: currentUser.id || '',
          game,
          score,
          points: entryPoints,
        });
      } catch {
        // fallback
      }

      const entry = {
        id: 'lb_' + Date.now(),
        name: currentUser.name || currentUser.username,
        avatar: currentUser.avatar || '🎮',
        photo: currentUser.photo || '',
        game,
        score,
        points: entryPoints,
        date: new Date().toISOString().split('T')[0],
      };

      setLeaderboard((prev) => {
        const updated = [entry, ...prev];
        return updated.sort((a, b) => b.points - a.points).slice(0, 50);
      });
    },
    [currentUser]
  );

  // 1. Record Number Guessing Result
  const recordNumberGuessResult = useCallback(
    ({ won, attempts, difficulty }) => {
      setStats((prev) => {
        const nextStats = { ...prev };
        nextStats.totalGamesPlayed += 1;
        nextStats.numberGuessing.played += 1;

        if (won) {
          nextStats.totalWins += 1;
          nextStats.numberGuessing.wins += 1;
          nextStats.currentStreak += 1;
          if (nextStats.currentStreak > nextStats.bestStreak) {
            nextStats.bestStreak = nextStats.currentStreak;
          }

          const diffKey = difficulty === 'easy' ? 'bestEasy' : difficulty === 'hard' ? 'bestHard' : 'bestMedium';
          const currentBest = nextStats.numberGuessing[diffKey];
          if (currentBest === null || attempts < currentBest) {
            nextStats.numberGuessing[diffKey] = attempts;
          }

          const basePoints = difficulty === 'hard' ? 900 : difficulty === 'medium' ? 600 : 350;
          const pointsEarned = Math.max(100, basePoints - attempts * 35);
          addLeaderboardEntry({
            game: 'Number Guessing',
            score: `${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} (${difficulty})`,
            points: pointsEarned,
          });

          unlockAchievement('first_blood');
          if (attempts <= 3) unlockAchievement('mind_reader');
          if (nextStats.numberGuessing.wins >= 5) unlockAchievement('number_master');
          if (nextStats.currentStreak >= 3) unlockAchievement('streak_king');
          if (
            nextStats.numberGuessing.wins >= 1 &&
            nextStats.ticTacToe.winsVsAI + nextStats.ticTacToe.winsVsHuman >= 1 &&
            nextStats.puzzle.wins >= 1
          ) {
            unlockAchievement('gaming_legend');
          }
        } else {
          nextStats.totalLosses += 1;
          nextStats.currentStreak = 0;
        }

        return nextStats;
      });
    },
    [addLeaderboardEntry, unlockAchievement]
  );

  // 2. Record Tic-Tac-Toe Result
  const recordTicTacToeResult = useCallback(
    ({ outcome, mode, difficulty, winnerSymbol }) => {
      setStats((prev) => {
        const nextStats = { ...prev };
        nextStats.totalGamesPlayed += 1;
        nextStats.ticTacToe.played += 1;

        if (outcome === 'win') {
          nextStats.totalWins += 1;
          nextStats.currentStreak += 1;
          if (nextStats.currentStreak > nextStats.bestStreak) {
            nextStats.bestStreak = nextStats.currentStreak;
          }

          if (mode === 'ai') {
            nextStats.ticTacToe.winsVsAI += 1;
            if (difficulty === 'hard') {
              nextStats.ticTacToe.hardAiWins += 1;
              unlockAchievement('ai_slayer');
            }
          } else {
            nextStats.ticTacToe.winsVsHuman += 1;
          }

          unlockAchievement('first_blood');
          unlockAchievement('tic_tac_champ');

          const points = mode === 'ai' && difficulty === 'hard' ? 1000 : 650;
          addLeaderboardEntry({
            game: 'Tic-Tac-Toe',
            score: `Winner (${mode === 'ai' ? `${difficulty} AI` : '2P'})`,
            points,
          });

          if (nextStats.currentStreak >= 3) unlockAchievement('streak_king');
          if (
            nextStats.numberGuessing.wins >= 1 &&
            nextStats.ticTacToe.winsVsAI + nextStats.ticTacToe.winsVsHuman >= 1 &&
            nextStats.puzzle.wins >= 1
          ) {
            unlockAchievement('gaming_legend');
          }
        } else if (outcome === 'loss') {
          nextStats.totalLosses += 1;
          nextStats.currentStreak = 0;
          if (mode === 'ai') nextStats.ticTacToe.lossesVsAI += 1;
        } else if (outcome === 'draw') {
          nextStats.totalDraws += 1;
          nextStats.ticTacToe.draws += 1;
        }

        return nextStats;
      });
    },
    [addLeaderboardEntry, unlockAchievement]
  );

  // 3. Record Puzzle Result
  const recordPuzzleResult = useCallback(
    ({ size, moves, timeSeconds }) => {
      setStats((prev) => {
        const nextStats = { ...prev };
        nextStats.totalGamesPlayed += 1;
        nextStats.totalWins += 1;
        nextStats.puzzle.played += 1;
        nextStats.puzzle.wins += 1;
        nextStats.currentStreak += 1;

        if (nextStats.currentStreak > nextStats.bestStreak) {
          nextStats.bestStreak = nextStats.currentStreak;
        }

        const sizeKey = size === 3 ? 'best3x3' : size === 4 ? 'best4x4' : 'best5x5';
        const currentBest = nextStats.puzzle[sizeKey];

        if (!currentBest || timeSeconds < currentBest.timeSeconds) {
          nextStats.puzzle[sizeKey] = { moves, timeSeconds };
        }

        const mins = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
        const secs = String(timeSeconds % 60).padStart(2, '0');
        const formattedTime = `${mins}:${secs}`;

        const basePoints = size === 5 ? 1400 : size === 4 ? 950 : 600;
        const speedPenalty = Math.floor(timeSeconds * 1.5) + moves * 2;
        const points = Math.max(200, basePoints - speedPenalty);

        addLeaderboardEntry({
          game: 'Puzzle Game',
          score: `${formattedTime} (${size}x${size}, ${moves} moves)`,
          points,
        });

        unlockAchievement('first_blood');
        unlockAchievement('puzzle_starter');

        if (size === 3 && timeSeconds < 60) unlockAchievement('puzzle_pro');
        if (size >= 4) unlockAchievement('grid_conqueror');
        if (nextStats.currentStreak >= 3) unlockAchievement('streak_king');
        if (
          nextStats.numberGuessing.wins >= 1 &&
          nextStats.ticTacToe.winsVsAI + nextStats.ticTacToe.winsVsHuman >= 1 &&
          nextStats.puzzle.wins >= 1
        ) {
          unlockAchievement('gaming_legend');
        }

        return nextStats;
      });
    },
    [addLeaderboardEntry, unlockAchievement]
  );

  // 4. Record Galaxy Strike Result (Solo / Team)
  const recordGalaxyStrikeResult = useCallback(
    ({ score, wave, mode, isWin }) => {
      setStats((prev) => {
        const nextStats = { ...prev };
        nextStats.totalGamesPlayed += 1;
        if (!nextStats.galaxyStrike) {
          nextStats.galaxyStrike = { played: 0, wins: 0, highScoreSolo: 0, highScoreTeam: 0, highestWave: 1 };
        }
        nextStats.galaxyStrike.played += 1;

        if (isWin) {
          nextStats.totalWins += 1;
          nextStats.galaxyStrike.wins += 1;
          nextStats.currentStreak += 1;
          if (nextStats.currentStreak > nextStats.bestStreak) {
            nextStats.bestStreak = nextStats.currentStreak;
          }
        } else {
          nextStats.totalLosses += 1;
          nextStats.currentStreak = 0;
        }

        if (wave > (nextStats.galaxyStrike.highestWave || 1)) {
          nextStats.galaxyStrike.highestWave = wave;
        }

        const scoreKey = mode === 'team' ? 'highScoreTeam' : 'highScoreSolo';
        if (score > (nextStats.galaxyStrike[scoreKey] || 0)) {
          nextStats.galaxyStrike[scoreKey] = score;
        }

        addLeaderboardEntry({
          game: 'Galaxy Strike',
          score: `${score.toLocaleString()} pts (Wave ${wave}, ${mode === 'team' ? 'Team Co-Op' : 'Solo'})`,
          points: score,
        });

        unlockAchievement('first_blood');
        if (nextStats.currentStreak >= 3) unlockAchievement('streak_king');

        return nextStats;
      });
    },
    [addLeaderboardEntry, unlockAchievement]
  );

  return (
    <GameStatsContext.Provider
      value={{
        stats,
        unlockedAchievements,
        leaderboard,
        customGames,
        dbStatus,
        refreshGames,
        recordNumberGuessResult,
        recordTicTacToeResult,
        recordPuzzleResult,
        recordGalaxyStrikeResult,
        unlockAchievement,
      }}
    >
      {children}
    </GameStatsContext.Provider>
  );
};

export const useGameStats = () => {
  const context = useContext(GameStatsContext);
  if (!context) {
    throw new Error('useGameStats must be used within GameStatsProvider');
  }
  return context;
};

// Local Storage helper with defaults and error handling

const STORAGE_KEYS = {
  USERS: 'gamezone_users_list',
  CURRENT_USER: 'gamezone_current_session',
  STATS: 'gamezone_user_stats',
  GAMES_HISTORY: 'gamezone_games_history',
  ACHIEVEMENTS: 'gamezone_achievements',
  LEADERBOARD: 'gamezone_local_leaderboard',
};

// Initial benchmark players for competitive excitement on the local leaderboard
const DEFAULT_LEADERBOARD = [
  { id: 'lb_1', name: 'CyberViper', avatar: '⚡', game: 'Number Guessing', score: '3 attempts', points: 950, date: '2026-10-24' },
  { id: 'lb_2', name: 'NeoMatrix', avatar: '🤖', game: 'Tic-Tac-Toe', score: '12 Wins', points: 1200, date: '2026-10-25' },
  { id: 'lb_3', name: 'QuantumSolve', avatar: '🔮', game: 'Puzzle Game', score: '00:48 (3x3)', points: 1100, date: '2026-10-23' },
  { id: 'lb_4', name: 'PixelKnight', avatar: '🛡️', game: 'Puzzle Game', score: '02:15 (4x4)', points: 890, date: '2026-10-24' },
  { id: 'lb_5', name: 'ShadowGamer', avatar: '🥷', game: 'Number Guessing', score: '4 attempts', points: 820, date: '2026-10-25' },
  { id: 'lb_6', name: 'VortexMaster', avatar: '🌀', game: 'Tic-Tac-Toe', score: '8 Wins', points: 760, date: '2026-10-22' },
];

export const getFromStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Storage get error for ${key}:`, err);
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Storage save error for ${key}:`, err);
  }
};

export { STORAGE_KEYS, DEFAULT_LEADERBOARD };

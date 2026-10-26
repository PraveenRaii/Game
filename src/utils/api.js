// API Service connecting to MongoDB Backend with graceful offline fallbacks

const API_BASE = '/api';

export const api = {
  // Check backend & MongoDB status
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      return await res.json();
    } catch {
      return { status: 'offline', database: 'disconnected' };
    }
  },

  // Auth: Register
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Backend unreachable: ' + err.message };
    }
  },

  // Auth: Login
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Backend unreachable: ' + err.message };
    }
  },

  // Auth: Update Profile (photo, name, avatar, etc.)
  updateProfile: async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Backend unreachable: ' + err.message };
    }
  },

  // Admin: Get all users
  getUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      return await res.json();
    } catch (err) {
      return { success: false, users: [], message: err.message };
    }
  },

  // Admin: Update user role
  updateUserRole: async (userId, role) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Delete user
  deleteUser: async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Games: Get list
  getGames: async (includeInactive = false) => {
    try {
      const res = await fetch(`${API_BASE}/games?includeInactive=${includeInactive}`);
      return await res.json();
    } catch (err) {
      return { success: false, games: [], message: err.message };
    }
  },

  // Admin: Create Game
  createGame: async (gameData) => {
    try {
      const res = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Update Game
  updateGame: async (gameId, gameData) => {
    try {
      const res = await fetch(`${API_BASE}/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Delete Game
  deleteGame: async (gameId) => {
    try {
      const res = await fetch(`${API_BASE}/games/${gameId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Scores: Get Leaderboard
  getScores: async () => {
    try {
      const res = await fetch(`${API_BASE}/scores`);
      return await res.json();
    } catch (err) {
      return { success: false, scores: [], message: err.message };
    }
  },

  // Scores: Submit Score
  submitScore: async (scoreData) => {
    try {
      const res = await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Stats overview
  getAdminStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      return await res.json();
    } catch (err) {
      return { success: false, overview: null, message: err.message };
    }
  },
};

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { Game } from './models/Game.js';
import { Score } from './models/Score.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://praveen1234202040_db_user:DvaKaaXACxLZUTXO@game.belasw3.mongodb.net/gamezone?retryWrites=true&w=majority';

// Middleware
app.use(cors());
// Set JSON body limit to 10mb for profile photo uploads (base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial default games seed
const DEFAULT_GAMES = [
  {
    gameId: 'guess-game',
    title: 'Number Guessing',
    tagline: 'Deduction & Logic',
    description: 'Crack the computer\'s secret number using high/low feedback, fuel gauges, and precision binary search.',
    difficulty: '3 Difficulties (1-500)',
    badges: ['Dynamic Hints', 'Attempt Tracking', 'High-Score History'],
    accentColor: 'cyan',
    icon: 'Target',
    category: 'Logic',
    active: true,
  },
  {
    gameId: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    tagline: 'AI & 2-Player Strategy',
    description: 'Battle local friends or challenge our unbeatable Minimax AI opponent on an interactive glowing neon grid.',
    difficulty: 'Easy & Minimax AI',
    badges: ['Unbeatable Minimax', 'Pass & Play 2P', 'Combos Glow'],
    accentColor: 'purple',
    icon: 'Grid3X3',
    category: 'Strategy',
    active: true,
  },
  {
    gameId: 'puzzle-game',
    title: 'Sliding Puzzle',
    tagline: 'Spatial Intelligence',
    description: 'Slide scrambled numbered tiles into numerical order on 3x3, 4x4, or 5x5 grids with guaranteed solvable boards.',
    difficulty: '3x3 • 4x4 • 5x5',
    badges: ['Solvable Generator', 'Live Stopwatch', 'Smart Hint AI'],
    accentColor: 'pink',
    icon: 'Puzzle',
    category: 'Puzzle',
    active: true,
  },
  {
    gameId: 'car-racing',
    title: 'Cyber Racer',
    tagline: 'High-Speed Neon Highway',
    description: 'Steer through intense highway traffic, collect coins, burn nitro boosts, and survive the cyber rush!',
    difficulty: 'Cruiser • Pro • Mania',
    badges: ['High Speed', 'Nitro Turbo', 'Score Multiplier'],
    accentColor: 'amber',
    icon: 'Car',
    category: 'Arcade',
    active: true,
  },
  {
    gameId: 'galaxy-strike',
    title: 'Galaxy Strike',
    tagline: 'Solo & Team Co-Op Combat',
    description: 'Engage enemy starfleets solo or assemble a 2-Player Squadron with shared laser fire, revives, and EMP blasts.',
    difficulty: 'Solo Mission • Team Co-Op',
    badges: ['2-Player Co-Op', 'Team Revive', 'Wave Combat'],
    accentColor: 'lime',
    icon: 'Rocket',
    category: 'Action',
    active: true,
  },
];

// Seed initial admin & games if needed
const seedDatabase = async () => {
  try {
    // 1. Ensure Admin Account has requested credentials
    await User.findOneAndUpdate(
      {
        $or: [
          { username: 'admin' },
          { email: 'praveen12342020@gmail.com' },
          { role: 'admin' },
        ],
      },
      {
        $set: {
          name: 'Praveen',
          username: 'admin',
          email: 'praveen12342020@gmail.com',
          password: 'praveen@2020',
          role: 'admin',
          avatar: '👑',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Admin account configured (Email: praveen12342020@gmail.com / Username: admin / Password: praveen@2020)');

    // 2. Ensure all default games (including Car Racing) exist in MongoDB
    for (const g of DEFAULT_GAMES) {
      await Game.findOneAndUpdate({ gameId: g.gameId }, { $setOnInsert: g }, { upsert: true });
    }
    console.log('Default games (including Car Racing) synced into MongoDB');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

// Database Connection with Auto-Reconnect & Resilient Options
let isDbConnected = false;

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('MongoDB Atlas Connected successfully!');
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('MongoDB Atlas Disconnected');
});

mongoose.connection.on('error', (err) => {
  isDbConnected = false;
  console.error('MongoDB Atlas Connection Error:', err.message);
});

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4 for reliable cloud host routing
    });
    isDbConnected = true;
    console.log('MongoDB Atlas Initialized!');
    await seedDatabase();
  } catch (err) {
    isDbConnected = false;
    console.error('MongoDB Connection Failed (will retry in 5s):', err.message);
    setTimeout(connectToDatabase, 5000);
  }
};

connectToDatabase();

// Health & Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

/* ========================================================
   AUTHENTICATION ROUTES
======================================================== */

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, password, avatar, photo, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are all required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. name@example.com)' });
    }

    // Strong password validation: at least 8 chars, with both letters and numbers
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ success: false, message: 'Password must contain both letters and numbers' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connecting. Please ensure 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email address is already in use by another player' });
    }

    // Auto-grant admin role if username is 'admin' or explicitly designated
    const userRole = role === 'admin' || cleanUsername === 'admin' ? 'admin' : 'player';

    const newUser = await User.create({
      name: name?.trim() || username.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      avatar: avatar || '🎮',
      photo: photo || '',
      role: userRole,
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        photo: newUser.photo,
        role: newUser.role,
        stats: newUser.stats,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    const msg =
      err.message && err.message.includes('buffering timed out')
        ? 'Database connection timed out. Please allow IP 0.0.0.0/0 in MongoDB Atlas -> Network Access.'
        : err.message;
    res.status(500).json({ success: false, message: msg });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connecting. Please ensure 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.',
      });
    }

    const term = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: term }, { email: term }],
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        photo: user.photo,
        role: user.role,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    const msg =
      err.message && err.message.includes('buffering timed out')
        ? 'Database connection timed out. Please allow IP 0.0.0.0/0 in MongoDB Atlas -> Network Access.'
        : err.message;
    res.status(500).json({ success: false, message: msg });
  }
});

// Update Profile (Name, Avatar, Profile Photo, etc.)
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { userId, name, avatar, photo, password } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (avatar) updateFields.avatar = avatar;
    if (photo !== undefined) updateFields.photo = photo;
    if (password) updateFields.password = password;

    const updated = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: updated._id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        photo: updated.photo,
        role: updated.role,
        stats: updated.stats,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   USER MANAGEMENT ROUTES (Admin)
======================================================== */

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle / Update user role (promote/demote admin)
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['player', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: '-password' });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   GAME MANAGEMENT ROUTES (Admin + Public)
======================================================== */

// Get all games
app.get('/api/games', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { active: true };
    const games = await Game.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new game (Admin)
app.post('/api/games', async (req, res) => {
  try {
    const { title, tagline, description, difficulty, badges, accentColor, icon, category, customUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Generate unique gameId slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let gameId = baseSlug;
    let counter = 1;
    while (await Game.findOne({ gameId })) {
      gameId = `${baseSlug}-${counter++}`;
    }

    const badgesArray = Array.isArray(badges)
      ? badges
      : typeof badges === 'string'
      ? badges.split(',').map((b) => b.trim()).filter(Boolean)
      : [];

    const newGame = await Game.create({
      gameId,
      title: title.trim(),
      tagline: tagline?.trim() || 'New Challenge',
      description: description.trim(),
      difficulty: difficulty || 'Medium',
      badges: badgesArray.length > 0 ? badgesArray : ['New Arrival', 'Interactive'],
      accentColor: accentColor || 'cyan',
      icon: icon || 'Gamepad2',
      category: category || 'Arcade',
      customUrl: customUrl || '',
      active: true,
    });

    res.status(201).json({ success: true, game: newGame });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update game (Admin)
app.put('/api/games/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (typeof updates.badges === 'string') {
      updates.badges = updates.badges.split(',').map((b) => b.trim()).filter(Boolean);
    }

    const updated = await Game.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Game not found' });

    res.json({ success: true, game: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete game (Admin)
app.delete('/api/games/:id', async (req, res) => {
  try {
    const deleted = await Game.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, message: 'Game deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   SCORES & LEADERBOARD ROUTES
======================================================== */

// Get Leaderboard
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find().sort({ points: -1 }).limit(100);
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit Score
app.post('/api/scores', async (req, res) => {
  try {
    const { playerName, playerAvatar, playerPhoto, userId, game, score, points } = req.body;
    if (!playerName || !game || !score) {
      return res.status(400).json({ success: false, message: 'Missing required score fields' });
    }

    const newScore = await Score.create({
      playerName,
      playerAvatar: playerAvatar || '🎮',
      playerPhoto: playerPhoto || '',
      userId: userId || '',
      game,
      score,
      points: points || 500,
      date: new Date().toISOString().split('T')[0],
    });

    // If userId provided, update user stats in MongoDB
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalGamesPlayed': 1, 'stats.totalWins': 1 },
      });
    }

    res.status(201).json({ success: true, score: newScore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete score (Admin)
app.delete('/api/scores/:id', async (req, res) => {
  try {
    const deleted = await Score.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Score not found' });
    res.json({ success: true, message: 'Score removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   2-DEVICE MULTIPLAYER ROOMS (REAL-TIME CODE & SHARE LINK)
======================================================== */

const multiplayerRooms = new Map();

// Helper: 3x3 Winner check
const MULTIPLAYER_WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkRoomWinner(board) {
  for (const combo of MULTIPLAYER_WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
}

// Generate human-friendly 6-char Room Code (e.g. GZ-4892)
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'GZ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Periodic cleanup of inactive rooms (older than 2 hours)
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of multiplayerRooms.entries()) {
    if (now - (room.lastActivity || 0) > 2 * 60 * 60 * 1000) {
      multiplayerRooms.delete(code);
    }
  }
}, 30 * 60 * 1000);

// 1. Create Room (Host)
app.post('/api/rooms/create', (req, res) => {
  try {
    const { game = 'tic-tac-toe', host } = req.body;
    if (!host || !host.name) {
      return res.status(400).json({ success: false, message: 'Host player information is required' });
    }

    const code = generateRoomCode();
    const room = {
      code,
      game,
      host: {
        id: host.id || 'p1_' + Date.now(),
        name: host.name,
        username: host.username || host.name,
        avatar: host.avatar || '🎮',
        photo: host.photo || '',
      },
      guest: null,
      status: 'waiting', // 'waiting' | 'playing' | 'finished'
      board: Array(9).fill(null),
      currentTurn: 'X', // Host is always 'X'
      winner: null,
      winningLine: null,
      scores: { host: 0, guest: 0, draws: 0 },
      lastActivity: Date.now(),
    };

    multiplayerRooms.set(code, room);
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Join Room (Guest)
app.post('/api/rooms/join', (req, res) => {
  try {
    const { code, guest } = req.body;
    if (!code || !guest || !guest.name) {
      return res.status(400).json({ success: false, message: 'Room code and player profile are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const room = multiplayerRooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ success: false, message: `Room ${cleanCode} not found. Please verify code.` });
    }

    // Reconnecting as Host
    const isSameAsHost =
      room.host.id === guest.id ||
      (room.host.username && room.host.username === guest.username);

    if (isSameAsHost) {
      room.lastActivity = Date.now();
      return res.json({ success: true, room, role: 'host' });
    }

    // If room already has guest, check if reconnecting
    if (room.guest) {
      const isSameAsGuest =
        room.guest.id === guest.id ||
        (room.guest.username && room.guest.username === guest.username);

      if (isSameAsGuest) {
        room.lastActivity = Date.now();
        return res.json({ success: true, room, role: 'guest' });
      }

      return res.status(400).json({
        success: false,
        message: `Room ${cleanCode} already has 2 active players.`,
      });
    }

    // First time guest joins
    room.guest = {
      id: guest.id || 'p2_' + Date.now(),
      name: guest.name,
      username: guest.username || guest.name,
      avatar: guest.avatar || '⚡',
      photo: guest.photo || '',
    };
    room.status = 'playing';
    room.lastActivity = Date.now();

    res.json({ success: true, room, role: 'guest' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Get Room Live State (Polling)
app.get('/api/rooms/:code', (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = multiplayerRooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found or expired.' });
    }
    room.lastActivity = Date.now();
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Make Move in Room
app.post('/api/rooms/:code/move', (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = multiplayerRooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const { playerId, cellIndex, symbol } = req.body;

    if (room.status !== 'playing') {
      return res.status(400).json({ success: false, message: 'Game is waiting for opponent to join.' });
    }

    if (room.winner) {
      return res.status(400).json({ success: false, message: 'Game is already completed.' });
    }

    if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex] !== null) {
      return res.status(400).json({ success: false, message: 'Invalid or occupied cell.' });
    }

    if (symbol !== room.currentTurn) {
      return res.status(400).json({ success: false, message: `It is player ${room.currentTurn}'s turn.` });
    }

    // Place move
    room.board[cellIndex] = symbol;

    const result = checkRoomWinner(room.board);
    if (result) {
      room.winner = result.winner;
      room.winningLine = result.line;
      if (result.winner === 'X') room.scores.host += 1;
      else if (result.winner === 'O') room.scores.guest += 1;
      else if (result.winner === 'draw') room.scores.draws += 1;
    } else {
      room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    }

    room.lastActivity = Date.now();
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Rematch / Reset Board
app.post('/api/rooms/:code/rematch', (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = multiplayerRooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    room.board = Array(9).fill(null);
    room.currentTurn = 'X';
    room.winner = null;
    room.winningLine = null;
    room.status = room.guest ? 'playing' : 'waiting';
    room.lastActivity = Date.now();

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Leave Room
app.post('/api/rooms/:code/leave', (req, res) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = multiplayerRooms.get(cleanCode);
    if (room) {
      const { playerId } = req.body;
      if (room.host.id === playerId || room.host.username === playerId) {
        multiplayerRooms.delete(cleanCode);
      } else if (room.guest && (room.guest.id === playerId || room.guest.username === playerId)) {
        room.guest = null;
        room.status = 'waiting';
      }
    }
    res.json({ success: true, message: 'Left room successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ========================================================
   ADMIN OVERVIEW METRICS
======================================================== */

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ active: true });
    const totalScores = await Score.countDocuments();
    const recentUsers = await User.find({}, '-password').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalGames,
        activeGames,
        totalScores,
        dbConnected: isDbConnected,
      },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve static production build (Vite dist) if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }
    next();
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`GameZone MongoDB Backend running on http://localhost:${PORT}`);
});

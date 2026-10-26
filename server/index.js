import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

// Database Connection
let isDbConnected = false;
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    isDbConnected = true;
    console.log('MongoDB Atlas Connected successfully!');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed:', err.message);
  });

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

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Auto-grant admin role if username is 'admin' or explicitly designated
    const userRole = role === 'admin' || cleanUsername === 'admin' ? 'admin' : 'player';

    const newUser = await User.create({
      name: name?.trim() || username.trim(),
      username: cleanUsername,
      email: email?.trim().toLowerCase() || '',
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
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
    res.status(500).json({ success: false, message: err.message });
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

// Start listening
app.listen(PORT, () => {
  console.log(`GameZone MongoDB Backend running on http://localhost:${PORT}`);
});

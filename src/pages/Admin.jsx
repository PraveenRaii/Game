import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Gamepad2,
  Trophy,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Database,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  Layers,
  AlertTriangle,
  Car,
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useGameStats } from '../context/GameStatsContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const Admin = ({ setCurrentView }) => {
  const { currentUser, isAdmin } = useAuth();
  const { refreshGames } = useGameStats();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('games'); // 'games' | 'users' | 'scores'
  const [dbStatus, setDbStatus] = useState('checking');
  const [statsOverview, setStatsOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null); // User object to delete

  // Games state
  const [gamesList, setGamesList] = useState([]);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null); // null if adding new
  const [deleteConfirmGame, setDeleteConfirmGame] = useState(null); // Game object to delete

  // Scores state
  const [scoresList, setScoresList] = useState([]);

  // Form State for Add / Edit Game
  const [gameForm, setGameForm] = useState({
    title: '',
    tagline: '',
    description: '',
    difficulty: 'Medium',
    badges: 'High Speed, Multiplayer',
    accentColor: 'cyan',
    icon: 'Gamepad2',
    category: 'Arcade',
    customUrl: '',
    active: true,
  });

  // Fetch all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, gamesRes, scoresRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(),
        api.getGames(true),
        api.getScores(),
      ]);

      if (statsRes.success) {
        setStatsOverview(statsRes.overview);
        setDbStatus(statsRes.overview.dbConnected ? 'connected' : 'disconnected');
      }

      if (usersRes.success) {
        setUsersList(usersRes.users || []);
      }

      if (gamesRes.success) {
        setGamesList(gamesRes.games || []);
      }

      if (scoresRes.success) {
        setScoresList(scoresRes.scores || []);
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
      setDbStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Game Form Submission (Create or Edit)
  const handleSaveGame = async (e) => {
    e.preventDefault();
    if (!gameForm.title || !gameForm.description) {
      addToast({ title: 'Validation Error', message: 'Title and description are required.', type: 'error' });
      return;
    }

    try {
      if (editingGame) {
        const res = await api.updateGame(editingGame._id, gameForm);
        if (res.success) {
          addToast({ title: 'Game Updated! 🎮', message: `${gameForm.title} details updated in MongoDB.`, type: 'success' });
          soundEffects.playWin();
        }
      } else {
        const res = await api.createGame(gameForm);
        if (res.success) {
          addToast({ title: 'Game Created! 🚀', message: `${gameForm.title} added to GameZone.`, type: 'success' });
          soundEffects.playWin();
        }
      }

      setGameModalOpen(false);
      setEditingGame(null);
      await loadAdminData();
      await refreshGames();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Toggle Game Active status
  const handleToggleGameStatus = async (game) => {
    soundEffects.playClick();
    const updatedStatus = !game.active;
    try {
      const res = await api.updateGame(game._id, { active: updatedStatus });
      if (res.success) {
        setGamesList((prev) =>
          prev.map((g) => (g._id === game._id ? { ...g, active: updatedStatus } : g))
        );
        addToast({
          title: updatedStatus ? 'Game Activated' : 'Game Hidden',
          message: `${game.title} is now ${updatedStatus ? 'visible to players' : 'hidden'}.`,
          type: 'info',
        });
        await refreshGames();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Delete Game confirmed
  const confirmDeleteGame = async () => {
    if (!deleteConfirmGame) return;
    soundEffects.playClick();
    try {
      const res = await api.deleteGame(deleteConfirmGame._id);
      if (res.success) {
        setGamesList((prev) => prev.filter((g) => g._id !== deleteConfirmGame._id));
        addToast({ title: 'Game Deleted 🗑️', message: `${deleteConfirmGame.title} was removed from MongoDB.`, type: 'info' });
        await refreshGames();
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setDeleteConfirmGame(null);
    }
  };

  // Toggle User Role (Promote / Demote)
  const handleToggleUserRole = async (user) => {
    soundEffects.playClick();
    const nextRole = user.role === 'admin' ? 'player' : 'admin';
    try {
      const res = await api.updateUserRole(user._id, nextRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
        );
        addToast({
          title: 'Role Updated',
          message: `@${user.username} is now ${nextRole.toUpperCase()}.`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Delete User confirmed
  const confirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    soundEffects.playClick();
    try {
      const targetId = deleteConfirmUser._id || deleteConfirmUser.id;
      const res = await api.deleteUser(targetId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
        soundEffects.playHint(false);
        addToast({
          title: 'User Deleted! 🗑️',
          message: `@${deleteConfirmUser.username} has been permanently deleted from MongoDB.`,
          type: 'info',
        });
      } else {
        addToast({ title: 'Error', message: res.message || 'Failed to delete user', type: 'error' });
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setDeleteConfirmUser(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (game) => {
    soundEffects.playClick();
    setEditingGame(game);
    setGameForm({
      title: game.title,
      tagline: game.tagline || '',
      description: game.description,
      difficulty: game.difficulty || 'Medium',
      badges: Array.isArray(game.badges) ? game.badges.join(', ') : game.badges || '',
      accentColor: game.accentColor || 'cyan',
      icon: game.icon || 'Gamepad2',
      category: game.category || 'Arcade',
      customUrl: game.customUrl || '',
      active: game.active !== false,
    });
    setGameModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    soundEffects.playClick();
    setEditingGame(null);
    setGameForm({
      title: '',
      tagline: '',
      description: '',
      difficulty: 'Medium',
      badges: 'Multiplayer, High Speed',
      accentColor: 'cyan',
      icon: 'Gamepad2',
      category: 'Arcade',
      customUrl: '',
      active: true,
    });
    setGameModalOpen(true);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & DB Health Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => {
              soundEffects.playClick();
              setCurrentView('home');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-cyan-500/40 transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-['Orbitron'] text-3xl font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-cyan-400" />
              GameZone Admin Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Delete users, add or edit games, and monitor MongoDB Atlas synchronization
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-2xl glass-panel border flex items-center gap-2.5 text-xs font-bold ${
              dbStatus === 'connected'
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20'
                : 'border-rose-500/40 text-rose-300 bg-rose-950/20'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>MongoDB: {dbStatus === 'connected' ? 'Connected (Atlas)' : 'Disconnected / Local'}</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              loadAdminData();
            }}
            className="p-2.5 rounded-xl glass-panel border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Users
            </p>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="font-['Orbitron'] text-3xl font-extrabold text-white">
            {statsOverview?.totalUsers ?? usersList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Registered in MongoDB</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Games
            </p>
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-['Orbitron'] text-3xl font-extrabold text-white">
            {gamesList.filter((g) => g.active).length} / {gamesList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Playable on dashboard</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recorded Scores
            </p>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="font-['Orbitron'] text-3xl font-extrabold text-white">
            {statsOverview?.totalScores ?? scoresList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Hall of fame records</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Logged in Admin
            </p>
            <UserCheck className="w-5 h-5 text-pink-400" />
          </div>
          <p className="font-['Orbitron'] text-xl font-bold text-pink-400">
            {currentUser.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{currentUser.email || currentUser.username}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('games');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Games Management ({gamesList.length})
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('users');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Users &amp; Deletion ({usersList.length})
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('scores');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'scores'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard Records ({scoresList.length})
          </button>
        </div>

        {activeTab === 'games' && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Add New Game
          </button>
        )}
      </div>

      {/* TAB 1: GAMES MANAGEMENT (ADD & EDIT SECTION) */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-['Orbitron'] text-lg font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              Game Catalog &amp; Custom Games
            </h2>
            <button
              onClick={openCreateModal}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another game
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesList.map((game) => (
              <div
                key={game._id || game.gameId}
                className={`glass-panel rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                  game.active ? 'border-white/10' : 'border-rose-500/30 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                        game.active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {game.active ? 'Active' : 'Hidden'}
                    </span>

                    <span className="text-xs font-bold text-slate-400 uppercase bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
                      {game.difficulty}
                    </span>
                  </div>

                  <h3 className="font-['Orbitron'] font-bold text-xl text-white mb-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mb-3">{game.tagline}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {game.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {game.badges?.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Controls: Edit, Hide/Show, Delete */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleGameStatus(game)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      game.active
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {game.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{game.active ? 'Hide' : 'Publish'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(game)}
                    className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                    title="Edit Game Details"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmGame(game)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                    title="Delete Game"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER DATA MANAGEMENT & USER DELETION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, username, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-400">
              Showing <strong>{filteredUsers.length}</strong> of <strong>{usersList.length}</strong> registered players
            </p>
          </div>

          {/* Users Table */}
          <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/5 border-b border-white/10 font-['Orbitron']">
                  <tr>
                    <th scope="col" className="px-6 py-4">Player / Photo</th>
                    <th scope="col" className="px-6 py-4">Email</th>
                    <th scope="col" className="px-6 py-4">Role</th>
                    <th scope="col" className="px-6 py-4">Games Played</th>
                    <th scope="col" className="px-6 py-4">Victories</th>
                    <th scope="col" className="px-6 py-4">Joined Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Delete &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 text-xs">
                        No users found in MongoDB.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id || user.id} className="hover:bg-white/5 transition-colors">
                        {/* Player Profile & Photo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.photo ? (
                              <img
                                src={user.photo}
                                alt={user.name}
                                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
                                {user.avatar || '🎮'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white text-sm">{user.name}</p>
                              <p className="text-[10px] text-slate-400">@{user.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-slate-400">
                          {user.email || <span className="text-slate-600">None provided</span>}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {user.role || 'player'}
                          </span>
                        </td>

                        {/* Games Played */}
                        <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                          {user.stats?.totalGamesPlayed ?? 0}
                        </td>

                        {/* Wins */}
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                          {user.stats?.totalWins ?? 0}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-slate-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'Recent'}
                        </td>

                        {/* Actions (Role & Direct Delete) */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserRole(user)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                                user.role === 'admin'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                              }`}
                              title={user.role === 'admin' ? 'Demote to Player' : 'Promote to Admin'}
                            >
                              {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>

                            <button
                              onClick={() => setDeleteConfirmUser(user)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1 font-bold text-xs"
                              title="Delete User Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCORES MANAGEMENT */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/5 border-b border-white/10 font-['Orbitron']">
                  <tr>
                    <th scope="col" className="px-6 py-4">Player</th>
                    <th scope="col" className="px-6 py-4">Game</th>
                    <th scope="col" className="px-6 py-4">Result</th>
                    <th scope="col" className="px-6 py-4">XP Points</th>
                    <th scope="col" className="px-6 py-4">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scoresList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400 text-xs">
                        No scores recorded in MongoDB yet.
                      </td>
                    </tr>
                  ) : (
                    scoresList.map((sc) => (
                      <tr key={sc._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                          <span>{sc.playerAvatar || '🎮'}</span>
                          <span>{sc.playerName}</span>
                        </td>
                        <td className="px-6 py-4 text-cyan-300">{sc.game}</td>
                        <td className="px-6 py-4 font-mono">{sc.score}</td>
                        <td className="px-6 py-4 font-['Orbitron'] font-bold text-white">
                          {sc.points} XP
                        </td>
                        <td className="px-6 py-4 text-slate-500">{sc.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT GAME MODAL */}
      <AnimatePresence>
        {gameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl glass-panel-glow p-6 sm:p-8 border border-white/10 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['Orbitron'] font-bold text-lg text-white">
                      {editingGame ? 'Edit Game Section' : 'Add New Game'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Syncs directly with MongoDB Atlas cluster
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setGameModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGame} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Memory Matrix or Cyber Racer"
                    value={gameForm.title}
                    onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Speed & Reflexes"
                    value={gameForm.tagline}
                    onChange={(e) => setGameForm({ ...gameForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe the gameplay, rules, and objective..."
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Difficulty
                    </label>
                    <select
                      value={gameForm.difficulty}
                      onChange={(e) => setGameForm({ ...gameForm, difficulty: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1120] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Cruiser • Pro • Mania">Multi-Tier</option>
                      <option value="Adaptive">Adaptive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Accent Theme
                    </label>
                    <select
                      value={gameForm.accentColor}
                      onChange={(e) => setGameForm({ ...gameForm, accentColor: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1120] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="cyan">Neon Cyan</option>
                      <option value="purple">Neon Purple</option>
                      <option value="pink">Neon Pink</option>
                      <option value="amber">Warm Amber</option>
                      <option value="emerald">Emerald Green</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Badges (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Reflexes, Leaderboard, Pro"
                    value={gameForm.badges}
                    onChange={(e) => setGameForm({ ...gameForm, badges: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={gameForm.active}
                      onChange={(e) => setGameForm({ ...gameForm, active: e.target.checked })}
                      className="rounded accent-cyan-500 w-4 h-4"
                    />
                    <span>Publish game immediately (Visible to all players)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setGameModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40"
                  >
                    {editingGame ? 'Save Changes' : 'Create Game'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE USER MODAL */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-rose-500/40 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto mb-3 text-rose-400 shadow-lg shadow-rose-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to permanently delete player{' '}
                <strong className="text-rose-400">@{deleteConfirmUser.username}</strong>? This action will remove all their data from MongoDB.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white border border-white/10 bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 hover:scale-102"
                >
                  Yes, Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE GAME MODAL */}
      <AnimatePresence>
        {deleteConfirmGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-rose-500/40 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto mb-3 text-rose-400 shadow-lg shadow-rose-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                Delete Game?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to remove <strong className="text-cyan-300">{deleteConfirmGame.title}</strong> from GameZone?
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmGame(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white border border-white/10 bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteGame}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 hover:scale-102"
                >
                  Yes, Delete Game
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

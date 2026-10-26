import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Gamepad2,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../audio/soundEffects';

export const Leaderboard = ({ setCurrentView }) => {
  const { leaderboard, stats, dbStatus } = useGameStats();
  const { currentUser } = useAuth();
  const [filterGame, setFilterGame] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    { id: 'all', label: 'All Games' },
    { id: 'Car Racing', label: 'Car Racing' },
    { id: 'Number Guessing', label: 'Number Guessing' },
    { id: 'Tic-Tac-Toe', label: 'Tic-Tac-Toe' },
    { id: 'Puzzle Game', label: 'Sliding Puzzle' },
  ];

  const filteredEntries = leaderboard.filter((entry) => {
    const matchesGame = filterGame === 'all' || entry.game === filterGame;
    const matchesSearch =
      entry.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.score?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGame && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
          <h1 className="font-['Orbitron'] text-3xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            GameZone Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global rankings &amp; personal bests • Synchronized with MongoDB Atlas
          </p>
        </div>

        {/* Database Sync Pill */}
        <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <span>{dbStatus === 'connected' ? 'MongoDB Atlas Live' : 'Local Records'}</span>
        </div>
      </div>

      {/* User's Personal Stats Highlight Card */}
      <div className="glass-panel-cyan rounded-3xl p-6 sm:p-7 border border-cyan-500/30 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser.photo ? (
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-3xl shadow-lg">
                {currentUser.avatar}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentUser.isGuest ? 'Guest' : `@${currentUser.username}`}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Games: <strong className="text-white">{stats.totalGamesPlayed}</strong> | Wins:{' '}
                <strong className="text-emerald-400">{stats.totalWins}</strong> | Best Streak:{' '}
                <strong className="text-amber-400">{stats.bestStreak} 🔥</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                setCurrentView('achievements');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              View Badges
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Game Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-auto overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundEffects.playClick();
                setFilterGame(opt.id);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                filterGame === opt.id
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search players or score..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/5 border-b border-white/10 font-['Orbitron']">
              <tr>
                <th scope="col" className="px-6 py-4">Rank</th>
                <th scope="col" className="px-6 py-4">Player</th>
                <th scope="col" className="px-6 py-4">Game</th>
                <th scope="col" className="px-6 py-4">Best Performance</th>
                <th scope="col" className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 text-xs">
                    No leaderboard records matching your filter. Play a game to record a score!
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row, index) => {
                  const isUser = row.name === currentUser.name;
                  return (
                    <motion.tr
                      key={row.id || index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:bg-white/5 transition-colors ${
                        isUser ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 font-bold font-['Orbitron']">
                        {index === 0 ? (
                          <span className="flex items-center gap-1.5 text-yellow-400">
                            <Crown className="w-4 h-4 fill-yellow-400" /> #1
                          </span>
                        ) : index === 1 ? (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Medal className="w-4 h-4 text-slate-300" /> #2
                          </span>
                        ) : index === 2 ? (
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <Medal className="w-4 h-4 text-amber-600" /> #3
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-2">#{index + 1}</span>
                        )}
                      </td>

                      {/* Player */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.photo ? (
                            <img
                              src={row.photo}
                              alt={row.name}
                              className="w-8 h-8 rounded-xl object-cover border border-cyan-400/40 shadow-sm"
                            />
                          ) : (
                            <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10">
                              {row.avatar || '🎮'}
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {row.name}
                              {isUser && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {row.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Game */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                          {row.game}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 font-mono font-bold text-cyan-300">
                        {row.score}
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 text-right font-['Orbitron'] font-bold text-white">
                        {row.points?.toLocaleString()} XP
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  ArrowLeft,
  Award,
  Calendar,
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </button>
          <h1 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[var(--primary-accent)]" />
            GameZone Leaderboard
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Global rankings &amp; personal bests • Synchronized with high precision
          </p>
        </div>

        {/* Database Sync Pill */}
        <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-full badge-lime text-xs font-semibold flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected' ? 'bg-[var(--primary-accent)] animate-pulse' : 'bg-[var(--primary-accent)]'
            }`}
          />
          <span>{dbStatus === 'connected' ? 'Atlas Cloud Sync' : 'Local Standings'}</span>
        </div>
      </div>

      {/* User's Personal Stats Highlight Card */}
      <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser.photo ? (
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--primary-accent-border)] shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center text-3xl shadow-sm">
                {currentUser.avatar}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-lime">
                  {currentUser.isGuest ? 'Guest' : `@${currentUser.username}`}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--primary-accent)]">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                Games Played: <strong className="font-mono-stats text-[var(--text-primary)]">{stats.totalGamesPlayed}</strong> | Total Wins:{' '}
                <strong className="font-mono-stats text-[var(--primary-accent)]">{stats.totalWins}</strong> | Best Streak:{' '}
                <strong className="font-mono-stats text-[var(--primary-accent)]">{stats.bestStreak}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                setCurrentView('achievements');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-secondary flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Game Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] w-full sm:w-auto overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                soundEffects.playClick();
                setFilterGame(opt.id);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                filterGame === opt.id
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search player or score..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="surface-card rounded-3xl border border-[var(--border-color)] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)] font-sans">
            <thead className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-elevated)] border-b border-[var(--border-color)] font-heading font-bold">
              <tr>
                <th scope="col" className="px-6 py-4">Rank</th>
                <th scope="col" className="px-6 py-4">Player</th>
                <th scope="col" className="px-6 py-4">Game</th>
                <th scope="col" className="px-6 py-4">Best Performance</th>
                <th scope="col" className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[var(--text-secondary)] text-xs">
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
                      className={`hover:bg-[var(--bg-elevated)] transition-colors ${
                        isUser ? 'bg-[var(--primary-accent-subtle)]' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 font-mono-stats font-bold">
                        {index === 0 ? (
                          <span className="flex items-center gap-1.5 text-[var(--primary-accent)]">
                            <Crown className="w-4 h-4 fill-current" /> #1
                          </span>
                        ) : index === 1 ? (
                          <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                            <Medal className="w-4 h-4" /> #2
                          </span>
                        ) : index === 2 ? (
                          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Medal className="w-4 h-4" /> #3
                          </span>
                        ) : (
                          <span className="text-[var(--text-secondary)] pl-2">#{index + 1}</span>
                        )}
                      </td>

                      {/* Player */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.photo ? (
                            <img
                              src={row.photo}
                              alt={row.name}
                              className="w-8 h-8 rounded-xl object-cover border border-[var(--primary-accent-border)]"
                            />
                          ) : (
                            <span className="text-lg flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--primary-accent)]">
                              {row.avatar || '🎮'}
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              {row.name}
                              {isUser && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded badge-lime">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {row.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Game */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]">
                          {row.game}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 font-mono-stats font-bold text-[var(--primary-accent)]">
                        {row.score}
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 text-right font-mono-stats font-bold text-[var(--text-primary)]">
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Award,
  Info,
  Home,
  Volume2,
  VolumeX,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Layers,
  ShieldAlert,
  Sun,
  Moon,
  Camera,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGameStats } from '../context/GameStatsContext';

export const Navbar = ({ currentView, setCurrentView, openAuthModal, openProfileModal }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { stats } = useGameStats();
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMuted(soundEffects.getIsMuted());
  }, []);

  const handleToggleSound = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
    if (!next) {
      soundEffects.playClick();
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Layers },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'about', label: 'About', icon: Info },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  const handleNavigate = (viewId) => {
    soundEffects.playClick();
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Best score calculation for compact display
  const bestScoreDisplay = (() => {
    if (stats.totalWins > 0) return `${stats.totalWins} Wins`;
    if (stats.highScores?.carRacing) return `${stats.highScores.carRacing}m`;
    if (stats.totalGamesPlayed > 0) return `${stats.totalGamesPlayed} Played`;
    return '0 Pts';
  })();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-card)]/90 border-b border-[var(--border-color)] transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with Lime-Green Accent */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-98 focus:outline-none"
            aria-label="GameZone Home"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] group-hover:border-[var(--primary-accent-border)] transition-all duration-200">
              <Gamepad2 className="w-6 h-6 text-[var(--primary-accent)] transition-transform duration-200 group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary-accent)]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-[var(--text-primary)]">
                  Game<span className="text-[var(--primary-accent)]">Zone</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)] tracking-wider uppercase hidden sm:inline-block">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
                Small Games. Big Brain.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'text-[var(--primary-accent)] bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary-accent)]' : 'text-[var(--text-secondary)]'}`} />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--primary-accent)] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Best Score, Profile, Sound & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Compact Best Score Indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]"
              title="Player's top platform record"
            >
              <Trophy className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Best:</span>
              <span className="font-mono-stats font-bold text-[var(--primary-accent)]">
                {bestScoreDisplay}
              </span>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] hover:border-[var(--primary-accent-border)] text-[var(--text-secondary)] hover:text-[var(--primary-accent)] transition-all duration-200 focus:outline-none"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[var(--primary-accent)]" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--primary-accent)]" />
              )}
            </button>

            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] hover:border-[var(--primary-accent-border)] text-[var(--text-secondary)] hover:text-[var(--primary-accent)] transition-all duration-200 focus:outline-none"
              aria-label="Toggle audio effects"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-[var(--text-secondary)] opacity-60" />
              ) : (
                <Volume2 className="w-5 h-5 text-[var(--primary-accent)]" />
              )}
            </button>

            {/* Compact Player Profile / Auth Trigger */}
            {currentUser.isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-xl text-xs font-bold btn-primary"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] hover:border-[var(--primary-accent-border)] transition-all focus:outline-none"
                >
                  {currentUser.photo ? (
                    <img
                      src={currentUser.photo}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-xl object-cover border border-[var(--primary-accent-border)]"
                    />
                  ) : (
                    <span className="text-lg flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border border-[var(--primary-accent-border)]">
                      {currentUser.avatar}
                    </span>
                  )}

                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[90px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[var(--primary-accent)]">
                      {currentUser.role === 'admin' ? 'Admin 👑' : 'Player'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl surface-card p-2 border border-[var(--border-color)] z-50 shadow-2xl"
                    >
                      <div className="p-2 border-b border-[var(--border-color)] flex items-center gap-2.5">
                        {currentUser.photo ? (
                          <img
                            src={currentUser.photo}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-[var(--primary-accent-border)]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center text-xl">
                            {currentUser.avatar}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] truncate">@{currentUser.username}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openProfileModal();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors mt-1"
                      >
                        <Camera className="w-4 h-4 text-[var(--primary-accent)]" />
                        Customize Profile
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavigate('admin');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--primary-accent)] hover:bg-[var(--primary-accent-subtle)] rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-[var(--primary-accent)]" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigate('leaderboard');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-[var(--primary-accent)]" />
                        Leaderboard
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-elevated)] rounded-xl transition-colors mt-1 border-t border-[var(--border-color)]"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-[var(--primary-accent)]" /> : <Moon className="w-5 h-5 text-[var(--primary-accent)]" />}
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-[var(--text-secondary)]" /> : <Volume2 className="w-5 h-5 text-[var(--primary-accent)]" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-4 space-y-2 overflow-hidden"
          >
            {/* Mobile Best Score Pill */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs mb-3">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Trophy className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                Best Score:
              </span>
              <span className="font-mono-stats font-bold text-[var(--primary-accent)]">
                {bestScoreDisplay}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-[var(--primary-accent)] bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-3 border-t border-[var(--border-color)]">
              {currentUser.isGuest ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-center text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="w-full py-2.5 rounded-xl btn-primary text-center text-xs font-bold"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="text-xl">{currentUser.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{currentUser.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">@{currentUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openProfileModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[var(--primary-accent)]" />
                    Customize Profile
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-[var(--bg-elevated)] flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

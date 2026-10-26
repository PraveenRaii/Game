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
  Sparkles,
  ChevronDown,
  Layers,
  ShieldAlert,
  Sun,
  Moon,
  Camera,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ currentView, setCurrentView, openAuthModal, openProfileModal }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    { id: 'achievements', label: 'Achievements', icon: Award },
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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090b16]/85 border-b border-white/10 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Slogan */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0a0c1a] rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Orbitron'] font-extrabold text-2xl tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
                  GameZone
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest hidden sm:inline-block">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wider">
                Play, Think &amp; Win!
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isAdminTab = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? isAdminTab
                        ? 'text-pink-300 bg-pink-500/10 border border-pink-500/30 shadow-sm shadow-pink-500/20'
                        : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                      : isAdminTab
                      ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Theme, Sound, Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-400 transition-all duration-200"
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-300 transition-all duration-200"
              aria-label="Toggle audio effects"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
              )}
            </button>

            {/* Auth Button or User Profile Dropdown */}
            {currentUser.isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="relative group px-4 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-slate-900" />
                    Sign Up
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 transition-all"
                >
                  {/* Photo or Avatar Icon */}
                  {currentUser.photo ? (
                    <img
                      src={currentUser.photo}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-xl object-cover border border-cyan-400/50 shadow-sm"
                    />
                  ) : (
                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30">
                      {currentUser.avatar}
                    </span>
                  )}

                  <div className="text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-purple-300">
                      {currentUser.role === 'admin' ? 'Admin 👑' : 'Player'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-purple-300" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl border border-white/10 z-50"
                    >
                      <div className="p-2 border-b border-white/10 flex items-center gap-2.5">
                        {currentUser.photo ? (
                          <img
                            src={currentUser.photo}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                            {currentUser.avatar}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">@{currentUser.username}</p>
                        </div>
                      </div>

                      {/* Customize Photo Action */}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openProfileModal();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-xl transition-colors mt-1"
                      >
                        <Camera className="w-4 h-4 text-cyan-400" />
                        Change Photo / Avatar
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavigate('admin');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-pink-300 hover:text-pink-200 hover:bg-pink-500/10 rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-pink-400" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigate('leaderboard');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        My Leaderboard Rank
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigate('achievements');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Award className="w-4 h-4 text-purple-400" />
                        My Achievements
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 border-t border-white/5"
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
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
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
            className="md:hidden border-t border-white/10 bg-[#090b16]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}

              <div className="pt-3 border-t border-white/10">
                {currentUser.isGuest ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('signin');
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-center border border-white/20 bg-white/5 text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal('signup');
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-md shadow-cyan-500/30"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                    <div className="flex items-center gap-2.5">
                      {currentUser.photo ? (
                        <img src={currentUser.photo} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <span className="text-2xl">{currentUser.avatar}</span>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{currentUser.name}</p>
                        <p className="text-xs text-purple-300">@{currentUser.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openProfileModal();
                        }}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                        title="Edit Profile & Photo"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="Sign Out"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, LogIn, UserPlus, Gamepad2, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const AuthModal = ({ isOpen, onClose, initialTab = 'signup' }) => {
  const { login, signup, AVATARS } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In form
  const [signInData, setSignInData] = useState({ identifier: '', password: '' });

  // Sign Up form
  const [signUpData, setSignUpData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    avatar: '🎮',
    photo: '',
  });

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignUpData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signInData.identifier || !signInData.password) {
      setErrorMsg('Please enter both username/email and password.');
      soundEffects.playHint(false);
      return;
    }

    const res = await login(signInData);
    if (res.success) {
      addToast({
        title: `Welcome back, ${res.user.name}!`,
        message: 'Successfully logged in to GameZone.',
        type: 'success',
      });
      onClose();
    } else {
      setErrorMsg(res.message);
      soundEffects.playHint(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signUpData.username || !signUpData.password) {
      setErrorMsg('Username and password are required.');
      soundEffects.playHint(false);
      return;
    }

    if (signUpData.username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      soundEffects.playHint(false);
      return;
    }

    if (signUpData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      soundEffects.playHint(false);
      return;
    }

    const res = await signup(signUpData);
    if (res.success) {
      addToast({
        title: `Welcome to GameZone, ${res.user.name}!`,
        message: 'Your player profile is created & stored.',
        type: 'success',
      });
      onClose();
    } else {
      setErrorMsg(res.message);
      soundEffects.playHint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-3xl surface-card p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl overflow-hidden my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-3 text-[var(--primary-accent)]">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {activeTab === 'signin' ? 'Player Sign In' : 'Create Gamer Account'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            {activeTab === 'signin'
              ? 'Enter your credentials to access your saved profile'
              : 'Pick your avatar or upload photo & join GameZone'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-5">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('signin');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('signup');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-sans">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="e.g. GamerPro or player"
                  value={signInData.identifier}
                  onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-primary font-bold text-sm tracking-wide"
            >
              Enter GameZone
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {/* Photo & Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Profile Photo or Avatar
                </label>
                <label
                  htmlFor="signup-photo-input"
                  className="text-[11px] font-semibold text-[var(--primary-accent)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload Photo
                </label>
                <input
                  id="signup-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {signUpData.photo ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--primary-accent-border)]">
                  <img
                    src={signUpData.photo}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-[var(--primary-accent)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">Photo Selected</p>
                    <p className="text-[10px] text-[var(--primary-accent)]">Ready for profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignUpData({ ...signUpData, photo: '' })}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSignUpData({ ...signUpData, avatar: av })}
                      className={`h-9 text-base rounded-xl flex items-center justify-center transition-all ${
                        signUpData.avatar === av
                          ? 'bg-[var(--primary-accent-subtle)] border-2 border-[var(--primary-accent)] scale-105'
                          : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--primary-accent-border)]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Apex Player"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--primary-accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  placeholder="Apex99"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--primary-accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="player@example.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--primary-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Password *
              </label>
              <input
                type="password"
                placeholder="At least 4 characters"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-xs focus:outline-none focus:border-[var(--primary-accent)]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-primary font-bold text-sm tracking-wide mt-2"
            >
              Create Account &amp; Play
            </button>
          </form>
        )}

        {/* Mandatory Account Notice */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] text-center">
          <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5 font-sans">
            <Lock className="w-3.5 h-3.5 text-[var(--primary-accent)] shrink-0" />
            <span>
              <strong className="text-[var(--text-primary)] font-semibold">Account Required:</strong> Sign up or log in to play any game and save your records.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

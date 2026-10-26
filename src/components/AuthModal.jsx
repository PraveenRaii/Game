import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus, Gamepad2, AlertCircle, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const AuthModal = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const { login, signup, playAsGuest, AVATARS } = useAuth();
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
        message: 'Your player profile is created & stored in MongoDB.',
        type: 'success',
      });
      onClose();
    } else {
      setErrorMsg(res.message);
      soundEffects.playHint(false);
    }
  };

  const handleGuestContinue = () => {
    playAsGuest();
    addToast({
      title: 'Playing as Guest Player',
      message: 'You can enjoy all games! High scores will be saved locally.',
      type: 'info',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-3xl glass-panel-glow p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-lg mb-3">
            <div className="w-full h-full bg-[#0a0c1a] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="font-['Orbitron'] text-2xl font-bold text-white tracking-wide">
            {activeTab === 'signin' ? 'Player Sign In' : 'Create Gamer Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'signin'
              ? 'Enter your credentials to access your MongoDB saved profile'
              : 'Pick your avatar or upload photo & join GameZone'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-5">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('signin');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
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
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. CyberViper or admin"
                  value={signInData.identifier}
                  onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-95 transition-all"
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
                <label className="block text-xs font-medium text-slate-300">
                  Profile Photo or Avatar
                </label>
                <label
                  htmlFor="signup-photo-input"
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
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
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-cyan-400/30">
                  <img
                    src={signUpData.photo}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Custom Photo Loaded</p>
                    <p className="text-[10px] text-cyan-300">Will be saved to your MongoDB profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignUpData({ ...signUpData, photo: '' })}
                    className="text-xs text-rose-400 hover:underline"
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
                          ? 'bg-purple-600/40 border-2 border-purple-400 shadow-md scale-105'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
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
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Apex Player"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  placeholder="Apex99"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="player@example.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                placeholder="At least 4 characters"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 hover:scale-[1.01] active:scale-95 transition-all mt-2"
            >
              Create Account &amp; Play
            </button>
          </form>
        )}

        {/* Guest Play Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400 mb-2">Want to jump right into the action?</p>
          <button
            onClick={handleGuestContinue}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
          >
            Continue as Guest Player →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

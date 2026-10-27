import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Lock,
  User,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  Trophy,
  ArrowLeft,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const AuthPage = ({ setCurrentView, initialMode = 'signup' }) => {
  const { login, signup, AVATARS } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In state
  const [signInData, setSignInData] = useState({ identifier: '', password: '' });

  // Sign Up state
  const [signUpData, setSignUpData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    avatar: '🎮',
    photo: '',
  });

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
      setErrorMsg('Please enter your username/email and password.');
      soundEffects.playHint(false);
      return;
    }

    const res = await login(signInData);
    if (res.success) {
      soundEffects.playWin();
      addToast({
        title: `Welcome back, ${res.user.name}!`,
        message: 'Successfully logged in to your GameZone account.',
        type: 'success',
      });
      setCurrentView('home');
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
      soundEffects.playWin();
      addToast({
        title: `Welcome to GameZone, ${res.user.name}!`,
        message: 'Your gamer profile is ready. Have fun playing!',
        type: 'success',
      });
      setCurrentView('home');
    } else {
      setErrorMsg(res.message);
      soundEffects.playHint(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="w-full max-w-4xl relative z-10">
        {/* Back to Home Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games Arena
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 surface-card rounded-3xl border border-[var(--border-color)] shadow-xl overflow-hidden p-6 sm:p-10">
          {/* Left Hero / Perks Column */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border-color)] pb-8 lg:pb-0 lg:pr-8">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-4 text-[var(--primary-accent)]">
                <Gamepad2 className="w-6 h-6" />
              </div>

              <h1 className="font-heading text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
                Welcome to <span className="text-[var(--primary-accent)]">GameZone</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-2 leading-relaxed font-sans">
                Join our arena of puzzle solvers, tacticians, and speed racers. Enjoy high score tracking, customizable gamer profiles, and instant playability.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] flex items-center justify-center text-[var(--primary-accent)] shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-heading">
                      Leaderboard Standings
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">
                      Record personal bests across Number Guessing, Tic-Tac-Toe, Puzzle, and Car Racing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--primary-accent)] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-heading">
                      Profile Customization
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">
                      Upload your real gamer photo or select from curated avatars.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] flex items-center justify-center text-[var(--primary-accent)] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-heading">
                      Dual-Theme Support
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">
                      Flawless Dark and Light themes with persistent preference storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                <Lock className="w-4 h-4 text-[var(--primary-accent)] shrink-0" />
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  <strong className="text-[var(--text-primary)] font-semibold">Account Required:</strong> Sign up or sign in to play all games &amp; track high scores.
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-6">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setMode('signin');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
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
                  setMode('signup');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-sans">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="Username or email"
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
                  className="w-full py-3 rounded-xl btn-primary font-bold text-sm tracking-wide mt-2"
                >
                  Sign In to GameZone
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      Profile Avatar / Photo
                    </label>
                    <label
                      htmlFor="page-photo-input"
                      className="text-[11px] font-semibold text-[var(--primary-accent)] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Upload Photo
                    </label>
                    <input
                      id="page-photo-input"
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
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">Photo Loaded</p>
                        <p className="text-[10px] text-[var(--primary-accent)]">Will be applied to profile</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

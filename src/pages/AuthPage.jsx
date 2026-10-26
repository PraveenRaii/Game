import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Lock,
  Mail,
  User,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  Trophy,
  ArrowLeft,
  AlertCircle,
  Camera,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../audio/soundEffects';

export const AuthPage = ({ setCurrentView, initialMode = 'signin' }) => {
  const { login, signup, playAsGuest, AVATARS } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setSuccessMsg('');

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
    setSuccessMsg('');

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
        message: 'Your gamer profile is ready in MongoDB. Have fun playing!',
        type: 'success',
      });
      setCurrentView('home');
    } else {
      setErrorMsg(res.message);
      soundEffects.playHint(false);
    }
  };

  const handleGuest = () => {
    playAsGuest();
    addToast({
      title: 'Playing as Guest Player',
      message: 'All games are unlocked! Scores will be tracked locally.',
      type: 'info',
    });
    setCurrentView('home');
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-pink-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Back to Home Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-cyan-500/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-10">
          {/* Left Hero / Perks Column */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-lg mb-4">
                <div className="w-full h-full bg-[#0a0c1a] rounded-[14px] flex items-center justify-center">
                  <Gamepad2 className="w-7 h-7 text-cyan-400" />
                </div>
              </div>

              <h1 className="font-['Orbitron'] text-3xl font-extrabold text-white leading-tight">
                Welcome to <span className="text-cyan-400">GameZone</span>
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Join our arena of puzzle solvers, tacticians, and guess masters. Powered by <strong>MongoDB Atlas</strong> with real-time score tracking, dynamic games, and custom profile photos.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Hall of Fame
                    </h4>
                    <p className="text-xs text-slate-400">
                      Record personal bests across all games synchronized with MongoDB Atlas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Profile Photos &amp; Avatars
                    </h4>
                    <p className="text-xs text-slate-400">
                      Upload your real gamer photo or select from cyber presets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Admin Access
                    </h4>
                    <p className="text-xs text-slate-400">
                      Admins can add games, customize parameters, and manage users.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={handleGuest}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Skip to Guest Mode</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Mode Switch Tabs */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            {/* Error notification */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. CyberViper or admin"
                      value={signInData.identifier}
                      onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Admin Credentials:</strong> Email <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">praveen12342020@gmail.com</code> (or <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">admin</code>) &amp; Password <code className="bg-black/40 px-1 py-0.5 rounded text-white font-mono">praveen@2020</code> for full admin console rights!
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to GameZone
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Photo or Preset Avatar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Profile Photo or Preset Avatar
                    </label>
                    <label
                      htmlFor="page-photo-input"
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
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
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-cyan-400/40">
                      <img
                        src={signUpData.photo}
                        alt="Photo Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-cyan-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">Custom Profile Photo Ready</p>
                        <p className="text-[10px] text-cyan-300">Will be saved to MongoDB Atlas</p>
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
                          onClick={() => {
                            soundEffects.playClick();
                            setSignUpData({ ...signUpData, avatar: av });
                          }}
                          className={`h-11 text-xl rounded-xl flex items-center justify-center transition-all ${
                            signUpData.avatar === av
                              ? 'bg-purple-600/40 border-2 border-purple-400 scale-105 shadow-md shadow-purple-500/30'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Hunter"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Username *
                    </label>
                    <input
                      type="text"
                      placeholder="CyberViper"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="player@gamezone.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    placeholder="At least 4 characters"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 hover:scale-[1.01] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Player Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

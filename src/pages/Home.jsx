import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Flame,
  Award,
  Sparkles,
  Zap,
  Target,
  Grid3X3,
  Puzzle as PuzzleIcon,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  ShieldAlert,
  Car,
} from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { ScoreCard } from '../components/ScoreCard';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Home = ({ setCurrentView, openAuthModal }) => {
  const { stats, unlockedAchievements, customGames } = useGameStats();
  const { currentUser, isAdmin } = useAuth();
  const { addToast } = useToast();

  const handleLaunchGame = (gameId) => {
    soundEffects.playClick();
    if (['guess-game', 'tic-tac-toe', 'puzzle-game', 'car-racing'].includes(gameId)) {
      setCurrentView(gameId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Custom game added by Admin
      const customGame = customGames.find((g) => g.gameId === gameId || g._id === gameId);
      if (customGame?.customUrl) {
        window.open(customGame.customUrl, '_blank');
      } else {
        addToast({
          title: `Launching ${customGame?.title || 'Game'}! 🎮`,
          message: 'Custom community game initialized by Admin. Enjoy!',
          type: 'success',
        });
      }
    }
  };

  const winRate =
    stats.totalGamesPlayed > 0
      ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100)
      : 0;

  // Filter dynamic admin games that are not the 4 core games
  const extraGames = customGames.filter(
    (g) => g.active && !['guess-game', 'tic-tac-toe', 'puzzle-game', 'car-racing'].includes(g.gameId)
  );

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            {currentUser.photo ? (
              <img src={currentUser.photo} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-xs font-semibold text-slate-300">
              Welcome to the Arena, <strong className="text-white">{currentUser.name}</strong>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-['Orbitron'] text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none"
          >
            Ready to <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">Challenge</span> Your Mind?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Sharpen your reflexes in high-speed Car Racing, outsmart Minimax AI in Tic-Tac-Toe, crack Number Guesses, and solve Sliding Puzzles in GameZone.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => handleLaunchGame('car-racing')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 text-black font-['Orbitron'] font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4 fill-current" />
              <span>Play Car Racing</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setCurrentView('leaderboard');
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel border border-white/10 hover:border-purple-500/40 text-white font-['Orbitron'] font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-purple-400" />
              <span>View Leaderboard</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setCurrentView('admin');
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel border border-pink-500/30 text-pink-300 font-['Orbitron'] font-bold text-sm hover:bg-pink-500/10 transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-pink-400" />
                <span>Admin Console</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Global Statistics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            title="Total Games"
            value={stats.totalGamesPlayed}
            subtitle="Completed sessions"
            icon={Gamepad2}
            color="cyan"
          />
          <ScoreCard
            title="Victories"
            value={stats.totalWins}
            subtitle={`${winRate}% win rate`}
            icon={Trophy}
            color="purple"
          />
          <ScoreCard
            title="Active Streak"
            value={`${stats.currentStreak} 🔥`}
            subtitle={`Best: ${stats.bestStreak} wins`}
            icon={Flame}
            color="pink"
          />
          <ScoreCard
            title="Achievements"
            value={`${unlockedAchievements.length} / 10`}
            subtitle="Unlocked badges"
            icon={Award}
            color="amber"
          />
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="games-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              Select Your Arena
            </span>
            <h2 className="font-['Orbitron'] text-3xl font-extrabold text-white">
              Featured Mini Games
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Each game features customizable difficulty, tactile responsive controls, and automatic MongoDB high score tracking.
          </p>
        </div>

        {/* 4 Featured Games Cards + Dynamic Admin Games */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Game 1: Car Racing */}
          <GameCard
            id="car-racing"
            title="Cyber Racer"
            tagline="High-Speed Neon Highway"
            description="Steer through intense highway traffic, collect coins, burn nitro boosts, and survive the cyber rush!"
            difficulty="Cruiser • Pro • Mania"
            badges={['High Speed', 'Nitro Turbo', 'Score Multiplier']}
            accentColor="amber"
            icon={Car}
            bestRecord="Distance Run"
            onPlay={handleLaunchGame}
          />

          {/* Game 2: Number Guessing */}
          <GameCard
            id="guess-game"
            title="Number Guessing"
            tagline="Deduction & Logic"
            description="Crack the computer's secret number using high/low feedback, fuel gauges, and precision binary search."
            difficulty="3 Difficulties (1-500)"
            badges={['Dynamic Hints', 'Attempt Tracking', 'High-Score History']}
            accentColor="cyan"
            icon={Target}
            bestRecord={
              stats.numberGuessing.bestMedium
                ? `${stats.numberGuessing.bestMedium} tries`
                : null
            }
            onPlay={handleLaunchGame}
          />

          {/* Game 3: Tic-Tac-Toe */}
          <GameCard
            id="tic-tac-toe"
            title="Tic-Tac-Toe"
            tagline="AI & 2-Player Strategy"
            description="Battle local friends or challenge our unbeatable Minimax AI opponent on an interactive glowing neon grid."
            difficulty="Easy & Minimax AI"
            badges={['Unbeatable Minimax', 'Pass & Play 2P', 'Combos Glow']}
            accentColor="purple"
            icon={Grid3X3}
            bestRecord={`${stats.ticTacToe.winsVsAI + stats.ticTacToe.winsVsHuman} Wins`}
            onPlay={handleLaunchGame}
          />

          {/* Game 4: Sliding Puzzle */}
          <GameCard
            id="puzzle-game"
            title="Sliding Puzzle"
            tagline="Spatial Intelligence"
            description="Slide scrambled numbered tiles into numerical order on 3x3, 4x4, or 5x5 grids with guaranteed solvable boards."
            difficulty="3x3 • 4x4 • 5x5"
            badges={['Solvable Generator', 'Live Stopwatch', 'Smart Hint AI']}
            accentColor="pink"
            icon={PuzzleIcon}
            bestRecord={
              stats.puzzle.best3x3
                ? `${stats.puzzle.best3x3.moves} moves`
                : null
            }
            onPlay={handleLaunchGame}
          />

          {/* Extra Games Added by Admin */}
          {extraGames.map((g) => (
            <GameCard
              key={g._id || g.gameId}
              id={g.gameId}
              title={g.title}
              tagline={g.tagline || 'Custom Game'}
              description={g.description}
              difficulty={g.difficulty || 'Custom'}
              badges={g.badges || ['Admin Added']}
              accentColor={g.accentColor || 'amber'}
              icon={Gamepad2}
              bestRecord="Community"
              onPlay={handleLaunchGame}
            />
          ))}
        </div>
      </section>

      {/* Why Play GameZone Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-['Orbitron'] text-base font-bold text-white mb-1">
                  MongoDB Atlas Sync
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Persistent cloud database synchronization for accounts, user profiles, custom avatars, and global leaderboards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-['Orbitron'] text-base font-bold text-white mb-1">
                  High-Speed Games &amp; AI
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enjoy arcade Car Racing, mathematical Minimax AI, and guaranteed solvable sliding puzzles with zero lag.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-['Orbitron'] text-base font-bold text-white mb-1">
                  Admin Console &amp; Themes
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle Dark/Light themes across all pages, delete users, create &amp; edit games, and manage the full player roster effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

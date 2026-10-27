import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Award,
  Zap,
  Target,
  Grid3X3,
  Puzzle as PuzzleIcon,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Car,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { ScoreCard } from '../components/ScoreCard';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';

export const Home = ({ setCurrentView, openAuthModal, initialSection }) => {
  const { stats } = useGameStats();
  const { currentUser } = useAuth();
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  // Difficulty selections stored for cards preview
  const [guessDifficulty, setGuessDifficulty] = useState('medium');
  const [puzzleDifficulty, setPuzzleDifficulty] = useState('3x3');
  const [carDifficulty, setCarDifficulty] = useState('medium');

  const scrollToGames = () => {
    soundEffects.playClick();
    const el = document.getElementById('games-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchGame = (gameId) => {
    soundEffects.playClick();
    setCurrentView(gameId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Best score string calculation
  const bestScoreDisplay = (() => {
    if (stats.totalWins > 0) return `${stats.totalWins} Wins`;
    if (stats.highScores?.carRacing) return `${stats.highScores.carRacing}m`;
    return '0';
  })();

  return (
    <div className="space-y-16 pb-20">
      {/* 4. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Subtle Tagline Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] text-xs font-semibold tracking-wide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Minimalist Gaming Hub</span>
              </motion.div>

              {/* Exact Requested Hero Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[var(--text-primary)] tracking-tight leading-[1.08]"
              >
                Small Games.{' '}
                <span className="text-[var(--primary-accent)] inline-block">
                  Big Brain.
                </span>
              </motion.h1>

              {/* Exact Requested Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
              >
                Three simple games. Endless fun. Sharpen your mind with logic, strategy, and quick thinking.
              </motion.p>

              {/* Action Buttons: Primary CTA & Secondary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
              >
                <button
                  onClick={scrollToGames}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl btn-primary flex items-center justify-center gap-2 group focus:outline-none"
                >
                  <span className="font-semibold text-sm">Explore Games</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setHowToPlayOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl btn-secondary flex items-center justify-center gap-2 focus:outline-none"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--primary-accent)]" />
                  <span className="font-semibold text-sm">How to Play</span>
                </button>
              </motion.div>
            </div>

            {/* Right Column: Premium Gaming Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-3xl surface-card p-6 flex flex-col items-center justify-center border border-[var(--border-color)] overflow-hidden">
                {/* Geometric decorative elements */}
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full border border-[var(--border-color)] opacity-60 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-[var(--primary-accent-border)] opacity-40 pointer-events-none" />
                <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-[var(--primary-accent)]" />
                <div className="absolute top-1/3 right-6 w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] opacity-50" />

                {/* SVG Illustration: Controller, Puzzle Tiles & Geometric Shapes */}
                <svg
                  viewBox="0 0 320 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-w-[280px] drop-shadow-sm"
                >
                  {/* Outer Geometric Frame */}
                  <rect
                    x="24"
                    y="24"
                    width="272"
                    height="272"
                    rx="32"
                    stroke="var(--border-color)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />

                  {/* Puzzle Tiles Floating Top */}
                  <g transform="translate(180, 48)">
                    <rect width="40" height="40" rx="10" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="1.5" />
                    <text x="20" y="25" textAnchor="middle" fill="var(--primary-accent)" fontSize="14" fontFamily="Space Mono" fontWeight="bold">1</text>
                  </g>
                  <g transform="translate(228, 48)">
                    <rect width="40" height="40" rx="10" fill="var(--primary-accent)" />
                    <text x="20" y="25" textAnchor="middle" fill="var(--btn-text-on-accent)" fontSize="14" fontFamily="Space Mono" fontWeight="bold">2</text>
                  </g>
                  <g transform="translate(228, 96)">
                    <rect width="40" height="40" rx="10" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="1.5" />
                    <text x="20" y="25" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontFamily="Space Mono" fontWeight="bold">3</text>
                  </g>

                  {/* Main Gaming Controller Silhouette in Lime & Charcoal */}
                  <g transform="translate(56, 120)">
                    {/* Controller Body */}
                    <path
                      d="M36 28 C20 28 8 44 14 74 L26 120 C30 134 44 142 58 136 C72 130 84 108 104 108 L104 108 C124 108 136 130 150 136 C164 142 178 134 182 120 L194 74 C200 44 188 28 172 28 C152 28 140 44 104 44 C68 44 56 28 36 28 Z"
                      fill="var(--bg-elevated)"
                      stroke="var(--primary-accent)"
                      strokeWidth="2.5"
                    />

                    {/* D-Pad */}
                    <path
                      d="M50 62 H58 V54 H66 V62 H74 V70 H66 V78 H58 V70 H50 Z"
                      fill="var(--border-color)"
                      stroke="var(--border-color)"
                      strokeWidth="1"
                    />

                    {/* Action Buttons (A, B, X, Y) with Lime Accent */}
                    <circle cx="140" cy="66" r="4.5" fill="var(--primary-accent)" />
                    <circle cx="152" cy="56" r="4.5" fill="var(--text-secondary)" />
                    <circle cx="152" cy="76" r="4.5" fill="var(--text-secondary)" />
                    <circle cx="164" cy="66" r="4.5" fill="var(--text-secondary)" />

                    {/* Analog Sticks */}
                    <circle cx="78" cy="92" r="12" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2" />
                    <circle cx="78" cy="92" r="5" fill="var(--primary-accent)" />

                    <circle cx="130" cy="92" r="12" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="2" />
                    <circle cx="130" cy="92" r="5" fill="var(--primary-accent)" />
                  </g>

                  {/* Modern Racing Car Streak Silhouette */}
                  <g transform="translate(68, 252)">
                    <rect x="0" y="0" width="172" height="12" rx="6" fill="var(--bg-elevated)" stroke="var(--border-color)" strokeWidth="1" />
                    <rect x="52" y="2" width="68" height="8" rx="4" fill="var(--primary-accent)" />
                    <circle cx="72" cy="6" r="2.5" fill="var(--btn-text-on-accent)" />
                    <circle cx="100" cy="6" r="2.5" fill="var(--btn-text-on-accent)" />
                  </g>
                </svg>
              </div>
            </motion.div>
          </div>

          {/* PROGRESS PANEL: Games Played, Total Wins, Best Score */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreCard
              title="Games Played"
              value={stats.totalGamesPlayed || 0}
              subtitle="All platform attempts"
              icon={Gamepad2}
            />
            <ScoreCard
              title="Total Wins"
              value={stats.totalWins || 0}
              subtitle="Victories achieved"
              icon={Trophy}
              isAccent={true}
            />
            <ScoreCard
              title="Best Score"
              value={bestScoreDisplay}
              subtitle="Peak personal record"
              icon={Award}
            />
          </div>
        </div>
      </section>

      {/* 5. GAME CARDS SECTION */}
      <section id="games-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-[var(--primary-accent)] uppercase tracking-wider block mb-1">
              Select Your Arena
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
              Playable Challenges
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            Responsive, instant-play games fine-tuned with precision physics and intelligent AI.
          </p>
        </div>

        {/* 4 Cards Grid (3 Core + Car Racing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Number Guessing */}
          <GameCard
            id="guess-game"
            title="Number Guessing"
            tagline="Logic & Deduction"
            description="Deduce the secret number chosen by the engine using strategic high/low feedback."
            illustrationType="number-guess"
            icon={Target}
            difficultyOptions={[
              { label: 'Easy (1-50)', value: 'easy' },
              { label: 'Medium (1-100)', value: 'medium' },
              { label: 'Hard (1-500)', value: 'hard' },
            ]}
            activeDifficulty={guessDifficulty}
            onSelectDifficulty={setGuessDifficulty}
            statsBadge={{
              label: 'Personal Best',
              value: stats.highScores?.numberGuessing
                ? `${stats.highScores.numberGuessing} tries`
                : '10 tries max',
            }}
            ctaText="Start Guessing"
            onPlay={handleLaunchGame}
          />

          {/* Card 2: Tic-Tac-Toe */}
          <GameCard
            id="tic-tac-toe"
            title="Tic-Tac-Toe"
            tagline="Classic Tactics"
            description="Play against Minimax unbeatable AI or duel a friend locally in a monochrome grid."
            illustrationType="tic-tac-toe"
            icon={Grid3X3}
            difficultyOptions={[
              { label: 'vs Computer', value: 'ai' },
              { label: '2 Players', value: 'pvp' },
            ]}
            activeDifficulty="ai"
            statsBadge={{
              label: 'Wins / Draws',
              value: `${stats.ticTacToe?.aiWins || 0}W · ${stats.ticTacToe?.draws || 0}D`,
            }}
            ctaText="Challenge Now"
            onPlay={handleLaunchGame}
          />

          {/* Card 3: Puzzle Game */}
          <GameCard
            id="puzzle-game"
            title="Sliding Puzzle"
            tagline="Spatial Intelligence"
            description="Slide numbered tiles into sequential order. Always generated with mathematical solvability."
            illustrationType="puzzle"
            icon={PuzzleIcon}
            difficultyOptions={[
              { label: '3×3', value: '3x3' },
              { label: '4×4', value: '4x4' },
              { label: '5×5', value: '5x5' },
            ]}
            activeDifficulty={puzzleDifficulty}
            onSelectDifficulty={setPuzzleDifficulty}
            statsBadge={{
              label: 'Best Time',
              value: stats.highScores?.puzzle3x3
                ? `${stats.highScores.puzzle3x3}s`
                : 'Under 60s',
            }}
            ctaText="Solve the Puzzle"
            onPlay={handleLaunchGame}
          />

          {/* Card 4: Car Racing */}
          <GameCard
            id="car-racing"
            title="Car Racing"
            tagline="High-Speed Reflexes"
            description="Dodge high-density highway traffic, trigger nitro boosts, and collect coins at 200+ km/h."
            illustrationType="car-racing"
            icon={Car}
            difficultyOptions={[
              { label: 'Cruiser', value: 'easy' },
              { label: 'Neon Pro', value: 'medium' },
              { label: 'Mania', value: 'hard' },
            ]}
            activeDifficulty={carDifficulty}
            onSelectDifficulty={setCarDifficulty}
            statsBadge={{
              label: 'Best Distance',
              value: stats.highScores?.carRacing
                ? `${stats.highScores.carRacing}m`
                : '1,200m target',
            }}
            ctaText="Race Now"
            onPlay={handleLaunchGame}
          />
        </div>
      </section>

      {/* HOW TO PLAY MODAL */}
      <AnimatePresence>
        {howToPlayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="surface-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[var(--border-color)] space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[var(--text-primary)]">
                    GameZone Rules &amp; Guide
                  </h3>
                </div>
                <button
                  onClick={() => setHowToPlayOpen(false)}
                  className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 text-sm">
                {/* Number Guessing */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <h4 className="font-heading font-bold text-base text-[var(--primary-accent)] flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Number Guessing
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Choose a difficulty (1-50, 1-100, or 1-500). Enter your numeric guess. The system gives instant feedback:
                    "Too High", "Too Low", or "Correct!". Binary search strategies yield the fewest attempts.
                  </p>
                </div>

                {/* Tic-Tac-Toe */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <h4 className="font-heading font-bold text-base text-[var(--primary-accent)] flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    Tic-Tac-Toe
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Place your mark (X or O) to form 3 in a row horizontally, vertically, or diagonally.
                    Choose between a local 2-Player match or challenge our recursive Minimax AI on Easy or Hard difficulty.
                  </p>
                </div>

                {/* Sliding Puzzle */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <h4 className="font-heading font-bold text-base text-[var(--primary-accent)] flex items-center gap-2">
                    <PuzzleIcon className="w-4 h-4" />
                    Sliding Puzzle
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Slide tiles adjacent to the empty slot into sequential order (1 to N-1). You can click/tap tiles or use Arrow / WASD keys.
                    Every puzzle is algorithmically tested for solvability.
                  </p>
                </div>

                {/* Car Racing */}
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <h4 className="font-heading font-bold text-base text-[var(--primary-accent)] flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Car Racing
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Use Left / Right arrow keys or A/D to switch between 3 highway lanes. Avoid oncoming traffic vehicles.
                    Press Spacebar or Up Arrow to engage Nitro Boost. Collect coins for bonus multipliers and shields for invulnerability.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setHowToPlayOpen(false)}
                  className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold"
                >
                  Got It, Let's Play
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

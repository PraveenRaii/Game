import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Zap,
  Shield,
  Trophy,
  Flame,
  Gauge,
  Sparkles,
  Coins,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Car,
  Lock,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

// 3 Road Lanes in percentages
const LANES = [16.66, 50, 83.33];

export const CarRacing = ({ setCurrentView, openAuthModal }) => {
  const { stats, addLeaderboardEntry } = useGameStats();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Difficulty configs
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const diffConfig = {
    easy: { baseSpeed: 5, trafficInterval: 140, multiplier: 1, label: 'Cruiser' },
    medium: { baseSpeed: 7, trafficInterval: 100, multiplier: 1.5, label: 'Pro Racer' },
    hard: { baseSpeed: 9.5, trafficInterval: 75, multiplier: 2.2, label: 'Cyber Mania' },
  }[difficulty];

  // Game state
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [laneIndex, setLaneIndex] = useState(1); // 0: Left, 1: Center, 2: Right
  const [distance, setDistance] = useState(0); // meters
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitro, setNitro] = useState(100); // 0 - 100
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(120);

  // Entities on road (Traffic & Items)
  const [traffic, setTraffic] = useState([]);
  const [items, setItems] = useState([]);

  const [invincible, setInvincible] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);

  const requestRef = useRef(null);
  const frameCountRef = useRef(0);
  const isPlayingRef = useRef(false);
  const roadRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });

  if (currentUser?.isGuest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full surface-card rounded-3xl p-8 border border-[var(--border-color)] text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-[var(--text-primary)]">
              Sign Up Required
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 font-sans leading-relaxed">
              You must create an account or sign in to race on the highway, collect nitro boosts, and register distance records.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openAuthModal && openAuthModal('signup')}
              className="flex-1 py-3 rounded-2xl btn-primary font-bold text-sm"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => openAuthModal && openAuthModal('signin')}
              className="flex-1 py-3 rounded-2xl btn-secondary font-bold text-sm"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }
  const laneIndexRef = useRef(laneIndex);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    laneIndexRef.current = laneIndex;
  }, [laneIndex]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Best score from local storage
  const [bestDistance, setBestDistance] = useState(() => {
    try {
      return parseInt(localStorage.getItem('gamezone_car_best_dist') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Start new run
  const startGame = () => {
    soundEffects.playCarRev?.() || soundEffects.playCarBoost();
    setLaneIndex(1);
    setDistance(0);
    setCoins(0);
    setLives(3);
    setNitro(100);
    setIsNitroActive(false);
    setTraffic([]);
    setItems([]);
    setInvincible(false);
    setGameState('playing');
    isPlayingRef.current = true;
    frameCountRef.current = 0;
  };

  // Switch Lane
  const moveLane = useCallback((direction) => {
    setLaneIndex((prev) => {
      let next = prev;
      if (direction === 'left' && prev > 0) next = prev - 1;
      if (direction === 'right' && prev < 2) next = prev + 1;
      if (next !== prev) soundEffects.playCarSteer();
      return next;
    });
  }, []);

  // Trigger Nitro Boost
  const triggerNitro = useCallback(() => {
    if (nitro >= 30 && !isNitroActive) {
      soundEffects.playCarBoost();
      setIsNitroActive(true);
    }
  }, [nitro, isNitroActive]);

  // Touch and drag steering
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e) => {
    if (gameStateRef.current !== 'playing') return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartPos.current.x;
    const diffY = touch.clientY - touchStartPos.current.y;

    if (diffY < -40 && Math.abs(diffX) < 30) {
      triggerNitro();
    }

    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        moveLane('right');
      } else {
        moveLane('left');
      }
      touchStartPos.current.x = touch.clientX;
    }
  };

  const handleTouchEnd = () => {};

  const handleMouseDown = (e) => {
    if (gameStateRef.current !== 'playing') return;
    if (!roadRef.current) return;
    const rect = roadRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.35) {
      moveLane('left');
    } else if (clickX > width * 0.65) {
      moveLane('right');
    } else {
      triggerNitro();
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'ready' && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameState !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        moveLane('left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        moveLane('right');
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.code === 'Space') {
        e.preventDefault();
        triggerNitro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLane, triggerNitro]);

  // Main 60FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let localTraffic = [...traffic];
    let localItems = [...items];
    let localDistance = distance;
    let localCoins = coins;
    let localLives = lives;
    let localNitro = nitro;
    let localNitroActive = isNitroActive;
    let localInvincible = invincible;

    const gameSpeed = isNitroActive ? diffConfig.baseSpeed * 1.6 : diffConfig.baseSpeed;
    setSpeedKmh(Math.round(gameSpeed * 22));

    const loop = () => {
      frameCountRef.current++;
      const frame = frameCountRef.current;

      // Update distance & road scroll
      localDistance += Math.round(gameSpeed * 0.4);
      setDistance(localDistance);
      setRoadOffset((prev) => (prev + gameSpeed * 1.8) % 100);

      // Nitro recharge / depletion
      if (localNitroActive) {
        localNitro -= 0.7;
        if (localNitro <= 0) {
          localNitro = 0;
          localNitroActive = false;
          setIsNitroActive(false);
        }
      } else if (localNitro < 100) {
        localNitro += 0.15;
      }
      setNitro(Math.min(100, Math.max(0, localNitro)));

      // Spawn traffic vehicles (Monochrome shades: charcoal, dark slate, silver, white)
      if (frame % diffConfig.trafficInterval === 0) {
        const lane = Math.floor(Math.random() * 3);
        const types = ['car', 'sports', 'truck'];
        const colors = ['#222720', '#354032', '#626E5F', '#DDE2D6'];
        localTraffic.push({
          id: 'tf_' + Date.now() + Math.random(),
          lane,
          y: -15,
          speed: gameSpeed * (0.45 + Math.random() * 0.35),
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Spawn Collectible Items (coins & nitro)
      if (frame % 80 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const isSpecial = Math.random() < 0.25;
        localItems.push({
          id: 'it_' + Date.now() + Math.random(),
          lane,
          y: -10,
          type: isSpecial ? (Math.random() < 0.5 ? 'nitro' : 'shield') : 'coin',
        });
      }

      // Move Traffic & check collisions
      const nextTraffic = [];
      for (let car of localTraffic) {
        car.y += (gameSpeed - car.speed * 0.3) * 0.45;

        const inSameLane = car.lane === laneIndex;
        const verticalOverlap = car.y > 66 && car.y < 90;

        if (inSameLane && verticalOverlap && !localInvincible && !localNitroActive) {
          soundEffects.playCarCrash();
          localLives--;
          setLives(localLives);
          localInvincible = true;
          setInvincible(true);

          setTimeout(() => {
            setInvincible(false);
          }, 1500);

          if (localLives <= 0) {
            handleGameOver(localDistance, localCoins);
            return;
          }
        }

        if (car.y < 110) {
          nextTraffic.push(car);
        }
      }
      localTraffic = nextTraffic;
      setTraffic(localTraffic);

      // Move Items & check collections
      const nextItems = [];
      for (let item of localItems) {
        item.y += gameSpeed * 0.45;

        const inSameLane = item.lane === laneIndex;
        const verticalOverlap = item.y > 70 && item.y < 88;

        if (inSameLane && verticalOverlap) {
          if (item.type === 'coin') {
            soundEffects.playCarCoin();
            localCoins++;
            setCoins(localCoins);
          } else if (item.type === 'nitro') {
            soundEffects.playCarBoost();
            localNitro = Math.min(100, localNitro + 40);
            setNitro(localNitro);
          } else if (item.type === 'shield') {
            soundEffects.playWin();
            localLives = Math.min(3, localLives + 1);
            setLives(localLives);
          }
        } else if (item.y < 110) {
          nextItems.push(item);
        }
      }
      localItems = nextItems;
      setItems(localItems);

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, laneIndex, isNitroActive, difficulty, diffConfig, invincible]);

  // Handle Game Over
  const handleGameOver = (finalDist, finalCoins) => {
    cancelAnimationFrame(requestRef.current);
    soundEffects.playGameOver();
    setGameState('gameover');

    const totalXP = Math.round(finalDist * 0.8 + finalCoins * 40 * diffConfig.multiplier);

    if (finalDist > bestDistance) {
      setBestDistance(finalDist);
      try {
        localStorage.setItem('gamezone_car_best_dist', String(finalDist));
      } catch {}
      triggerConfetti();
    }

    addLeaderboardEntry({
      game: 'Car Racing',
      score: `${finalDist}m (${finalCoins} coins)`,
      points: totalXP,
    });

    addToast({
      title: 'Crash! Game Over 🏎️',
      message: `You covered ${finalDist}m and earned ${totalXP} XP!`,
      type: 'error',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] self-start sm:self-auto">
          {['easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                soundEffects.playClick();
                setDifficulty(diff);
                if (gameState === 'playing') startGame();
              }}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all capitalize ${
                difficulty === diff
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {diff === 'easy' ? 'Cruiser' : diff === 'medium' ? 'Neon Pro' : 'Mania'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Race Track Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full surface-card rounded-3xl p-4 sm:p-6 relative overflow-hidden">
            {/* Modern HUD Bar with Space Mono numbers */}
            <div className="flex items-center justify-between gap-2 mb-4 px-2 text-xs font-bold">
              {/* Distance */}
              <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                <Gauge className="w-4 h-4 text-[var(--primary-accent)]" />
                <span className="font-mono-stats text-sm sm:text-base text-[var(--primary-accent)]">
                  {distance}m
                </span>
              </div>

              {/* Speed */}
              <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] font-mono-stats text-xs text-[var(--text-primary)]">
                {speedKmh} <span className="text-[10px] text-[var(--text-secondary)]">KM/H</span>
              </div>

              {/* Coins */}
              <div className="flex items-center gap-1 text-[var(--primary-accent)] font-mono-stats">
                <Coins className="w-4 h-4" />
                <span>{coins}</span>
              </div>

              {/* Lives */}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((heart) => (
                  <Heart
                    key={heart}
                    className={`w-4 h-4 transition-all ${
                      heart <= lives ? 'text-[var(--primary-accent)] fill-[var(--primary-accent)]' : 'text-[var(--border-color)]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* NITRO ENERGY BAR */}
            <div className="w-full mb-3 px-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                <span className="flex items-center gap-1 text-[var(--primary-accent)]">
                  <Flame className="w-3 h-3" /> NITRO BOOST (SPACE / W)
                </span>
                <span className="font-mono-stats">
                  {Math.round(nitro)}%
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-color)]">
                <div
                  className={`h-full transition-all duration-100 rounded-full ${
                    isNitroActive
                      ? 'bg-[var(--primary-accent)] animate-pulse'
                      : 'bg-[var(--primary-accent)]'
                  }`}
                  style={{ width: `${nitro}%` }}
                />
              </div>
            </div>

            {/* HIGHWAY TRACK CANVAS */}
            <div
              ref={roadRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              className="relative w-full aspect-[9/14] sm:aspect-[9/13] max-w-[340px] sm:max-w-[380px] mx-auto rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-inner overflow-hidden select-none touch-none cursor-pointer"
            >
              {/* Subtle Road Texture */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent 0%, currentColor 100%), repeating-linear-gradient(0deg, transparent, transparent 20px, currentColor 20px, currentColor 22px)`,
                  backgroundPosition: `0px ${roadOffset * 2}px`,
                }}
              />

              {/* Road Borders */}
              <div className="absolute top-0 bottom-0 left-2 w-1.5 bg-[var(--primary-accent)] opacity-80" />
              <div className="absolute top-0 bottom-0 right-2 w-1.5 bg-[var(--primary-accent)] opacity-80" />

              {/* Road Lane Lines (Dividers) */}
              <div
                className="absolute top-0 bottom-0 left-1/3 w-1 border-r-2 border-dashed border-[var(--border-color)]"
                style={{ backgroundPosition: `0px ${roadOffset * 4}px` }}
              />
              <div
                className="absolute top-0 bottom-0 left-2/3 w-1 border-r-2 border-dashed border-[var(--border-color)]"
                style={{ backgroundPosition: `0px ${roadOffset * 4}px` }}
              />

              {/* ONCOMING TRAFFIC CARS */}
              {traffic.map((car) => (
                <div
                  key={car.id}
                  className="absolute -translate-x-1/2 transition-transform duration-75"
                  style={{
                    left: `${LANES[car.lane]}%`,
                    top: `${car.y}%`,
                  }}
                >
                  <svg
                    width="44"
                    height="68"
                    viewBox="0 0 44 68"
                    fill="none"
                    className="drop-shadow-md"
                  >
                    {/* Headlights */}
                    <polygon points="12,68 6,85 18,85" fill="rgba(255, 255, 255, 0.25)" />
                    <polygon points="32,68 26,85 38,85" fill="rgba(255, 255, 255, 0.25)" />
                    {/* Car Body */}
                    <rect x="6" y="8" width="32" height="52" rx="10" fill={car.color} stroke="var(--border-color)" strokeWidth="1" />
                    {/* Windshield */}
                    <rect x="10" y="22" width="24" height="12" rx="3" fill="#121512" />
                    {/* Roof */}
                    <rect x="11" y="34" width="22" height="14" rx="2" fill="rgba(0,0,0,0.25)" />
                    {/* Rear window */}
                    <rect x="12" y="48" width="20" height="6" rx="2" fill="#121512" />
                    {/* Wheels */}
                    <rect x="2" y="14" width="5" height="12" rx="2" fill="#171B15" />
                    <rect x="37" y="14" width="5" height="12" rx="2" fill="#171B15" />
                    <rect x="2" y="44" width="5" height="12" rx="2" fill="#171B15" />
                    <rect x="37" y="44" width="5" height="12" rx="2" fill="#171B15" />
                  </svg>
                </div>
              ))}

              {/* COLLECTIBLE ITEMS */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 animate-bounce"
                  style={{
                    left: `${LANES[item.lane]}%`,
                    top: `${item.y}%`,
                  }}
                >
                  {item.type === 'coin' && (
                    <div className="w-7 h-7 rounded-full bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] border border-[var(--primary-accent-border)] flex items-center justify-center shadow-md font-mono-stats font-bold text-xs">
                      $
                    </div>
                  )}
                  {item.type === 'nitro' && (
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--primary-accent)] flex items-center justify-center shadow-md text-[var(--primary-accent)]">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  {item.type === 'shield' && (
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-md text-[var(--text-primary)]">
                      <Shield className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              ))}

              {/* PLAYER LIME GREEN RACER */}
              <div
                className={`absolute top-[76%] -translate-x-1/2 transition-all duration-150 ${
                  invincible ? 'opacity-50 animate-pulse' : 'opacity-100'
                }`}
                style={{
                  left: `${LANES[laneIndex]}%`,
                }}
              >
                {/* Exhaust Flame / Nitro Burn */}
                {isNitroActive && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4 h-8 bg-[var(--primary-accent)] blur-[2px] animate-pulse rounded-full" />
                )}

                <svg
                  width="48"
                  height="74"
                  viewBox="0 0 48 74"
                  fill="none"
                  className="drop-shadow-lg"
                >
                  {/* Headlights */}
                  <polygon points="12,10 4,-20 20,-20" fill="var(--primary-accent)" fillOpacity="0.3" />
                  <polygon points="36,10 28,-20 44,-20" fill="var(--primary-accent)" fillOpacity="0.3" />

                  {/* Body Frame in Lime Accent */}
                  <rect x="6" y="8" width="36" height="58" rx="12" fill="var(--bg-card)" stroke="var(--primary-accent)" strokeWidth="2.5" />
                  {/* Central Racing Stripe */}
                  <line x1="24" y1="12" x2="24" y2="62" stroke="var(--primary-accent)" strokeWidth="2.5" />
                  {/* Cockpit / Windshield */}
                  <polygon points="14,24 34,24 31,40 17,40" fill="var(--primary-accent)" fillOpacity="0.75" />
                  {/* Rear Spoiler */}
                  <rect x="4" y="60" width="40" height="4" rx="2" fill="var(--primary-accent)" />
                  {/* Wheels */}
                  <rect x="1" y="16" width="6" height="14" rx="2" fill="#10140C" stroke="var(--border-color)" strokeWidth="1" />
                  <rect x="41" y="16" width="6" height="14" rx="2" fill="#10140C" stroke="var(--border-color)" strokeWidth="1" />
                  <rect x="1" y="46" width="6" height="14" rx="2" fill="#10140C" stroke="var(--border-color)" strokeWidth="1" />
                  <rect x="41" y="46" width="6" height="14" rx="2" fill="#10140C" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
              </div>

              {/* OVERLAY: READY / START SCREEN */}
              {gameState === 'ready' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--primary-accent)] flex items-center justify-center mb-3 text-[var(--primary-accent)] shadow-lg">
                    <Car className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
                    HIGHWAY RACER
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[220px]">
                    Dodge traffic, collect bonus coins, and engage lime-green nitro!
                  </p>

                  <button
                    onClick={startGame}
                    className="mt-6 px-8 py-3.5 rounded-2xl btn-primary font-bold text-sm flex items-center gap-2 focus:outline-none"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Race
                  </button>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-3">Press SPACE or Click to Launch</p>
                </div>
              )}

              {/* OVERLAY: GAME OVER SCREEN */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--primary-accent)] flex items-center justify-center mb-2 text-[var(--primary-accent)]">
                    <Flame className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-white">
                    CRASHED OUT!
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">High Speed Collision</p>

                  <div className="my-4 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] w-full space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Distance:</span>
                      <strong className="text-[var(--primary-accent)] font-mono-stats">{distance}m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Coins Collected:</span>
                      <strong className="text-white font-mono-stats">{coins}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Best Distance:</span>
                      <strong className="text-white font-mono-stats">{bestDistance}m</strong>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-3 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Drive Again
                  </button>
                </div>
              )}
            </div>

            {/* CONTROLS (STEERING + NITRO) */}
            <div className="mt-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => moveLane('left')}
                  className="py-3 rounded-xl btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Steer Left</span>
                </button>
                <button
                  onClick={() => moveLane('right')}
                  className="py-3 rounded-xl btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Steer Right</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Nitro Boost Button */}
              <button
                onClick={triggerNitro}
                disabled={nitro < 30 || isNitroActive}
                className="w-full py-3.5 rounded-2xl btn-primary text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isNitroActive ? 'NITRO ACTIVE!' : 'NITRO BOOST (SPACE / W)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card rounded-3xl p-6 border border-[var(--border-color)]">
            <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--primary-accent)]" />
              Racer Records
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-semibold">
                  Best Distance
                </span>
                <span className="font-mono-stats text-2xl font-bold text-[var(--primary-accent)] mt-1 block">
                  {bestDistance}m
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-semibold">
                  Difficulty
                </span>
                <span className="font-heading text-lg font-bold text-[var(--text-primary)] mt-1 block">
                  {diffConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-3xl p-6 border border-[var(--border-color)]">
            <h4 className="font-heading text-xs font-bold text-[var(--primary-accent)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Driving Controls
            </h4>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <span>Steering</span>
                <span className="font-mono-stats text-[var(--text-primary)] font-semibold">← / → or A / D</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <span>Nitro Boost</span>
                <span className="font-mono-stats text-[var(--primary-accent)] font-semibold">SPACE / W</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <span>Touch / Click</span>
                <span className="font-mono-stats text-[var(--text-primary)] font-semibold">Tap Left/Right screen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

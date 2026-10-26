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
  Volume2,
  Play,
  Pause,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

// 3 Road Lanes in percentages
const LANES = [16.66, 50, 83.33];

export const CarRacing = ({ setCurrentView }) => {
  const { stats, addLeaderboardEntry } = useGameStats();
  const { addToast } = useToast();

  // Difficulty configs
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const diffConfig = {
    easy: { baseSpeed: 5, trafficInterval: 140, multiplier: 1, label: 'Cruiser' },
    medium: { baseSpeed: 7, trafficInterval: 100, multiplier: 1.5, label: 'Neon Pro' },
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
  const [traffic, setTraffic] = useState([]); // { id, lane, y (0-100), type: 'car'|'truck', color }
  const [items, setItems] = useState([]); // { id, lane, y (0-100), type: 'coin'|'nitro'|'shield' }

  const [invincible, setInvincible] = useState(false);
  const [roadOffset, setRoadOffset] = useState(0);

  const requestRef = useRef(null);
  const frameCountRef = useRef(0);
  const isPlayingRef = useRef(false);
  const roadRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });
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
    if (gameState !== 'playing') return;
    setLaneIndex((prev) => {
      let next = prev;
      if (direction === 'left' && prev > 0) next = prev - 1;
      if (direction === 'right' && prev < 2) next = prev + 1;
      if (next !== prev) soundEffects.playCarMove();
      return next;
    });
  }, [gameState]);

  // Activate Nitro
  const triggerNitro = useCallback(() => {
    if (gameState !== 'playing' || nitro < 30 || isNitroActive) return;
    setIsNitroActive(true);
    soundEffects.playCarBoost();
    addToast({ title: '⚡ NITRO ACTIVE!', message: 'Maximum speed & temporary invulnerability!', type: 'info', duration: 2000 });
  }, [gameState, nitro, isNitroActive, addToast]);

  // Mobile finger touch & swipe handling (no button tapping required)
  const steerToFinger = useCallback((clientX) => {
    if (gameStateRef.current !== 'playing' || !roadRef.current) return;
    const rect = roadRef.current.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width;
    let targetLane = 1;
    if (relativeX < 0.35) targetLane = 0;
    else if (relativeX > 0.65) targetLane = 2;
    else targetLane = 1;

    if (targetLane !== laneIndexRef.current) {
      soundEffects.playCarMove();
      setLaneIndex(targetLane);
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    const touch = e.touches[0];
    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    steerToFinger(touch.clientX);
  }, [steerToFinger]);

  const handleTouchMove = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    const touch = e.touches[0];
    steerToFinger(touch.clientX);
  }, [steerToFinger]);

  const handleTouchEnd = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartPos.current.y;
    const deltaX = touch.clientX - touchStartPos.current.x;
    const duration = Date.now() - touchStartPos.current.time;

    // Upward flick / swipe activates Nitro
    if (deltaY < -40 && Math.abs(deltaY) > Math.abs(deltaX) && duration < 400) {
      triggerNitro();
    }
  }, [triggerNitro]);

  const handleMouseDown = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    steerToFinger(e.clientX);
  }, [steerToFinger]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'ready' && (e.key === ' ' || e.key === 'Enter')) {
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
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        triggerNitro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLane, triggerNitro]);

  // Main Game Loop (60 FPS)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let localTraffic = [...traffic];
    let localItems = [...items];
    let localLane = laneIndex;
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

      // Update distance & road scroll animation
      localDistance += Math.round(gameSpeed * 0.4);
      setDistance(localDistance);
      setRoadOffset((prev) => (prev + gameSpeed * 1.8) % 100);

      // Handle Nitro recharge / depletion
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

      // Spawn traffic vehicles
      if (frame % diffConfig.trafficInterval === 0) {
        const lane = Math.floor(Math.random() * 3);
        const types = ['car', 'sports', 'truck'];
        const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#f59e0b'];
        localTraffic.push({
          id: 'tf_' + Date.now() + Math.random(),
          lane,
          y: -15,
          speed: gameSpeed * (0.45 + Math.random() * 0.35),
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Spawn Collectible Items (coins & fuel)
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

        // Collision Check with player (player is at y = 78%, height ~ 14%)
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

        // Keep car if still on screen
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
      message: `You drove ${finalDist}m and earned ${totalXP} XP!`,
      type: 'error',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white glass-panel border border-white/10 hover:border-cyan-500/40 transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Difficulty Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 self-start sm:self-auto">
          {['easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                soundEffects.playClick();
                setDifficulty(diff);
                if (gameState === 'playing') startGame();
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all capitalize ${
                difficulty === diff
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Race Track Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel-cyan rounded-3xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            {/* HUD Bar */}
            <div className="flex items-center justify-between gap-2 mb-4 px-2 text-xs font-bold">
              {/* Distance */}
              <div className="flex items-center gap-1.5 text-white">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="font-['Orbitron'] text-sm sm:text-base text-cyan-300">
                  {distance}m
                </span>
              </div>

              {/* Speed */}
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-['Orbitron'] text-xs text-white">
                {speedKmh} <span className="text-[10px] text-slate-400">KM/H</span>
              </div>

              {/* Coins */}
              <div className="flex items-center gap-1 text-amber-400 font-['Orbitron']">
                <Coins className="w-4 h-4" />
                <span>{coins}</span>
              </div>

              {/* Lives / Hearts */}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((heart) => (
                  <Heart
                    key={heart}
                    className={`w-4 h-4 transition-all ${
                      heart <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* NITRO ENERGY BAR */}
            <div className="w-full mb-3 px-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Flame className="w-3 h-3 text-cyan-400" /> NITRO BOOST (SPACE / W)
                </span>
                <span className={nitro >= 30 ? 'text-cyan-400' : 'text-slate-500'}>
                  {Math.round(nitro)}%
                </span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-100 rounded-full ${
                    isNitroActive
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  }`}
                  style={{ width: `${nitro}%` }}
                />
              </div>
            </div>

            {/* 3D PERSPECTIVE HIGHWAY CANVAS (Finger Drag & Touch-enabled) */}
            <div
              ref={roadRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              className="relative w-full aspect-[9/14] sm:aspect-[9/13] max-w-[340px] sm:max-w-[380px] mx-auto rounded-2xl bg-gradient-to-b from-[#090b16] via-[#0d1024] to-[#080914] border-2 border-cyan-500/40 shadow-inner overflow-hidden select-none touch-none cursor-pointer"
            >
              {/* Cyber Grid Horizons */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(6, 182, 212, 0.4) 100%), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(168, 85, 247, 0.3) 20px, rgba(168, 85, 247, 0.3) 22px)`,
                  backgroundPosition: `0px ${roadOffset * 2}px`,
                }}
              />

              {/* Road Borders */}
              <div className="absolute top-0 bottom-0 left-2 w-1.5 bg-gradient-to-b from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/50" />
              <div className="absolute top-0 bottom-0 right-2 w-1.5 bg-gradient-to-b from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/50" />

              {/* Road Lane Lines (Dividers) */}
              <div
                className="absolute top-0 bottom-0 left-1/3 w-1 border-r-2 border-dashed border-cyan-400/40"
                style={{ backgroundPosition: `0px ${roadOffset * 4}px` }}
              />
              <div
                className="absolute top-0 bottom-0 left-2/3 w-1 border-r-2 border-dashed border-cyan-400/40"
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
                    className="drop-shadow-lg"
                  >
                    {/* Headlights casting down */}
                    <polygon points="12,68 6,85 18,85" fill="rgba(255, 230, 0, 0.3)" />
                    <polygon points="32,68 26,85 38,85" fill="rgba(255, 230, 0, 0.3)" />
                    {/* Car Body */}
                    <rect x="6" y="8" width="32" height="52" rx="10" fill={car.color} />
                    {/* Windshield */}
                    <rect x="10" y="22" width="24" height="12" rx="3" fill="#0f172a" />
                    {/* Roof */}
                    <rect x="11" y="34" width="22" height="14" rx="2" fill="rgba(0,0,0,0.3)" />
                    {/* Rear window */}
                    <rect x="12" y="48" width="20" height="6" rx="2" fill="#0f172a" />
                    {/* Wheels */}
                    <rect x="2" y="14" width="5" height="12" rx="2" fill="#000" />
                    <rect x="37" y="14" width="5" height="12" rx="2" fill="#000" />
                    <rect x="2" y="44" width="5" height="12" rx="2" fill="#000" />
                    <rect x="37" y="44" width="5" height="12" rx="2" fill="#000" />
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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 border-2 border-yellow-200 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                      <span className="text-[10px] font-extrabold text-slate-900">$</span>
                    </div>
                  )}
                  {item.type === 'nitro' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-cyan-200 flex items-center justify-center shadow-lg shadow-cyan-400/50">
                      <Zap className="w-4 h-4 text-black fill-black" />
                    </div>
                  )}
                  {item.type === 'shield' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 border-2 border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-400/50">
                      <Shield className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* PLAYER NEON CYBER CAR */}
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
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-cyan-400 via-sky-300 to-transparent blur-[1px] animate-pulse" />
                )}

                <svg
                  width="48"
                  height="74"
                  viewBox="0 0 48 74"
                  fill="none"
                  className="drop-shadow-2xl"
                >
                  {/* Headlights illumination */}
                  <polygon points="12,10 4,-20 20,-20" fill="rgba(6, 182, 212, 0.4)" />
                  <polygon points="36,10 28,-20 44,-20" fill="rgba(6, 182, 212, 0.4)" />

                  {/* Body Frame */}
                  <rect x="6" y="8" width="36" height="58" rx="12" fill="#0a0c1a" stroke="#06b6d4" strokeWidth="2.5" />
                  {/* Neon Decal Stripes */}
                  <line x1="24" y1="12" x2="24" y2="62" stroke="#a855f7" strokeWidth="3" />
                  {/* Cockpit / Windshield */}
                  <polygon points="14,24 34,24 31,40 17,40" fill="#06b6d4" fillOpacity="0.8" />
                  {/* Rear Spoiler */}
                  <rect x="4" y="60" width="40" height="4" rx="2" fill="#a855f7" />
                  {/* Wheels */}
                  <rect x="1" y="16" width="6" height="14" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                  <rect x="41" y="16" width="6" height="14" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                  <rect x="1" y="46" width="6" height="14" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                  <rect x="41" y="46" width="6" height="14" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                </svg>
              </div>

              {/* OVERLAY: READY / START SCREEN */}
              {gameState === 'ready' && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30">
                    <Flame className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h3 className="font-['Orbitron'] font-extrabold text-2xl text-white tracking-wider">
                    CYBER RACER
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-[220px]">
                    Dodge oncoming speedsters, gather neon coins, and burn nitro!
                  </p>

                  <button
                    onClick={startGame}
                    className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-['Orbitron'] font-bold text-sm shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Race
                  </button>
                  <p className="text-[10px] text-slate-500 mt-3">Press SPACE or Click to Launch</p>
                </div>
              )}

              {/* OVERLAY: GAME OVER SCREEN */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mb-2">
                    <Flame className="w-7 h-7 text-rose-400" />
                  </div>
                  <h3 className="font-['Orbitron'] font-extrabold text-2xl text-white">
                    CRASHED OUT!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">High Speed Collision</p>

                  <div className="my-4 p-3 rounded-2xl bg-white/5 border border-white/10 w-full space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance:</span>
                      <strong className="text-cyan-300 font-['Orbitron']">{distance}m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coins Collected:</span>
                      <strong className="text-amber-400 font-['Orbitron']">{coins}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Distance:</span>
                      <strong className="text-white font-['Orbitron']">{bestDistance}m</strong>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 text-black font-['Orbitron'] font-bold text-xs shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Drive Again
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE CONTROLS (FINGER STEER + NITRO) */}
            <div className="mt-4 space-y-2.5">
              {/* Nitro Boost Button */}
              <button
                onClick={triggerNitro}
                disabled={nitro < 30 || isNitroActive}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-['Orbitron'] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isNitroActive ? '⚡ NITRO ACTIVE!' : 'NITRO BOOST (OR SWIPE UP ↑)'}</span>
              </button>

              {/* Mobile Finger Touch Visual Pill */}
              <div className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-center text-xs text-cyan-300">
                <span className="text-base animate-pulse">👆</span>
                <span className="font-semibold">Slide finger Left &amp; Right across road to steer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Instructions Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Best Record Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-['Orbitron'] font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              Racer Records
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Best Distance
                </span>
                <span className="font-['Orbitron'] text-2xl font-bold text-cyan-400 mt-1 block">
                  {bestDistance}m
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Difficulty
                </span>
                <span className="font-['Orbitron'] text-xl font-bold text-purple-400 mt-1 block">
                  {diffConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Reference */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h4 className="font-['Orbitron'] text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Driving Controls
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>Mobile Touch</span>
                <span className="font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded">👆 Slide Finger Left / Right</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>Keyboard Steer</span>
                <span className="font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded">← / → or A / D</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>Nitro Boost</span>
                <span className="font-mono text-purple-300 bg-white/5 px-2 py-0.5 rounded">Swipe Up ↑ or SPACE / W</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span>Collectibles</span>
                <span className="text-amber-400">Coins ($) &amp; Shields (🛡️)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Zap,
  Shield,
  Trophy,
  Users,
  User,
  Heart,
  Play,
  Pause,
  Rocket,
  Flame,
  Crosshair,
  Volume2,
  VolumeX,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  X,
  Swords,
} from 'lucide-react';
import { soundEffects } from '../audio/soundEffects';
import { useGameStats } from '../context/GameStatsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerConfetti } from '../components/Confetti';

export const GalaxyStrike = ({ setCurrentView, openAuthModal }) => {
  const { recordGalaxyStrikeResult } = useGameStats();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Mode: 'solo' | 'team' (Co-Op) | 'duel' (1v1)
  const [gameMode, setGameMode] = useState('solo');
  const [difficulty, setDifficulty] = useState('normal'); // 'easy' | 'normal' | 'hard'

  // Game lifecycle
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover' | 'victory'
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [teamScore, setTeamScore] = useState(0);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [autoFire, setAutoFire] = useState(true);

  // Player 1 state
  const [p1Health, setP1Health] = useState(100);
  const [p1Lives, setP1Lives] = useState(3);
  const [p1Shield, setP1Shield] = useState(100);

  // Player 2 state (for Team mode)
  const [p2Health, setP2Health] = useState(100);
  const [p2Lives, setP2Lives] = useState(3);
  const [p2Active, setP2Active] = useState(false);

  // Canvas ref
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const keysPressed = useRef({});
  const activePressRef = useRef({
    p1Left: false,
    p1Right: false,
    p2Left: false,
    p2Right: false,
  });

  // Game Engine State (stored in refs for 60fps loop performance)
  const engineRef = useRef({
    player1: { x: 200, y: 480, w: 32, h: 32, speed: 8.5, alive: true, cooldown: 0, shieldActive: 0, tripleShot: 0 },
    player2: { x: 300, y: 480, w: 32, h: 32, speed: 8.5, alive: true, cooldown: 0, shieldActive: 0, tripleShot: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    stars: [],
    powerups: [],
    wave: 1,
    score: 0,
    boss: null,
    spawnTimer: 0,
    mode: 'solo',
    lastTime: 0,
  });

  // Direct Pointer / Touch / Mouse Tracking on Canvas
  const handlePointerMove = (e) => {
    if (gameState !== 'playing' || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    if (clientX === undefined) return;
    const scaleX = canvas.width / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    const p1 = engineRef.current.player1;
    if (p1 && p1.alive) {
      p1.x = Math.max(10, Math.min(canvas.width - p1.w - 10, canvasX - p1.w / 2));
    }
  };

  // Initialize stars
  const initStars = (width, height) => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
    return stars;
  };

  // Keyboard Event Listeners (Universal keycode & key support with preventDefault)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser scrolling when using arrow keys or spacebar
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code) ||
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }

      keysPressed.current[e.code] = true;
      if (e.key) {
        keysPressed.current[e.key] = true;
        keysPressed.current[e.key.toLowerCase()] = true;
      }

      if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
      if (e.key) {
        keysPressed.current[e.key] = false;
        keysPressed.current[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn Enemy Wave
  const spawnEnemy = (width, curWave) => {
    const types = ['drone', 'gunship', 'asteroid'];
    const type = types[Math.floor(Math.random() * (curWave > 2 ? 3 : 2))];

    return {
      x: Math.random() * (width - 40) + 20,
      y: -30,
      w: type === 'gunship' ? 36 : type === 'asteroid' ? 30 : 26,
      h: type === 'gunship' ? 36 : type === 'asteroid' ? 30 : 26,
      type,
      hp: type === 'gunship' ? 4 : type === 'asteroid' ? 3 : 1,
      maxHp: type === 'gunship' ? 4 : type === 'asteroid' ? 3 : 1,
      speed: type === 'drone' ? 2.5 + curWave * 0.2 : 1.6 + curWave * 0.15,
      shootCooldown: Math.floor(Math.random() * 60) + 40,
    };
  };

  // Start / Reset Game
  const startGame = (mode = gameMode) => {
    soundEffects.playClick();
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 500;
    const height = canvas ? canvas.height : 600;

    engineRef.current = {
      player1: {
        x: mode === 'team' ? width * 0.35 : width * 0.5 - 16,
        y: height - 70,
        w: 32,
        h: 32,
        speed: 8.5,
        alive: true,
        cooldown: 0,
        shieldActive: 0,
        tripleShot: 0,
      },
      player2: {
        x: width * 0.65,
        y: height - 70,
        w: 32,
        h: 32,
        speed: 8.5,
        alive: mode === 'team',
        cooldown: 0,
        shieldActive: 0,
        tripleShot: 0,
      },
      bullets: [],
      enemyBullets: [],
      enemies: [],
      particles: [],
      stars: initStars(width, height),
      powerups: [],
      wave: 1,
      score: 0,
      boss: null,
      spawnTimer: 0,
      mode,
      lastTime: performance.now(),
    };

    setGameState('playing');
    setIsPaused(false);
    setScore(0);
    setWave(1);
    setP1Health(100);
    setP1Lives(3);
    setP2Health(100);
    setP2Lives(3);
    setP2Active(mode === 'team');
  };

  // Main 60fps Loop
  const updateLoop = useCallback(() => {
    if (gameState !== 'playing' || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const engine = engineRef.current;
    const keys = keysPressed.current;

    // Clear Canvas
    ctx.fillStyle = '#090B09';
    ctx.fillRect(0, 0, width, height);

    // 1. Render and Update Starfield
    ctx.fillStyle = '#F5F7F2';
    engine.stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 2. Player 1 Movement & Controls (Left / Right Movement)
    const p1 = engine.player1;
    if (p1.alive) {
      const isP1Left =
        keys['ArrowLeft'] ||
        keys['Left'] ||
        (engine.mode === 'solo' && (keys['KeyA'] || keys['a'] || keys['A'])) ||
        activePressRef.current.p1Left;

      const isP1Right =
        keys['ArrowRight'] ||
        keys['Right'] ||
        (engine.mode === 'solo' && (keys['KeyD'] || keys['d'] || keys['D'])) ||
        activePressRef.current.p1Right;

      if (isP1Left && p1.x > 10) {
        p1.x -= p1.speed;
      }
      if (isP1Right && p1.x < width - p1.w - 10) {
        p1.x += p1.speed;
      }

      // Smooth vertical stabilization along the bottom
      if ((keys['ArrowUp'] || (engine.mode === 'solo' && (keys['KeyW'] || keys['w']))) && p1.y > height - 130) {
        p1.y -= p1.speed * 0.6;
      } else if ((keys['ArrowDown'] || (engine.mode === 'solo' && (keys['KeyS'] || keys['s']))) && p1.y < height - 60) {
        p1.y += p1.speed * 0.6;
      }

      // Firing (Spacebar or Auto-Fire)
      p1.cooldown--;
      if ((keys['Space'] || keys[' '] || autoFire) && p1.cooldown <= 0) {
        p1.cooldown = 11;
        soundEffects.playClick();
        if (p1.tripleShot > 0) {
          engine.bullets.push({ x: p1.x + 14, y: p1.y - 6, vx: 0, vy: -9, from: 'p1' });
          engine.bullets.push({ x: p1.x + 4, y: p1.y, vx: -2.2, vy: -8.5, from: 'p1' });
          engine.bullets.push({ x: p1.x + 24, y: p1.y, vx: 2.2, vy: -8.5, from: 'p1' });
          p1.tripleShot--;
        } else {
          engine.bullets.push({ x: p1.x + p1.w / 2 - 2, y: p1.y - 6, vx: 0, vy: -9, from: 'p1' });
        }
      }

      // Draw Player 1 (Lime Green Striker)
      ctx.save();
      ctx.translate(p1.x + p1.w / 2, p1.y + p1.h / 2);

      // Jet Exhaust Flame
      ctx.fillStyle = '#B5F568';
      ctx.beginPath();
      ctx.moveTo(-5, 16);
      ctx.lineTo(0, 22 + Math.random() * 6);
      ctx.lineTo(5, 16);
      ctx.fill();

      // Main Ship Body
      ctx.fillStyle = '#1B201A';
      ctx.strokeStyle = '#B5F568';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(15, 14);
      ctx.lineTo(7, 10);
      ctx.lineTo(0, 14);
      ctx.lineTo(-7, 10);
      ctx.lineTo(-15, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Glow
      ctx.fillStyle = '#B5F568';
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Shield Aura
      if (p1.shieldActive > 0) {
        ctx.strokeStyle = '#B5F568';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        p1.shieldActive--;
      }

      ctx.restore();
    }

    // 3. Player 2 Movement & Controls (Team Mode: A / D + W / S + F)
    const p2 = engine.player2;
    if (engine.mode === 'team' && p2.alive) {
      const isP2Left = keys['KeyA'] || keys['a'] || keys['A'] || activePressRef.current.p2Left;
      const isP2Right = keys['KeyD'] || keys['d'] || keys['D'] || activePressRef.current.p2Right;

      if (isP2Left && p2.x > 10) {
        p2.x -= p2.speed;
      }
      if (isP2Right && p2.x < width - p2.w - 10) {
        p2.x += p2.speed;
      }

      if ((keys['KeyW'] || keys['w']) && p2.y > height - 130) {
        p2.y -= p2.speed * 0.6;
      }
      if ((keys['KeyS'] || keys['s']) && p2.y < height - 60) {
        p2.y += p2.speed * 0.6;
      }

      p2.cooldown--;
      if ((keys['KeyF'] || keys['f'] || keys['Enter'] || autoFire) && p2.cooldown <= 0) {
        p2.cooldown = 11;
        if (p2.tripleShot > 0) {
          engine.bullets.push({ x: p2.x + 14, y: p2.y - 6, vx: 0, vy: -9, from: 'p2' });
          engine.bullets.push({ x: p2.x + 4, y: p2.y, vx: -2.2, vy: -8.5, from: 'p2' });
          engine.bullets.push({ x: p2.x + 24, y: p2.y, vx: 2.2, vy: -8.5, from: 'p2' });
          p2.tripleShot--;
        } else {
          engine.bullets.push({ x: p2.x + p2.w / 2 - 2, y: p2.y - 6, vx: 0, vy: -9, from: 'p2' });
        }
      }

      // Draw Player 2 (Silver/White Vanguard)
      ctx.save();
      ctx.translate(p2.x + p2.w / 2, p2.y + p2.h / 2);

      // Jet Flame
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-5, 16);
      ctx.lineTo(0, 22 + Math.random() * 6);
      ctx.lineTo(5, 16);
      ctx.fill();

      // Ship Body
      ctx.fillStyle = '#1B201A';
      ctx.strokeStyle = '#F5F7F2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(15, 14);
      ctx.lineTo(7, 10);
      ctx.lineTo(0, 14);
      ctx.lineTo(-7, 10);
      ctx.lineTo(-15, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing Trim
      ctx.fillStyle = '#B5F568';
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Shield Aura
      if (p2.shieldActive > 0) {
        ctx.strokeStyle = '#F5F7F2';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        p2.shieldActive--;
      }

      ctx.restore();
    }

    // 4. Update & Render Bullets
    engine.bullets.forEach((b, idx) => {
      b.x += b.vx || 0;
      b.y += b.vy || -9;

      ctx.fillStyle = b.from === 'p1' ? '#B5F568' : '#F5F7F2';
      ctx.shadowColor = b.from === 'p1' ? '#B5F568' : '#F5F7F2';
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x, b.y, 4, 12);
      ctx.shadowBlur = 0;

      if (b.y < -20 || b.x < -10 || b.x > width + 10) {
        engine.bullets.splice(idx, 1);
      }
    });

    // 5. Spawn Enemies
    engine.spawnTimer++;
    const spawnRate = Math.max(35, 75 - engine.wave * 7);
    if (engine.spawnTimer > spawnRate) {
      engine.spawnTimer = 0;
      engine.enemies.push(spawnEnemy(width, engine.wave));
    }

    // 6. Update & Render Enemies
    engine.enemies.forEach((enemy, eIdx) => {
      enemy.y += enemy.speed;

      // Enemy shooting
      enemy.shootCooldown--;
      if (enemy.shootCooldown <= 0 && enemy.type !== 'asteroid') {
        enemy.shootCooldown = Math.floor(Math.random() * 80) + 50;
        engine.enemyBullets.push({
          x: enemy.x + enemy.w / 2,
          y: enemy.y + enemy.h,
          vy: 4.5,
        });
      }

      // Draw Enemy
      ctx.save();
      ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);

      if (enemy.type === 'drone') {
        ctx.fillStyle = '#1E251D';
        ctx.strokeStyle = '#A3AAA0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(-12, -10);
        ctx.lineTo(0, -6);
        ctx.lineTo(12, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#E53E3E';
        ctx.fillRect(-2, 2, 4, 4);
      } else if (enemy.type === 'gunship') {
        ctx.fillStyle = '#171B15';
        ctx.strokeStyle = '#B5F568';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-14, -14, 28, 28);
        ctx.fill();
        ctx.stroke();

        // Weak point
        ctx.fillStyle = '#E53E3E';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Asteroid
        ctx.fillStyle = '#30382F';
        ctx.strokeStyle = '#626A5F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      // Check collision with player bullets
      engine.bullets.forEach((b, bIdx) => {
        if (
          b.x > enemy.x &&
          b.x < enemy.x + enemy.w &&
          b.y > enemy.y &&
          b.y < enemy.y + enemy.h
        ) {
          enemy.hp--;
          engine.bullets.splice(bIdx, 1);

          // Spawn spark particles
          for (let p = 0; p < 4; p++) {
            engine.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 15,
              color: '#B5F568',
            });
          }

          if (enemy.hp <= 0) {
            // Enemy Destroyed
            const pts = enemy.type === 'gunship' ? 150 : enemy.type === 'asteroid' ? 80 : 50;
            engine.score += pts;
            setScore(engine.score);

            // Chance to drop power-up
            if (Math.random() < 0.25) {
              const pTypes = ['triple', 'shield', 'emp', 'heal'];
              engine.powerups.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y,
                type: pTypes[Math.floor(Math.random() * pTypes.length)],
                vy: 2.2,
              });
            }

            // Explosion Particles
            for (let p = 0; p < 12; p++) {
              engine.particles.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 25,
                color: '#B5F568',
              });
            }

            engine.enemies.splice(eIdx, 1);
          }
        }
      });

      // Enemy leaves screen
      if (enemy.y > height + 40) {
        engine.enemies.splice(eIdx, 1);
      }
    });

    // 7. Enemy Bullets Update & Hit Check
    engine.enemyBullets.forEach((eb, ebIdx) => {
      eb.y += eb.vy;
      ctx.fillStyle = '#E53E3E';
      ctx.fillRect(eb.x - 2, eb.y, 4, 8);

      // Hit Player 1
      if (
        p1.alive &&
        eb.x > p1.x &&
        eb.x < p1.x + p1.w &&
        eb.y > p1.y &&
        eb.y < p1.y + p1.h
      ) {
        engine.enemyBullets.splice(ebIdx, 1);
        if (p1.shieldActive <= 0) {
          setP1Health((prev) => {
            const next = Math.max(0, prev - 25);
            if (next <= 0) {
              p1.alive = false;
              soundEffects.playGameOver();
            }
            return next;
          });
        }
      }

      // Hit Player 2 (Team Mode)
      if (
        engine.mode === 'team' &&
        p2.alive &&
        eb.x > p2.x &&
        eb.x < p2.x + p2.w &&
        eb.y > p2.y &&
        eb.y < p2.y + p2.h
      ) {
        engine.enemyBullets.splice(ebIdx, 1);
        if (p2.shieldActive <= 0) {
          setP2Health((prev) => {
            const next = Math.max(0, prev - 25);
            if (next <= 0) {
              p2.alive = false;
              soundEffects.playGameOver();
            }
            return next;
          });
        }
      }

      if (eb.y > height + 20) {
        engine.enemyBullets.splice(ebIdx, 1);
      }
    });

    // 8. Power-ups Update & Collect Check
    engine.powerups.forEach((pw, pIdx) => {
      pw.y += pw.vy;

      // Draw Powerup
      ctx.fillStyle = '#1B201A';
      ctx.strokeStyle = '#B5F568';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#B5F568';
      ctx.font = 'bold 9px Space Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = pw.type === 'triple' ? '3X' : pw.type === 'shield' ? 'SH' : pw.type === 'emp' ? 'EMP' : '+HP';
      ctx.fillText(label, pw.x, pw.y);

      // Collect by Player 1
      if (
        p1.alive &&
        Math.hypot(pw.x - (p1.x + p1.w / 2), pw.y - (p1.y + p1.h / 2)) < 24
      ) {
        engine.powerups.splice(pIdx, 1);
        soundEffects.playWin();
        applyPowerup(p1, pw.type, 'p1');
      }

      // Collect by Player 2 (Team Mode)
      if (
        engine.mode === 'team' &&
        p2.alive &&
        Math.hypot(pw.x - (p2.x + p2.w / 2), pw.y - (p2.y + p2.h / 2)) < 24
      ) {
        engine.powerups.splice(pIdx, 1);
        soundEffects.playWin();
        applyPowerup(p2, pw.type, 'p2');
      }

      if (pw.y > height + 30) {
        engine.powerups.splice(pIdx, 1);
      }
    });

    // 9. Particle Explosions
    engine.particles.forEach((part, idx) => {
      part.x += part.vx;
      part.y += part.vy;
      part.life--;

      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.life / 25;
      ctx.fillRect(part.x, part.y, 2.5, 2.5);
      ctx.globalAlpha = 1.0;

      if (part.life <= 0) {
        engine.particles.splice(idx, 1);
      }
    });

    // 10. Check Game Over Condition
    const isP1Dead = !p1.alive;
    const isP2Dead = engine.mode === 'team' ? !p2.alive : true;

    if (isP1Dead && isP2Dead) {
      setGameState('gameover');
      soundEffects.playGameOver();
      recordGalaxyStrikeResult({
        score: engine.score,
        wave: engine.wave,
        mode: engine.mode,
        isWin: false,
      });
      return;
    }

    // 11. Wave Progression
    if (engine.score > engine.wave * 800) {
      engine.wave++;
      setWave(engine.wave);
      addToast({
        title: `Sector Wave ${engine.wave} Incoming! 🚀`,
        message: 'Enemy interceptor density increased.',
        type: 'info',
      });
    }

    requestRef.current = requestAnimationFrame(updateLoop);
  }, [gameState, isPaused, autoFire]);

  // Apply Powerup Effects
  const applyPowerup = (player, type, playerId) => {
    if (type === 'triple') {
      player.tripleShot = 35;
      addToast({ title: 'Triple Laser Activated! ⚡', message: 'Spread firing enabled.', type: 'success' });
    } else if (type === 'shield') {
      player.shieldActive = 250;
      addToast({ title: 'Energy Shield Online! 🛡️', message: 'Invulnerability barrier engaged.', type: 'success' });
    } else if (type === 'heal') {
      if (playerId === 'p1') {
        setP1Health((prev) => Math.min(100, prev + 40));
        // In team mode, heal can revive dead teammate!
        if (engineRef.current.mode === 'team' && !engineRef.current.player2.alive) {
          engineRef.current.player2.alive = true;
          setP2Health(60);
          addToast({ title: 'Teammate Revived! 🤝', message: 'Player 2 rejoined the squadron!', type: 'success' });
        }
      } else {
        setP2Health((prev) => Math.min(100, prev + 40));
        if (!engineRef.current.player1.alive) {
          engineRef.current.player1.alive = true;
          setP1Health(60);
          addToast({ title: 'Teammate Revived! 🤝', message: 'Player 1 rejoined the squadron!', type: 'success' });
        }
      }
    } else if (type === 'emp') {
      // Clear all on-screen enemies
      engineRef.current.enemies = [];
      engineRef.current.enemyBullets = [];
      engineRef.current.score += 300;
      setScore(engineRef.current.score);
      triggerConfetti();
      addToast({ title: 'Team EMP Shockwave! 💥', message: 'All hostile targets eliminated.', type: 'success' });
    }
  };

  // Run update loop when playing
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      requestRef.current = requestAnimationFrame(updateLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, isPaused, updateLoop]);

  // Auth Guard for Guest Users
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
              You must create an account or sign in to play Galaxy Strike, unlock Team Co-Op mode, and record high scores.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openAuthModal && openAuthModal('signup')}
              className="flex-1 py-3 rounded-2xl btn-primary font-bold text-sm cursor-pointer"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => openAuthModal && openAuthModal('signin')}
              className="flex-1 py-3 rounded-2xl btn-secondary font-bold text-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4 cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            soundEffects.playClick();
            setCurrentView('home');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] surface-card hover:border-[var(--primary-accent-border)] transition-all self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>

        {/* Mode Selector: Solo vs Team Co-Op */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('solo');
                if (gameState === 'playing') startGame('solo');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                gameMode === 'solo'
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Solo Mission</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setGameMode('team');
                if (gameState === 'playing') startGame('team');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                gameMode === 'team'
                  ? 'bg-[var(--primary-accent)] text-[var(--btn-text-on-accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Co-Op 👥</span>
            </button>
          </div>

          <button
            onClick={() => setHowToPlayOpen(true)}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Canvas Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full surface-card rounded-3xl p-4 sm:p-6 border border-[var(--border-color)] shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Telemetry HUD Bar */}
            <div className="w-full flex items-center justify-between gap-3 mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <Trophy className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                  <span className="text-xs text-[var(--text-secondary)]">Score:</span>
                  <span className="font-mono-stats font-bold text-sm text-[var(--primary-accent)]">
                    {score}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Sector Wave:</span>
                  <span className="font-mono-stats font-bold text-sm text-[var(--text-primary)]">
                    #{wave}
                  </span>
                </div>
              </div>

              {/* Auto Fire Toggle */}
              <button
                onClick={() => setAutoFire(!autoFire)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  autoFire
                    ? 'bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] border-[var(--primary-accent-border)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)]'
                }`}
              >
                Auto-Fire: {autoFire ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Squadron Health HUD */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 px-2">
              {/* Pilot 1 Status */}
              <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-accent)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Pilot 1 (Lime Striker)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary-accent)] transition-all duration-200"
                      style={{ width: `${p1Health}%` }}
                    />
                  </div>
                  <span className="font-mono-stats text-xs font-bold text-[var(--primary-accent)]">
                    {p1Health}%
                  </span>
                </div>
              </div>

              {/* Pilot 2 Status (Only in Team Mode) */}
              {gameMode === 'team' && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Pilot 2 (Silver Wing)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                      <div
                        className="h-full bg-[#FFFFFF] transition-all duration-200"
                        style={{ width: `${p2Health}%` }}
                      />
                    </div>
                    <span className="font-mono-stats text-xs font-bold text-[var(--text-primary)]">
                      {p2Health}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 60FPS Space Arcade Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-inner">
              <canvas
                ref={canvasRef}
                width={500}
                height={560}
                className="max-w-full block bg-[#090B09] cursor-ew-resize touch-none select-none"
                onPointerDown={handlePointerMove}
                onPointerMove={(e) => {
                  if (e.buttons === 1 || e.pointerType === 'mouse' || e.pointerType === 'touch') {
                    handlePointerMove(e);
                  }
                }}
                onTouchStart={handlePointerMove}
                onTouchMove={handlePointerMove}
              />

              {/* Menu Overlay */}
              {gameState === 'menu' && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--primary-accent-subtle)] border border-[var(--primary-accent-border)] text-[var(--primary-accent)] flex items-center justify-center">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-3xl text-[var(--text-primary)]">
                      Galaxy Strike
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs font-sans">
                      {gameMode === 'solo'
                        ? 'Deploy solo to intercept rogue alien drone armadas.'
                        : 'Deploy as a 2-Player Squadron! Coordinate lasers and share team revives.'}
                    </p>
                  </div>

                  <button
                    onClick={() => startGame(gameMode)}
                    className="px-8 py-3.5 rounded-2xl btn-primary font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch {gameMode === 'solo' ? 'Solo Flight' : 'Team Co-Op'}</span>
                  </button>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center">
                    <Flame className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-2xl text-[var(--text-primary)]">
                      Mission Failed
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                      Squadron shields depleted at Sector Wave #{wave}.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-secondary)]">Final Score:</span>
                    <span className="font-mono-stats font-bold text-xl text-[var(--primary-accent)] ml-2">
                      {score} pts
                    </span>
                  </div>
                  <button
                    onClick={() => startGame(gameMode)}
                    className="px-7 py-3 rounded-xl btn-primary font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Deploy Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated Left-Right Flight Controls (Visible on all devices & screen sizes) */}
            <div className="w-full mt-4 pt-4 border-t border-[var(--border-color)] flex flex-col items-center gap-3">
              <div className="text-[11px] font-mono-stats text-[var(--text-secondary)] flex items-center gap-2 text-center">
                <span className="w-2 h-2 rounded-full bg-[var(--primary-accent)] animate-pulse" />
                <span>MOVE LEFT &amp; RIGHT: DRAG ON CANVAS OR USE CONTROLS / A &amp; D / ◄ &amp; ►</span>
              </div>

              {/* Player 1 Controls (Always Available) */}
              <div className="w-full grid grid-cols-3 gap-2.5 max-w-md">
                <button
                  type="button"
                  onPointerDown={() => { activePressRef.current.p1Left = true; }}
                  onPointerUp={() => { activePressRef.current.p1Left = false; }}
                  onPointerLeave={() => { activePressRef.current.p1Left = false; }}
                  className="py-3 px-3 rounded-2xl bg-[var(--bg-elevated)] hover:bg-[var(--primary-accent-subtle)] border-2 border-[var(--border-color)] active:border-[var(--primary-accent)] active:scale-95 text-[var(--text-primary)] font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 select-none cursor-pointer transition-all shadow-md"
                >
                  <span className="text-base text-[var(--primary-accent)]">◀</span>
                  <span>MOVE LEFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p1 = engineRef.current.player1;
                    if (p1 && p1.alive && p1.cooldown <= 0) {
                      p1.cooldown = 10;
                      soundEffects.playClick();
                      engineRef.current.bullets.push({ x: p1.x + p1.w / 2 - 2, y: p1.y - 6, vx: 0, vy: -9, from: 'p1' });
                    }
                  }}
                  className="py-3 px-3 rounded-2xl btn-primary font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 select-none cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>FIRE</span>
                </button>

                <button
                  type="button"
                  onPointerDown={() => { activePressRef.current.p1Right = true; }}
                  onPointerUp={() => { activePressRef.current.p1Right = false; }}
                  onPointerLeave={() => { activePressRef.current.p1Right = false; }}
                  className="py-3 px-3 rounded-2xl bg-[var(--bg-elevated)] hover:bg-[var(--primary-accent-subtle)] border-2 border-[var(--border-color)] active:border-[var(--primary-accent)] active:scale-95 text-[var(--text-primary)] font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 select-none cursor-pointer transition-all shadow-md"
                >
                  <span>MOVE RIGHT</span>
                  <span className="text-base text-[var(--primary-accent)]">▶</span>
                </button>
              </div>

              {/* Player 2 Left-Right Controls (When Team Mode is active) */}
              {gameMode === 'team' && (
                <div className="w-full max-w-md pt-2 border-t border-[var(--border-color)] flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono-stats text-[#FFFFFF] font-bold">
                    PILOT 2 (SILVER WING): A / D KEYS OR CONTROLS
                  </span>
                  <div className="w-full grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onPointerDown={() => { activePressRef.current.p2Left = true; }}
                      onPointerUp={() => { activePressRef.current.p2Left = false; }}
                      onPointerLeave={() => { activePressRef.current.p2Left = false; }}
                      className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] active:border-[#FFFFFF] active:scale-95 text-[var(--text-primary)] font-heading font-bold text-xs flex items-center justify-center gap-1 select-none cursor-pointer"
                    >
                      <span>◀ P2 LEFT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p2 = engineRef.current.player2;
                        if (p2 && p2.alive && p2.cooldown <= 0) {
                          p2.cooldown = 10;
                          soundEffects.playClick();
                          engineRef.current.bullets.push({ x: p2.x + p2.w / 2 - 2, y: p2.y - 6, vx: 0, vy: -9, from: 'p2' });
                        }
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#FFFFFF] text-[#090B09] font-heading font-bold text-xs flex items-center justify-center gap-1 select-none cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>P2 FIRE</span>
                    </button>
                    <button
                      type="button"
                      onPointerDown={() => { activePressRef.current.p2Right = true; }}
                      onPointerUp={() => { activePressRef.current.p2Right = false; }}
                      onPointerLeave={() => { activePressRef.current.p2Right = false; }}
                      className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] active:border-[#FFFFFF] active:scale-95 text-[var(--text-primary)] font-heading font-bold text-xs flex items-center justify-center gap-1 select-none cursor-pointer"
                    >
                      <span>P2 RIGHT ▶</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Mission Brief */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mission Briefing */}
          <div className="surface-card rounded-3xl p-6 sm:p-7 border border-[var(--border-color)] space-y-5">
            <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--primary-accent)]" />
              Squadron Controls
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                <p className="font-bold text-[var(--primary-accent)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary-accent)]" />
                  Pilot 1 (Lime Striker)
                </p>
                <p className="text-[var(--text-secondary)]">Move: <span className="font-mono font-bold text-[var(--text-primary)]">Arrow Keys</span> or <span className="font-mono font-bold text-[var(--text-primary)]">WASD</span></p>
                <p className="text-[var(--text-secondary)]">Fire: <span className="font-mono font-bold text-[var(--text-primary)]">Spacebar</span> / Auto-Fire</p>
              </div>

              {gameMode === 'team' && (
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <p className="font-bold text-[#FFFFFF] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                    Pilot 2 (Silver Wing - Co-Op)
                  </p>
                  <p className="text-[var(--text-secondary)]">Move: <span className="font-mono font-bold text-[var(--text-primary)]">W / A / S / D</span></p>
                  <p className="text-[var(--text-secondary)]">Fire: <span className="font-mono font-bold text-[var(--text-primary)]">F Key</span> or <span className="font-mono font-bold text-[var(--text-primary)]">Enter</span></p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                <p className="font-bold text-[var(--text-primary)]">Drop Pods &amp; Upgrades</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span>⚡ 3X Laser</span>
                  <span>🛡️ Shield Barrier</span>
                  <span>💣 Team EMP</span>
                  <span>💚 Heal / Revive</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startGame(gameMode)}
              className="w-full py-3 rounded-xl btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{gameState === 'playing' ? 'Restart Flight' : 'Start Match'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* HOW TO PLAY MODAL */}
      <AnimatePresence>
        {howToPlayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="surface-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[var(--border-color)] space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-accent-subtle)] text-[var(--primary-accent)] flex items-center justify-center">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[var(--text-primary)]">
                    Galaxy Strike Guide
                  </h3>
                </div>
                <button
                  onClick={() => setHowToPlayOpen(false)}
                  className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <h4 className="font-bold text-[var(--primary-accent)]">Solo Mission</h4>
                  <p>Pilot your craft through asteroid storms and drone armadas. Dodge enemy lasers and collect power-ups.</p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
                  <h4 className="font-bold text-[var(--primary-accent)]">Team Co-Op Mode (2 Players)</h4>
                  <p>Deploy two spaceships on the same screen! Share combined firepower, rack up team points, and pick up heal pods to revive your downed wingman.</p>
                </div>
              </div>

              <button
                onClick={() => setHowToPlayOpen(false)}
                className="w-full py-2.5 rounded-xl btn-primary font-bold text-xs cursor-pointer"
              >
                Ready for Launch
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

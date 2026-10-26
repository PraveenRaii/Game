import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  try {
    // Left burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#fbbf24'],
    });

    // Right burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#fbbf24'],
    });

    // Center starburst
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#06b6d4', '#a855f7', '#22c55e', '#f43f5e'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti error:', err);
  }
};

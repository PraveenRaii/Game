import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
  },
  playerAvatar: {
    type: String,
    default: '🎮',
  },
  playerPhoto: {
    type: String,
    default: '',
  },
  userId: {
    type: String,
    default: '',
  },
  game: {
    type: String,
    required: true,
  },
  score: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Score = mongoose.model('Score', scoreSchema);

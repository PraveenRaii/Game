import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  tagline: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    default: 'Medium',
  },
  badges: {
    type: [String],
    default: [],
  },
  accentColor: {
    type: String,
    enum: ['cyan', 'purple', 'pink', 'amber', 'emerald'],
    default: 'cyan',
  },
  icon: {
    type: String,
    default: 'Gamepad2',
  },
  category: {
    type: String,
    default: 'Arcade',
  },
  active: {
    type: Boolean,
    default: true,
  },
  playsCount: {
    type: Number,
    default: 0,
  },
  customUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Game = mongoose.model('Game', gameSchema);

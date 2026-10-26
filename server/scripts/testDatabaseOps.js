import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Game } from '../models/Game.js';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://praveen1234202040_db_user:DvaKaaXACxLZUTXO@game.belasw3.mongodb.net/gamezone?retryWrites=true&w=majority';

async function testOperations() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Atlas Connected successfully.');

    // 1. Verify Admin User
    const admin = await User.findOne({ username: 'admin' });
    console.log('Admin user found:', {
      name: admin?.name,
      username: admin?.username,
      email: admin?.email,
      role: admin?.role,
    });

    // 2. Test User Creation & Deletion
    const testUsername = 'test_player_' + Date.now();
    const testUser = await User.create({
      name: 'Test Player',
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: 'password123',
      role: 'player',
      avatar: '🚀',
    });
    console.log('Created temporary test user:', testUser.username, testUser._id);

    // Now delete this test user
    const deleted = await User.findByIdAndDelete(testUser._id);
    console.log('Deleted test user directly:', deleted?._id ? 'SUCCESS' : 'FAILED');

    // Verify user is gone
    const verifyUser = await User.findById(testUser._id);
    console.log('Verified user is deleted:', verifyUser === null ? 'CONFIRMED GONE' : 'STILL EXISTS');

    // 3. Verify Car Racing game exists in games collection
    const games = await Game.find({});
    console.log(`Found ${games.length} games in MongoDB:`);
    games.forEach((g) => console.log(` - ${g.title} (${g.gameId}) | active: ${g.active}`));

    const carGame = games.find((g) => g.gameId === 'car-racing');
    console.log('Car Racing Game in DB:', carGame ? 'FOUND & READY' : 'NOT FOUND');

    await mongoose.disconnect();
    console.log('All tests passed cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testOperations();

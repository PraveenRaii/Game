import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://praveen1234202040_db_user:DvaKaaXACxLZUTXO@game.belasw3.mongodb.net/gamezone?retryWrites=true&w=majority';

async function updateAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);

    const admin = await User.findOneAndUpdate(
      {
        $or: [
          { username: 'admin' },
          { email: 'praveen12342020@gmail.com' },
          { role: 'admin' },
        ],
      },
      {
        $set: {
          name: 'Praveen',
          username: 'admin',
          email: 'praveen12342020@gmail.com',
          password: 'praveen@2020',
          role: 'admin',
          avatar: '👑',
        },
      },
      { upsert: true, new: true }
    );

    console.log('Admin user updated in MongoDB:');
    console.log({
      id: admin._id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to update admin:', err);
    process.exit(1);
  }
}

updateAdmin();

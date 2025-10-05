// Simple admin seeder for local/dev use
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load env from root .env or server/.env
let envLoaded = dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
if (!process.env.DB_URI) {
  const alt = dotenv.config({ path: path.join(__dirname, '..', '.env') });
  if (!envLoaded.parsed && alt.parsed) envLoaded = alt;
}

const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@skillup.local';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
    const name = process.env.SEED_ADMIN_NAME || 'Admin User';
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      user.role = 'admin';
      if (password) user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
      console.log('Updated existing user to admin:', email);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ name, email, username, passwordHash, role: 'admin' });
      console.log('Created admin:', email);
    }

    console.log('Credentials');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Username:', username);
  } catch (e) {
    console.error('Seeding failed:', e);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();

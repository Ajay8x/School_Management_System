const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixDoubleHash() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const superAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (superAdmin) {
      // Set plain text password. The User model's pre('save') hook will hash it ONCE.
      superAdmin.password = process.env.SUPER_ADMIN_PASSWORD;
      await superAdmin.save();
      console.log(`Fixed password for ${superAdmin.email}`);
    }

    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (admin) {
      admin.password = process.env.ADMIN_PASSWORD;
      await admin.save();
      console.log(`Fixed password for ${admin.email}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDoubleHash();

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function promote() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'super@gmail.com' });
    if (user) {
      user.role = 'super-admin';
      await user.save();
      console.log('Promoted super@gmail.com to super-admin');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

promote();

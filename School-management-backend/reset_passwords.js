const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const defaultPassword = process.env.DEFAULT_PASSWORD;
    
    if (!defaultPassword) {
      console.error('DEFAULT_PASSWORD is not set in .env!');
      process.exit(1);
    }

    console.log(`Setting password for all users to: ${defaultPassword}`);

    // Hash the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Update all users
    const result = await User.updateMany({}, {
      $set: { password: hashedPassword }
    });

    console.log(`Successfully updated ${result.modifiedCount} users.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetPasswords();

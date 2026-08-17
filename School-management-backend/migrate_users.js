const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const School = require('./models/School');

dotenv.config();

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const defaultSchool = await School.findOne();
    if (!defaultSchool) {
      console.log('No schools found. Cannot migrate users.');
      process.exit(0);
    }

    // Update all users who don't have a schoolId, except super-admins
    const result = await User.updateMany(
      { schoolId: null, role: { $ne: 'super-admin' } },
      { $set: { schoolId: defaultSchool._id } }
    );

    console.log(`Migrated ${result.modifiedCount} users to school: ${defaultSchool.name}`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const User = require('./models/User'); // Adjust if path is different

const roles = [
  'accountant',
  'attendance-assistant',
  'exam-incharge',
  'guardian',
  'hostel-incharge',
  'inventory-incharge',
  'librarian',
  'manager',
  'mess-incharge',
  'observer',
  'principal',
  'receptionist',
  'staff',
  'student',
  'transport-incharge',
  'user',
  'vice-principal',
  'admin'
];

async function seedRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const defaultPassword = 'password123';

    for (const role of roles) {
      const email = `${role}@test.com`;
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        await User.create({
          name: `${role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')} User`,
          email: email,
          password: defaultPassword,
          role: role
        });
        console.log(`Created user for role: ${role} | Email: ${email} | Password: ${defaultPassword}`);
      } else {
        console.log(`User already exists for role: ${role} | Email: ${email}`);
      }
    }

    console.log('Finished seeding roles.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();

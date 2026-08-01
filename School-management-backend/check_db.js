const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const student = await Student.findOne({ rollNumber: '123456' });
    console.log('Student found:', student);

    const userByEmail = await User.findOne({ email: 'cloudhero@gmail.com' });
    console.log('User found by email:', userByEmail);

    if (userByEmail) {
      userByEmail.role = 'student';
      await userByEmail.save();
      console.log('User role updated to student!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

check();

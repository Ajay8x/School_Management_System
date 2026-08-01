const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
require('dotenv').config();

async function list() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const teachers = await Teacher.find({}, 'name employeeId email').sort({ employeeId: 1 });
    console.log('Teachers in DB:', teachers);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

list();

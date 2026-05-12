const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Teacher = require('./models/Teacher');
const User = require('./models/User');
const bcrypt = require('bcrypt');

dotenv.config();

const teachers = [
  { name: 'Dr. Ramesh Kumar', employeeId: 'TEA001', subject: 'Mathematics', contact: '9811100001', salary: 55000 },
  { name: 'Mrs. Sunita Gupta', employeeId: 'TEA002', subject: 'Physics', contact: '9811100002', salary: 52000 },
  { name: 'Mr. Anil Sharma', employeeId: 'TEA003', subject: 'Chemistry', contact: '9811100003', salary: 52000 },
  { name: 'Ms. Priya Singh', employeeId: 'TEA004', subject: 'Biology', contact: '9811100004', salary: 50000 },
  { name: 'Dr. Vikram Aditya', employeeId: 'TEA005', subject: 'History', contact: '9811100005', salary: 54000 },
  { name: 'Mrs. Deepa Rani', employeeId: 'TEA006', subject: 'Geography', contact: '9811100006', salary: 48000 },
  { name: 'Mr. Suresh Prabhu', employeeId: 'TEA007', subject: 'Civics', contact: '9811100007', salary: 48000 },
  { name: 'Ms. Neha Kakkar', employeeId: 'TEA008', subject: 'Music', contact: '9811100008', salary: 45000 },
  { name: 'Mr. Rahul Dravid', employeeId: 'TEA009', subject: 'Physical Education', contact: '9811100009', salary: 47000 },
  { name: 'Mrs. Sonia Gandhi', employeeId: 'TEA010', subject: 'Political Science', contact: '9811100010', salary: 51000 },
  { name: 'Dr. APJ Abdul Kalam', employeeId: 'TEA011', subject: 'Aeronautics', contact: '9811100011', salary: 65000 },
  { name: 'Mr. Satyajit Ray', employeeId: 'TEA012', subject: 'Art & Culture', contact: '9811100012', salary: 49000 },
  { name: 'Ms. Sudha Murthy', employeeId: 'TEA013', subject: 'Computer Science', contact: '9811100013', salary: 60000 },
  { name: 'Mr. Ratan Tata', employeeId: 'TEA014', subject: 'Economics', contact: '9811100014', salary: 62000 },
  { name: 'Mrs. Kiran Bedi', employeeId: 'TEA015', subject: 'Social Studies', contact: '9811100015', salary: 53000 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for teacher seeding...');

    for (const teacherData of teachers) {
      const existing = await Teacher.findOne({ employeeId: teacherData.employeeId });
      if (existing) continue;

      const teacher = await Teacher.create(teacherData);
      
      // Create user account
      await User.create({
        name: teacher.name,
        email: `${teacher.employeeId.toLowerCase()}@campuspilot.com`,
        password: teacher.employeeId, // default password
        role: 'teacher'
      });
      
      console.log(`Added teacher: ${teacher.name} (${teacher.employeeId})`);
    }

    console.log('Teacher seeding completed!');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();

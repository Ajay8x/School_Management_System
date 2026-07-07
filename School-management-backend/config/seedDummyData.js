const mongoose = require('mongoose');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notice = require('../models/Notice');
const Class = require('../models/Class');
const Guardian = require('../models/Guardian');
const User = require('../models/User');

const seedDummyData = async () => {
  try {
    // Only seed if the database is essentially empty (checking Students as a proxy)
    const studentCount = await Student.countDocuments();
    if (studentCount > 0) {
      return; // DB already has data, do nothing
    }

    console.log('Database is empty. Seeding default dummy data...');

    // 1. Seed Classes
    const classes = await Class.insertMany([
      { name: 'Class 1', section: 'A' },
      { name: 'Class 2', section: 'A' },
      { name: 'Class 3', section: 'A' }
    ]);

    // 2. Seed Teachers
    const teachers = await Teacher.insertMany([
      { name: 'Rajesh Sharma', employeeId: 'EMP001', subject: 'Mathematics', contact: '9876543210', gender: 'Male', email: 'rajesh@school.local' },
      { name: 'Priya Verma', employeeId: 'EMP002', subject: 'English', contact: '9876543211', gender: 'Female', email: 'priya@school.local' },
      { name: 'Amit Kumar', employeeId: 'EMP003', subject: 'Science', contact: '9876543212', gender: 'Male', email: 'amit@school.local' }
    ]);

    // Create User accounts for Teachers
    for (let t of teachers) {
      await User.create({
        name: t.name,
        email: t.email,
        password: 'password123',
        role: 'teacher'
      });
    }

    // 3. Seed Students
    const students = await Student.insertMany([
      { name: 'Aarav Kumar', rollNumber: 'R001', className: 'Class 1', section: 'A', gender: 'Male', contact: '9000000001', email: 'aarav@campuspilot.local' },
      { name: 'Diya Singh', rollNumber: 'R002', className: 'Class 1', section: 'A', gender: 'Female', contact: '9000000002', email: 'diya@campuspilot.local' },
      { name: 'Rohan Gupta', rollNumber: 'R003', className: 'Class 2', section: 'A', gender: 'Male', contact: '9000000003', email: 'rohan@campuspilot.local' },
      { name: 'Sanya Sharma', rollNumber: 'R004', className: 'Class 3', section: 'A', gender: 'Female', contact: '9000000004', email: 'sanya@campuspilot.local' }
    ]);

    // Create User accounts for Students
    for (let s of students) {
      await User.create({
        name: s.name,
        email: s.email,
        password: s.rollNumber,
        role: 'student',
        studentId: s._id
      });
    }

    // 4. Seed Guardians
    await Guardian.insertMany([
      { name: 'Mr. Kumar', relation: 'Father', contact: '9000000001', students: [students[0]._id] },
      { name: 'Mr. Singh', relation: 'Father', contact: '9000000002', students: [students[1]._id] }
    ]);

    // 5. Seed Notices
    await Notice.insertMany([
      { title: 'Welcome to the New Academic Year', content: 'We are excited to welcome all students back to school. Let\'s make this year great!', date: new Date(), role: 'all' },
      { title: 'Upcoming Parent-Teacher Meeting', content: 'A reminder that the PTM is scheduled for next Friday.', date: new Date(), role: 'all' }
    ]);

    console.log('Dummy data seeded successfully.');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  }
};

module.exports = seedDummyData;

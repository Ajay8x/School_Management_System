const mongoose = require('mongoose');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notice = require('../models/Notice');
const Class = require('../models/Class');
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const School = require('../models/School');
const { defaultModulesConfig } = require('../models/School');

const seedSchools = async () => {
  try {
    const schoolCount = await School.countDocuments();
    if (schoolCount === 0) {
      console.log('Seeding initial schools...');
      const initialSchools = [
        { name: 'Demo International School', code: 'DIS001', isDefault: true, tagline: 'Empowering Young Minds', address: '123 Education Boulevard', phone: '+91 98765 43210', email: 'contact@demointernational.edu', modules: defaultModulesConfig },
        { name: 'CampusTracker School', code: 'CTS002', isDefault: false, tagline: 'Inspiring Future Leaders', address: '45 Knowledge Park', phone: '+91 98765 43211', email: 'info@campustracker.edu', modules: defaultModulesConfig },
        { name: 'BPS School Bhadoi', code: 'BPS003', isDefault: false, tagline: 'Knowledge, Character, Success', address: 'Station Road, Bhadohi', phone: '+91 98765 43212', email: 'office@bpsbhadoi.org', modules: defaultModulesConfig },
        { name: 'Lions School Mirzapur', code: 'LSM004', isDefault: false, tagline: 'Service and Excellence', address: 'Civil Lines, Mirzapur', phone: '+91 98765 43213', email: 'admin@lionsmirzapur.org', modules: defaultModulesConfig },
        { name: 'Shubham Model School', code: 'SMS005', isDefault: false, tagline: 'Building Strong Foundations', address: 'Varanasi Highway', phone: '+91 98765 43214', email: 'shubhammodel@edu.org', modules: defaultModulesConfig },
        { name: 'SS PUBLIC SCHOOL', code: 'SSPS006', isDefault: false, tagline: 'Towards Higher Horizon', address: 'Ring Road Branch', phone: '+91 98765 43215', email: 'info@sspublicschool.com', modules: defaultModulesConfig },
        { name: 'HMS', code: 'HMS007', isDefault: false, tagline: 'Modern Educational Excellence', address: 'City Centre Campus', phone: '+91 98765 43216', email: 'helpdesk@hmsedu.in', modules: defaultModulesConfig },
        { name: 'INDIAN PUBLIC SCHOOL', code: 'IPS008', isDefault: false, tagline: 'Values and Global Vision', address: 'GT Road Campus', phone: '+91 98765 43217', email: 'admissions@indianpublic.edu', modules: defaultModulesConfig },
        { name: 'Kids Ocean School', code: 'KOS009', isDefault: false, tagline: 'Nurturing Tiny Explorers', address: 'Green View Lane', phone: '+91 98765 43218', email: 'kids@oceanedu.com', modules: defaultModulesConfig },
        { name: 'Dhruv Public School', code: 'DPS010', isDefault: false, tagline: 'Excellence in Every Step', address: 'Nehru Nagar Branch', phone: '+91 98765 43219', email: 'dhruvpublic@school.in', modules: defaultModulesConfig }
      ];

      await School.insertMany(initialSchools);
      console.log('Seeded 10 default schools successfully.');
    }
  } catch (error) {
    console.error('Error seeding schools:', error);
  }
};

const seedDummyData = async () => {
  try {
    await seedSchools();

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



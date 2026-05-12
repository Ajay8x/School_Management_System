const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixLogins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const students = await Student.find();
    console.log(`Found ${students.length} students. Checking login accounts...`);

    let createdCount = 0;
    for (const student of students) {
      // Check if student already has a user account
      const existingUser = await User.findOne({ studentId: student._id });
      
      if (!existingUser) {
        // Create a user account for this student
        const rollNum = student.rollNumber || 'S' + Math.floor(Math.random() * 10000);
        if (!student.rollNumber) {
           student.rollNumber = rollNum;
           await student.save();
        }

        const loginEmail = student.email || `${student.rollNumber}@campuspilot.local`;
        
        try {
          await User.create({
            name: student.name,
            email: loginEmail,
            password: student.rollNumber, // Password is same as Roll Number
            role: 'student',
            studentId: student._id
          });
          createdCount++;
          console.log(`Created login for: ${student.name} (Roll: ${student.rollNumber})`);
        } catch (e) {
          // If email exists, try a different one
          await User.create({
            name: student.name,
            email: `${student.rollNumber}-${student._id.toString().slice(-4)}@campuspilot.local`,
            password: student.rollNumber,
            role: 'student',
            studentId: student._id
          });
          createdCount++;
        }
      }
    }

    console.log(`Done! Created ${createdCount} missing login accounts.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixLogins();

const mongoose = require('mongoose');
const Student = require('./models/Student');
const Fee = require('./models/Fee');
const dotenv = require('dotenv');

dotenv.config();

const seedFees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const students = await Student.find().limit(5);
    if (students.length === 0) {
      console.log('No students found to seed fees for.');
      process.exit();
    }

    const feeTypes = ['Tuition Fee', 'Exam Fee', 'Transport Fee'];
    
    for (const student of students) {
      // Create at least one fee for each student
      for (const type of feeTypes) {
        const amount = Math.floor(Math.random() * 5000) + 1000;
        const paidAmount = Math.random() > 0.5 ? amount : Math.floor(Math.random() * amount);
        const status = paidAmount === amount ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending');

        await Fee.create({
          student: student._id,
          feeType: type,
          amount,
          paidAmount,
          status,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        console.log(`Created ${type} for student ${student.name}`);
      }
    }

    console.log('Fees seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFees();

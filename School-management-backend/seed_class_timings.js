const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const ClassTiming = require('./models/ClassTiming');

dotenv.config();

const seedClassTimingsNow = async () => {
  try {
    await connectDB();

    const count = await ClassTiming.countDocuments();
    if (count > 0) {
      console.log(`ClassTimings already exist (count: ${count}). Skipping seed.`);
      process.exit(0);
    }

    console.log('Seeding initial class timings...');
    const sampleSessions = [
      { session: '1st Period', code: 'P1', isBreak: false, startTime: '08:00 AM', endTime: '08:35 AM' },
      { session: '2nd Period', code: 'P2', isBreak: false, startTime: '08:35 AM', endTime: '09:10 AM' },
      { session: 'Short Break', code: 'BRK1', isBreak: true, startTime: '09:10 AM', endTime: '09:25 AM' },
      { session: '3rd Period', code: 'P3', isBreak: false, startTime: '09:25 AM', endTime: '10:00 AM' },
      { session: '4th Period', code: 'P4', isBreak: false, startTime: '10:00 AM', endTime: '10:35 AM' },
      { session: 'Lunch Break', code: 'LUNCH', isBreak: true, startTime: '10:35 AM', endTime: '11:05 AM' },
      { session: '5th Period', code: 'P5', isBreak: false, startTime: '11:05 AM', endTime: '11:40 AM' },
      { session: '6th Period', code: 'P6', isBreak: false, startTime: '11:40 AM', endTime: '12:10 PM' },
      { session: '7th Period', code: 'P7', isBreak: false, startTime: '12:10 PM', endTime: '12:25 PM' },
      { session: '8th Period', code: 'P8', isBreak: false, startTime: '12:25 PM', endTime: '12:40 PM' }
    ];

    const timingList = [
      { sessionName: 'XII (C) 2025-26', description: 'Standard Senior Secondary Timing' },
      { sessionName: 'XII (B) 2025-26', description: 'Standard Senior Secondary Timing' },
      { sessionName: 'XII (A) 2025-26', description: 'Standard Senior Secondary Timing' },
      { sessionName: 'XI (C) 2025-26', description: 'Senior Secondary Timing' },
      { sessionName: 'XI (B) 2025-26', description: 'Senior Secondary Timing' },
      { sessionName: 'XI (A) 2025-26', description: 'Senior Secondary Timing' },
      { sessionName: 'X (A) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'X (B) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'X (C) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'IX (C) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'IX (B) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'IX (A) 2025-26', description: 'Secondary Section Class Timing' },
      { sessionName: 'VIII (C) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VIII (B) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VIII (A) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VII (C) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VII (B) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VII (A) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VI (C) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VI (B) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'VI (A) 2025-26', description: 'Middle Section Class Timing' },
      { sessionName: 'V (C) 2025-26', description: 'Primary Section Class Timing' },
      { sessionName: 'V (B) 2025-26', description: 'Primary Section Class Timing' },
      { sessionName: 'V (A) 2025-26', description: 'Primary Section Class Timing' },
      { sessionName: 'IV (C) 2025-26', description: 'Primary Section Class Timing' }
    ];

    for (let t of timingList) {
      await ClassTiming.create({
        sessionName: t.sessionName,
        description: t.description,
        sessions: sampleSessions,
        totalDurationText: '4 hour(s) 40 minute(s)',
        timeRangeText: '8:00 AM - 12:40 PM',
        sessionCount: 8,
        breakCount: 2,
        createdAt: new Date('2025-02-11T10:14:00.000Z')
      });
    }

    console.log(`Seeded ${timingList.length} Class Timings successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedClassTimingsNow();

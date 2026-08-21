const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Timetable = require('./models/Timetable');
const ClassTiming = require('./models/ClassTiming');

dotenv.config();

const seedTimetablesNow = async () => {
  try {
    await connectDB();

    const count = await Timetable.countDocuments();
    if (count > 0) {
      console.log(`Timetables already exist (count: ${count}). Clearing and re-seeding for full exact match...`);
      await Timetable.deleteMany({});
    }

    // Get default ClassTiming
    const sampleTiming = await ClassTiming.findOne();

    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const sampleAllocations = [
      { periodName: '1st Period', code: 'P1', isBreak: false, startTime: '08:00 AM', endTime: '08:35 AM', subject: 'Mathematics', teacher: 'Rajesh Sharma' },
      { periodName: '2nd Period', code: 'P2', isBreak: false, startTime: '08:35 AM', endTime: '09:10 AM', subject: 'English', teacher: 'Priya Verma' },
      { periodName: 'Short Break', code: 'BRK1', isBreak: true, startTime: '09:10 AM', endTime: '09:25 AM', subject: '', teacher: '' },
      { periodName: '3rd Period', code: 'P3', isBreak: false, startTime: '09:25 AM', endTime: '10:00 AM', subject: 'Science', teacher: 'Amit Kumar' },
      { periodName: '4th Period', code: 'P4', isBreak: false, startTime: '10:00 AM', endTime: '10:35 AM', subject: 'Social Studies', teacher: 'Rajesh Sharma' },
      { periodName: 'Lunch Break', code: 'LUNCH', isBreak: true, startTime: '10:35 AM', endTime: '11:05 AM', subject: '', teacher: '' },
      { periodName: '5th Period', code: 'P5', isBreak: false, startTime: '11:05 AM', endTime: '11:40 AM', subject: 'Hindi', teacher: 'Priya Verma' },
      { periodName: '6th Period', code: 'P6', isBreak: false, startTime: '11:40 AM', endTime: '12:10 PM', subject: 'Computer Science', teacher: 'Amit Kumar' }
    ];

    const daySchedules = daysList.map(day => ({
      day,
      isHoliday: day === 'Sunday',
      classTiming: sampleTiming ? sampleTiming._id : null,
      classTimingName: sampleTiming ? sampleTiming.sessionName : 'Standard Class Timing',
      allocations: day === 'Sunday' ? [] : sampleAllocations
    }));

    const timetableDataList = [
      { batch: 'I (I) Section A', room: 'Room 101 Block A Floor 1', effectiveDate: new Date('2026-03-04'), createdAt: new Date('2026-03-02T11:02:00.000Z') },
      { batch: 'IX (IX) Section C', room: 'Room 204 Block B Floor 2', effectiveDate: new Date('2026-01-01'), createdAt: new Date('2026-01-02T12:32:00.000Z') },
      { batch: 'Nursery (NUR) Section A', room: 'Room 1 Block A Floor 0', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-08T00:22:00.000Z') },
      { batch: 'V (V) Section C', room: 'Room 105 Block A Floor 1', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:38:00.000Z') },
      { batch: 'VI (VI) Section A', room: 'Room 106 Block A Floor 1', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:42:00.000Z') },
      { batch: 'VI (VI) Section B', room: 'Room 107 Block A Floor 1', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:42:00.000Z') },
      { batch: 'VI (VI) Section C', room: 'Room 108 Block A Floor 1', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:43:00.000Z') },
      { batch: 'VII (VII) Section A', room: 'Room 201 Block B Floor 2', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:43:00.000Z') },
      { batch: 'VII (VII) Section B', room: 'Room 202 Block B Floor 2', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:44:00.000Z') },
      { batch: 'VII (VII) Section C', room: 'Room 203 Block B Floor 2', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:44:00.000Z') },
      { batch: 'VIII (VIII) Section A', room: 'Room 301 Block C Floor 3', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:45:00.000Z') },
      { batch: 'VIII (VIII) Section B', room: 'Room 302 Block C Floor 3', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:45:00.000Z') },
      { batch: 'VIII (VIII) Section C', room: 'Room 303 Block C Floor 3', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:46:00.000Z') },
      { batch: 'IX (IX) Section A', room: 'Room 304 Block C Floor 3', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:46:00.000Z') },
      { batch: 'X (X) Section A', room: 'Room 401 Block D Floor 4', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:47:00.000Z') },
      { batch: 'X (X) Section B', room: 'Room 402 Block D Floor 4', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:47:00.000Z') },
      { batch: 'X (X) Section C', room: 'Room 403 Block D Floor 4', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:48:00.000Z') },
      { batch: 'XI (XI) Section A', room: 'Room 501 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:49:00.000Z') },
      { batch: 'XI (XI) Section B', room: 'Room 502 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:49:00.000Z') },
      { batch: 'XI (XI) Section C', room: 'Room 503 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:49:00.000Z') },
      { batch: 'XII (XII) Section A', room: 'Room 504 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:50:00.000Z') },
      { batch: 'XII (XII) Section B', room: 'Room 505 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:50:00.000Z') },
      { batch: 'XII (XII) Section C', room: 'Room 506 Block E Floor 5', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:50:00.000Z') },
      { batch: 'I (I) Section C', room: 'Room 103 Block A Floor 1', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-11T09:52:00.000Z') },
      { batch: 'Nursery (NUR) Section B', room: 'Room 2 Block A Floor 0', effectiveDate: new Date('2025-02-07'), createdAt: new Date('2025-02-10T17:08:00.000Z') }
    ];

    for (let item of timetableDataList) {
      await Timetable.create({
        batch: item.batch,
        room: item.room,
        effectiveDate: item.effectiveDate,
        description: 'Standard Academic Schedule Configuration',
        daySchedules,
        createdAt: item.createdAt
      });
    }

    console.log(`Seeded ${timetableDataList.length} Timetables successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedTimetablesNow();

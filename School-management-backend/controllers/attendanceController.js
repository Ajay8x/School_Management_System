const Attendance = require('../models/Attendance');

// Fetch attendance for a specific class on a specific date
exports.getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { className, date } = req.query;
    
    if (!className || !date) {
      return res.status(400).json({ message: 'className and date are required parameters' });
    }

    // Convert date string to Date object for the beginning of the day
    const queryDate = new Date(date);
    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1);

    const attendances = await Attendance.find({
      className,
      date: {
        $gte: queryDate,
        $lt: nextDay
      }
    }).populate('studentId', 'name rollNumber');

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching attendance' });
  }
};

// Bulk save or update attendance
exports.bulkSaveAttendance = async (req, res) => {
  try {
    const { className, date, records } = req.body;
    
    if (!className || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const attendanceDate = new Date(date);

    // Prepare bulk write operations for upsert
    const bulkOps = records.map(record => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          className: className,
          // Match the specific date strictly
          date: attendanceDate
        },
        update: {
          $set: {
            studentId: record.studentId,
            className: className,
            date: attendanceDate,
            status: record.status
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while saving attendance' });
  }
};

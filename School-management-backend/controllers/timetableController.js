const Timetable = require('../models/Timetable');
const ClassTiming = require('../models/ClassTiming');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// Get all timetables
exports.getTimetables = async (req, res) => {
  try {
    const query = {};
    if (req.schoolId) {
      query.$or = [
        { school: req.schoolId },
        { school: null },
        { school: { $exists: false } }
      ];
    }
    const timetables = await Timetable.find(query).sort({ createdAt: -1 });
    res.status(200).json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ message: 'Error fetching timetables', error: error.message });
  }
};

// Get timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.status(200).json(timetable);
  } catch (error) {
    console.error('Error fetching timetable by ID:', error);
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
};

// Create timetable
exports.createTimetable = async (req, res) => {
  try {
    const { batch, effectiveDate, room, description, daySchedules } = req.body;

    if (!batch || !batch.trim()) {
      return res.status(400).json({ message: 'Batch is required' });
    }
    if (!effectiveDate) {
      return res.status(400).json({ message: 'Effective Date is required' });
    }

    // Process daySchedules to automatically load sessions from ClassTiming if not provided
    const processedDaySchedules = [];
    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let dayObj of (daySchedules || [])) {
      const dayName = dayObj.day;
      const isHoliday = !!dayObj.isHoliday;
      const timingId = dayObj.classTiming;

      let allocations = dayObj.allocations || [];
      let timingName = dayObj.classTimingName || '';

      if (timingId && (!allocations || allocations.length === 0)) {
        const foundTiming = await ClassTiming.findById(timingId);
        if (foundTiming) {
          timingName = foundTiming.sessionName;
          allocations = (foundTiming.sessions || []).map(s => ({
            periodName: s.session,
            code: s.code,
            isBreak: s.isBreak,
            startTime: s.startTime,
            endTime: s.endTime,
            subject: '',
            teacher: ''
          }));
        }
      }

      processedDaySchedules.push({
        day: dayName,
        isHoliday,
        classTiming: timingId || null,
        classTimingName: timingName,
        allocations
      });
    }

    const newTimetable = new Timetable({
      school: req.schoolId || null,
      batch: batch.trim(),
      room: room || '',
      effectiveDate: new Date(effectiveDate),
      description: description || '',
      daySchedules: processedDaySchedules
    });

    const saved = await newTimetable.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ message: 'Error creating timetable', error: error.message });
  }
};

// Update timetable
exports.updateTimetable = async (req, res) => {
  try {
    const { batch, effectiveDate, room, description, daySchedules, status } = req.body;

    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (batch !== undefined) timetable.batch = batch.trim();
    if (room !== undefined) timetable.room = room;
    if (effectiveDate !== undefined) timetable.effectiveDate = new Date(effectiveDate);
    if (description !== undefined) timetable.description = description;
    if (status !== undefined) timetable.status = status;

    if (daySchedules && Array.isArray(daySchedules)) {
      const processedDaySchedules = [];
      for (let dayObj of daySchedules) {
        let allocations = dayObj.allocations || [];
        let timingName = dayObj.classTimingName || '';
        const timingId = dayObj.classTiming;

        if (timingId && (!allocations || allocations.length === 0)) {
          const foundTiming = await ClassTiming.findById(timingId);
          if (foundTiming) {
            timingName = foundTiming.sessionName;
            allocations = (foundTiming.sessions || []).map(s => ({
              periodName: s.session,
              code: s.code,
              isBreak: s.isBreak,
              startTime: s.startTime,
              endTime: s.endTime,
              subject: '',
              teacher: ''
            }));
          }
        }

        processedDaySchedules.push({
          day: dayObj.day,
          isHoliday: !!dayObj.isHoliday,
          classTiming: timingId || null,
          classTimingName: timingName,
          allocations
        });
      }
      timetable.daySchedules = processedDaySchedules;
    }

    const updated = await timetable.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ message: 'Error updating timetable', error: error.message });
  }
};

// Update Allocations (Subject/Teacher assignments for periods)
exports.updateAllocations = async (req, res) => {
  try {
    const { daySchedules } = req.body;
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (daySchedules && Array.isArray(daySchedules)) {
      timetable.daySchedules = daySchedules;
    }

    const updated = await timetable.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating allocations:', error);
    res.status(500).json({ message: 'Error updating allocations', error: error.message });
  }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.status(200).json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Error deleting timetable', error: error.message });
  }
};

// Get Teacher Timetable
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { teacherName, teacherId, date } = req.query;
    const timetables = await Timetable.find({ status: 'Active' });

    let scheduleList = [];

    timetables.forEach(tt => {
      tt.daySchedules.forEach(ds => {
        if (ds.isHoliday) return;
        ds.allocations.forEach(alloc => {
          if (!alloc.isBreak && alloc.teacher) {
            const matchesTeacher = 
              (teacherName && alloc.teacher.toLowerCase().includes(teacherName.toLowerCase())) ||
              (teacherId && alloc.teacherId && alloc.teacherId.toString() === teacherId);

            if (matchesTeacher || !teacherName) {
              scheduleList.push({
                timetableId: tt._id,
                batch: tt.batch,
                room: tt.room,
                day: ds.day,
                periodName: alloc.periodName,
                code: alloc.code,
                startTime: alloc.startTime,
                endTime: alloc.endTime,
                subject: alloc.subject,
                teacher: alloc.teacher
              });
            }
          }
        });
      });
    });

    res.status(200).json(scheduleList);
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({ message: 'Error fetching teacher timetable', error: error.message });
  }
};

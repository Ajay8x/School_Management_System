const ClassTiming = require('../models/ClassTiming');

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  timeStr = timeStr.trim().toUpperCase();
  const isPM = timeStr.includes('PM');
  const isAM = timeStr.includes('AM');
  const cleanStr = timeStr.replace(/(AM|PM)/g, '').trim();
  const parts = cleanStr.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function minutesToFormattedTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minStr} ${period}`;
}

function calculateTimingStats(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      sessionCount: 0,
      breakCount: 0,
      totalDurationText: '0 hour(s) 0 minute(s)',
      timeRangeText: '-'
    };
  }

  let sessionCount = 0;
  let breakCount = 0;
  let minMinutes = Infinity;
  let maxMinutes = -Infinity;

  sessions.forEach(s => {
    if (s.isBreak) breakCount++;
    else sessionCount++;

    const startMins = parseTimeToMinutes(s.startTime);
    const endMins = parseTimeToMinutes(s.endTime);

    if (startMins < minMinutes) minMinutes = startMins;
    if (endMins > maxMinutes) maxMinutes = endMins;
  });

  let totalDiff = 0;
  if (minMinutes !== Infinity && maxMinutes !== -Infinity && maxMinutes >= minMinutes) {
    totalDiff = maxMinutes - minMinutes;
  }

  const hours = Math.floor(totalDiff / 60);
  const minutes = totalDiff % 60;

  const totalDurationText = `${hours} hour(s) ${minutes} minute(s)`;
  const startTimeFormatted = minMinutes !== Infinity ? minutesToFormattedTime(minMinutes) : '-';
  const endTimeFormatted = maxMinutes !== -Infinity ? minutesToFormattedTime(maxMinutes) : '-';
  const timeRangeText = `${startTimeFormatted} - ${endTimeFormatted}`;

  return {
    sessionCount,
    breakCount,
    totalDurationText,
    timeRangeText
  };
}

// Get all class timings
exports.getClassTimings = async (req, res) => {
  try {
    const query = {};
    if (req.schoolId) {
      query.$or = [
        { school: req.schoolId },
        { school: null },
        { school: { $exists: false } }
      ];
    }
    const classTimings = await ClassTiming.find(query).sort({ createdAt: -1 });
    res.status(200).json(classTimings);
  } catch (error) {
    console.error('Error fetching class timings:', error);
    res.status(500).json({ message: 'Error fetching class timings', error: error.message });
  }
};

// Get single class timing by ID
exports.getClassTimingById = async (req, res) => {
  try {
    const classTiming = await ClassTiming.findById(req.params.id);
    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }
    res.status(200).json(classTiming);
  } catch (error) {
    console.error('Error fetching class timing:', error);
    res.status(500).json({ message: 'Error fetching class timing', error: error.message });
  }
};

// Create class timing
exports.createClassTiming = async (req, res) => {
  try {
    const { sessionName, description, sessions } = req.body;

    if (!sessionName || !sessionName.trim()) {
      return res.status(400).json({ message: 'Session Name is required' });
    }

    const stats = calculateTimingStats(sessions || []);

    const newClassTiming = new ClassTiming({
      school: req.schoolId || null,
      sessionName: sessionName.trim(),
      description: description || '',
      sessions: sessions || [],
      totalDurationText: stats.totalDurationText,
      timeRangeText: stats.timeRangeText,
      sessionCount: stats.sessionCount,
      breakCount: stats.breakCount
    });

    const saved = await newClassTiming.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating class timing:', error);
    res.status(500).json({ message: 'Error creating class timing', error: error.message });
  }
};

// Update class timing
exports.updateClassTiming = async (req, res) => {
  try {
    const { sessionName, description, sessions, status } = req.body;

    const classTiming = await ClassTiming.findById(req.params.id);
    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }

    if (sessionName !== undefined) classTiming.sessionName = sessionName.trim();
    if (description !== undefined) classTiming.description = description;
    if (sessions !== undefined) classTiming.sessions = sessions;
    if (status !== undefined) classTiming.status = status;

    const stats = calculateTimingStats(classTiming.sessions);
    classTiming.totalDurationText = stats.totalDurationText;
    classTiming.timeRangeText = stats.timeRangeText;
    classTiming.sessionCount = stats.sessionCount;
    classTiming.breakCount = stats.breakCount;

    const updated = await classTiming.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating class timing:', error);
    res.status(500).json({ message: 'Error updating class timing', error: error.message });
  }
};

// Delete class timing
exports.deleteClassTiming = async (req, res) => {
  try {
    const classTiming = await ClassTiming.findByIdAndDelete(req.params.id);
    if (!classTiming) {
      return res.status(404).json({ message: 'Class timing not found' });
    }
    res.status(200).json({ message: 'Class timing deleted successfully' });
  } catch (error) {
    console.error('Error deleting class timing:', error);
    res.status(500).json({ message: 'Error deleting class timing', error: error.message });
  }
};

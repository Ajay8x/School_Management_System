const HealthRecord = require('../models/HealthRecord');
const Student = require('../models/Student');

// @desc    Get all health records
// @route   GET /api/health-records
// @access  Private
exports.getHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find().populate('student', 'name rollNumber className');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single health record by student ID
// @route   GET /api/health-records/student/:studentId
// @access  Private
exports.getHealthRecordByStudent = async (req, res) => {
  try {
    let record = await HealthRecord.findOne({ student: req.params.studentId }).populate('student', 'name rollNumber className');
    if (!record) {
      // If no record exists, return an empty structure or 404
      return res.status(404).json({ message: 'Health record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upsert health record (Create or Update)
// @route   POST /api/health-records
// @access  Private (Admin)
exports.upsertHealthRecord = async (req, res) => {
  try {
    const { student, ...recordData } = req.body;
    
    let record = await HealthRecord.findOneAndUpdate(
      { student },
      { ...recordData, updatedAt: Date.now() },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete health record
// @route   DELETE /api/health-records/:id
// @access  Private (Admin)
exports.deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Health record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

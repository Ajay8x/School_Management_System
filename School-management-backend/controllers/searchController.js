const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Guardian = require('../models/Guardian');

// @desc    Global search across entities
// @route   GET /api/search?q=...
// @access  Private
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ students: [], teachers: [], guardians: [] });
    }

    const regex = new RegExp(q, 'i');
    const schoolFilter = req.schoolId ? { schoolId: req.schoolId } : {};

    const [students, teachers] = await Promise.all([
      Student.find({ ...schoolFilter, $or: [{ name: regex }, { email: regex }, { rollNumber: regex }] }).limit(5),
      Teacher.find({ ...schoolFilter, $or: [{ name: regex }, { email: regex }, { subject: regex }] }).limit(5),
    ]);

    res.json({
      students,
      teachers,
      guardians
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
};

const Class = require('../models/Class');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasss = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const classes = await Class.find(filter).populate('teacher', 'name employeeId subject');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).populate('teacher', 'name employeeId');
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private (Admin)
exports.createClass = async (req, res) => {
  try {
    const classData = { ...req.body };
    if (req.schoolId) classData.schoolId = req.schoolId;
    const classItem = await Class.create(classData);
    await logActivity({ req, user: req.user, activity: `Created new class/course: ${classItem.name}` });
    res.status(201).json(classItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    await logActivity({ req, user: req.user, activity: `Updated class/course: ${classItem.name}` });
    res.json(classItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    await classItem.deleteOne();
    await logActivity({ req, user: req.user, activity: `Deleted class/course: ${classItem.name}` });
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

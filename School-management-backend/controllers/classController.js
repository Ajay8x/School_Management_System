const Class = require('../models/Class');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasss = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name employeeId subject');
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
    const classItem = await Class.create(req.body);
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
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

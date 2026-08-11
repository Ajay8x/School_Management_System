const Leave = require('../models/Leave');

exports.getLeaves = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const items = await Leave.find(filter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    const item = await Leave.create(d);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

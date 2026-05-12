const Leave = require('../models/Leave');

exports.getLeaves = async (req, res) => {
  try {
    const items = await Leave.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const item = await Leave.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

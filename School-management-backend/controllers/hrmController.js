const HRM = require('../models/HRM');

exports.getHRMs = async (req, res) => {
  try {
    const items = await HRM.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createHRM = async (req, res) => {
  try {
    const item = await HRM.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

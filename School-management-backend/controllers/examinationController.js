const Examination = require('../models/Examination');

exports.getExaminations = async (req, res) => {
  try {
    const items = await Examination.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExamination = async (req, res) => {
  try {
    const item = await Examination.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

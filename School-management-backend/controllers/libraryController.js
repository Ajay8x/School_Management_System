const Library = require('../models/Library');

exports.getLibrarys = async (req, res) => {
  try {
    const items = await Library.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLibrary = async (req, res) => {
  try {
    const item = await Library.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

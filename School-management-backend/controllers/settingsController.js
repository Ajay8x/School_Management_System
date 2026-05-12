const Settings = require('../models/Settings');

exports.getSettingss = async (req, res) => {
  try {
    const items = await Settings.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const item = await Settings.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

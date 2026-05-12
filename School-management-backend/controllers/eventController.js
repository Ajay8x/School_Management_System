const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const items = await Event.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const item = await Event.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

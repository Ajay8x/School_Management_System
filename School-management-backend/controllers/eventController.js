const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const items = await Event.find(filter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    const item = await Event.create(d);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

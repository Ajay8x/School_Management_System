const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');

exports.getEvents = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (req.schoolId) filter.schoolId = req.schoolId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const items = await Event.find(filter).sort({ date: 1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const item = await Event.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Event not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    if (req.user) d.createdBy = req.user._id;

    const item = await Event.create(d);

    // Audit Log
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name || 'System User',
        userEmail: req.user.email,
        userRole: req.user.role || 'admin',
        activity: `Created ${item.type}: ${item.title}`
      }).catch(err => console.error("Failed to log activity:", err));
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const item = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Event not found' });

    // Audit Log
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name || 'System User',
        userEmail: req.user.email,
        userRole: req.user.role || 'admin',
        activity: `Updated ${item.type}: ${item.title}`
      }).catch(err => console.error("Failed to log activity:", err));
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: error.message || 'Update failed' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const item = await Event.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Event not found' });

    // Audit Log
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name || 'System User',
        userEmail: req.user.email,
        userRole: req.user.role || 'admin',
        activity: `Deleted ${item.type}: ${item.title}`
      }).catch(err => console.error("Failed to log activity:", err));
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


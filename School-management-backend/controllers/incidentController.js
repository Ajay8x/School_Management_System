const Incident = require('../models/Incident');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all discipline incidents
// @route   GET /api/discipline/incidents
// @access  Private
exports.getIncidents = async (req, res) => {
  try {
    const { search, category, nature, severity, actionStatus, studentId, fromDate, toDate, sortBy } = req.query;

    let filter = {};
    if (req.schoolId) {
      filter.$or = [
        { schoolId: req.schoolId },
        { schoolId: null },
        { schoolId: { $exists: false } }
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (nature && nature !== 'All') {
      filter.nature = nature;
    }

    if (severity && severity !== 'All') {
      filter.severity = severity;
    }

    if (actionStatus && actionStatus !== 'All') {
      filter.actionStatus = actionStatus;
    }

    if (studentId) {
      filter.student = studentId;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchFilter = {
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { studentName: searchRegex },
          { studentRoll: searchRegex },
          { studentClass: searchRegex },
          { reportedBy: searchRegex },
          { description: searchRegex },
          { action: searchRegex }
        ]
      };

      if (filter.$or) {
        filter = {
          $and: [
            { $or: filter.$or },
            searchFilter
          ]
        };
      } else {
        filter = { ...filter, ...searchFilter };
      }
    }

    let query = Incident.find(filter).populate('student', 'name rollNumber className section contact parentName');

    if (sortBy === 'severity') {
      query = query.sort({ severity: -1, date: -1 });
    } else {
      query = query.sort({ date: -1, createdAt: -1 });
    }

    const incidents = await query.exec();
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Server Error fetching incidents', error: error.message });
  }
};

// @desc    Get single discipline incident
// @route   GET /api/discipline/incidents/:id
// @access  Private
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('student', 'name rollNumber className section contact parentName address');
    if (!incident) {
      return res.status(404).json({ message: 'Incident record not found' });
    }
    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ message: 'Server Error fetching incident' });
  }
};

// @desc    Create new discipline incident
// @route   POST /api/discipline/incidents
// @access  Private
exports.createIncident = async (req, res) => {
  try {
    const {
      category,
      title,
      nature,
      severity,
      date,
      student,
      studentName,
      studentRoll,
      studentClass,
      reportedBy,
      description,
      action,
      actionStatus,
      attachments
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Please provide an incident title' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Please provide an incident description' });
    }

    const incidentData = {
      category: category || 'Behavioral',
      title: title.trim(),
      nature: nature || 'Minor',
      severity: severity || 'Low',
      date: date || new Date(),
      student: student || null,
      studentName: studentName || '',
      studentRoll: studentRoll || '',
      studentClass: studentClass || '',
      reportedBy: reportedBy || req.user?.name || 'School Administration',
      reportedByUserId: req.user?._id || req.user?.id,
      description: description.trim(),
      action: action ? action.trim() : '',
      actionStatus: actionStatus || 'Pending',
      attachments: Array.isArray(attachments) ? attachments : []
    };

    if (req.schoolId) {
      incidentData.schoolId = req.schoolId;
    }
    if (req.headers && req.headers['x-session-id']) {
      incidentData.sessionId = req.headers['x-session-id'];
    }

    const incident = await Incident.create(incidentData);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created Discipline Incident: "${incident.title}" for ${incident.studentName || 'Student'}`
      });
    }

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(400).json({ message: error.message || 'Failed to create incident record' });
  }
};

// @desc    Update existing discipline incident
// @route   PUT /api/discipline/incidents/:id
// @access  Private
exports.updateIncident = async (req, res) => {
  try {
    const existing = await Incident.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Incident record not found' });
    }

    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated Discipline Incident: "${updated.title}"`
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(400).json({ message: error.message || 'Failed to update incident record' });
  }
};

// @desc    Delete discipline incident
// @route   DELETE /api/discipline/incidents/:id
// @access  Private
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident record not found' });
    }

    await incident.deleteOne();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Deleted Discipline Incident: "${incident.title}"`
      });
    }

    res.json({ message: 'Incident record deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ message: 'Server Error deleting incident record' });
  }
};

// @desc    Bulk delete discipline incidents
// @route   POST /api/discipline/incidents/bulk-delete
// @access  Private
exports.bulkDeleteIncidents = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of IDs to delete' });
    }

    await Incident.deleteMany({ _id: { $in: ids } });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Bulk deleted ${ids.length} discipline incidents`
      });
    }

    res.json({ message: `Successfully deleted ${ids.length} incidents` });
  } catch (error) {
    console.error('Error bulk deleting incidents:', error);
    res.status(500).json({ message: 'Server Error in bulk deletion' });
  }
};

// @desc    Update action status
// @route   PATCH /api/discipline/incidents/:id/status
// @access  Private
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { actionStatus } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident record not found' });
    }

    incident.actionStatus = actionStatus || incident.actionStatus;
    await incident.save();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated status of Incident "${incident.title}" to ${incident.actionStatus}`
      });
    }

    res.json(incident);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server Error updating status' });
  }
};

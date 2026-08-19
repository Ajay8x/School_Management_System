const Ticket = require('../models/Ticket');
const HelpdeskConfig = require('../models/HelpdeskConfig');

// Helper to generate auto ticket number
const generateTicketNumber = async (schoolId) => {
  try {
    let query = {};
    if (schoolId) {
      query.$or = [{ schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    const config = await HelpdeskConfig.findOne(query);

    const prefix = (config && config.ticketPrefix) ? config.ticketPrefix : 'HT';
    const digits = (config && config.ticketDigit) ? config.ticketDigit : 3;
    const suffix = (config && config.ticketSuffix) ? config.ticketSuffix : '';

    const count = await Ticket.countDocuments(query);
    const nextNum = String(count + 1).padStart(digits, '0');

    return `${prefix}${nextNum}${suffix}`;
  } catch (err) {
    console.error('Error generating ticket number:', err);
    return `HT${Date.now().toString().slice(-4)}`;
  }
};

// @desc    Get all Tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const { category, priority, status, search } = req.query;
    let query = {};

    if (req.schoolId) {
      query.$or = [
        { schoolId: req.schoolId },
        { schoolId: { $exists: false } },
        { schoolId: null }
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (status && status !== 'All') query.status = status;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchCondition = {
        $or: [
          { ticketNumber: searchRegex },
          { subject: searchRegex },
          { category: searchRegex },
          { priority: searchRegex },
          { description: searchRegex }
        ]
      };
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchCondition];
        delete query.$or;
      } else {
        query.$or = searchCondition.$or;
      }
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error fetching tickets', error: error.message });
  }
};

// @desc    Get Ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching ticket', error: error.message });
  }
};

// @desc    Create Ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, status, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and Description are required' });
    }

    const schoolId = req.schoolId || (req.user ? req.user.schoolId : undefined);
    const ticketNumber = await generateTicketNumber(schoolId);

    const ticket = new Ticket({
      ticketNumber,
      subject,
      category: category || 'General',
      priority: priority || 'Medium',
      status: status || 'Open',
      description,
      createdBy: req.user ? req.user._id : undefined,
      schoolId
    });

    const saved = await ticket.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error creating ticket', error: error.message });
  }
};

// @desc    Update Ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    const { subject, category, priority, status, description } = req.body;

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (subject !== undefined) ticket.subject = subject;
    if (category !== undefined) ticket.category = category;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;
    if (description !== undefined) ticket.description = description;

    const saved = await ticket.save();
    res.json(saved);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Server error updating ticket', error: error.message });
  }
};

// @desc    Delete Ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket removed successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Server error deleting ticket', error: error.message });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};

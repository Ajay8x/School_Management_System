const HelpdeskConfig = require('../models/HelpdeskConfig');
const FAQCategory = require('../models/FAQCategory');
const TicketCategory = require('../models/TicketCategory');
const TicketPriority = require('../models/TicketPriority');

// === CONFIG CONTROLLERS ===
const getConfig = async (req, res) => {
  try {
    let query = {};
    if (req.schoolId) {
      query.$or = [{ schoolId: req.schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    let config = await HelpdeskConfig.findOne(query);
    if (!config) {
      config = await HelpdeskConfig.create({ schoolId: req.schoolId || undefined, ticketPrefix: 'HT', ticketDigit: 3 });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Helpdesk Config', error: error.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    const { faqTitle, faqDescription, ticketPrefix, ticketDigit, ticketSuffix } = req.body;
    let query = {};
    if (req.schoolId) {
      query.$or = [{ schoolId: req.schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    let config = await HelpdeskConfig.findOne(query);
    if (!config) {
      config = new HelpdeskConfig({ schoolId: req.schoolId || undefined });
    }

    if (faqTitle !== undefined) config.faqTitle = faqTitle;
    if (faqDescription !== undefined) config.faqDescription = faqDescription;
    if (ticketPrefix !== undefined) config.ticketPrefix = ticketPrefix;
    if (ticketDigit !== undefined) config.ticketDigit = ticketDigit;
    if (ticketSuffix !== undefined) config.ticketSuffix = ticketSuffix;

    const saved = await config.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Helpdesk Config', error: error.message });
  }
};

// === FAQ CATEGORY CONTROLLERS ===
const getFAQCategories = async (req, res) => {
  try {
    let query = {};
    if (req.schoolId) {
      query.$or = [{ schoolId: req.schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    const cats = await FAQCategory.find(query).sort({ createdAt: -1 });
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ Categories', error: error.message });
  }
};

const createFAQCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const cat = new FAQCategory({ name, color: color || '#3b82f6', description, schoolId: req.schoolId || undefined });
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating FAQ Category', error: error.message });
  }
};

const updateFAQCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const cat = await FAQCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    if (name !== undefined) cat.name = name;
    if (color !== undefined) cat.color = color;
    if (description !== undefined) cat.description = description;

    const saved = await cat.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ Category', error: error.message });
  }
};

const deleteFAQCategory = async (req, res) => {
  try {
    await FAQCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ Category', error: error.message });
  }
};

// === TICKET CATEGORY CONTROLLERS ===
const getTicketCategories = async (req, res) => {
  try {
    let query = {};
    if (req.schoolId) {
      query.$or = [{ schoolId: req.schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    const cats = await TicketCategory.find(query).sort({ createdAt: -1 });
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Ticket Categories', error: error.message });
  }
};

const createTicketCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const cat = new TicketCategory({ name, color: color || '#10b981', description, schoolId: req.schoolId || undefined });
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Ticket Category', error: error.message });
  }
};

const updateTicketCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const cat = await TicketCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Ticket Category not found' });

    if (name !== undefined) cat.name = name;
    if (color !== undefined) cat.color = color;
    if (description !== undefined) cat.description = description;

    const saved = await cat.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Ticket Category', error: error.message });
  }
};

const deleteTicketCategory = async (req, res) => {
  try {
    await TicketCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Ticket Category', error: error.message });
  }
};

// === TICKET PRIORITY CONTROLLERS ===
const getTicketPriorities = async (req, res) => {
  try {
    let query = {};
    if (req.schoolId) {
      query.$or = [{ schoolId: req.schoolId }, { schoolId: { $exists: false } }, { schoolId: null }];
    }
    const items = await TicketPriority.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Ticket Priorities', error: error.message });
  }
};

const createTicketPriority = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const priority = new TicketPriority({ name, color: color || '#f59e0b', description, schoolId: req.schoolId || undefined });
    const saved = await priority.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Ticket Priority', error: error.message });
  }
};

const updateTicketPriority = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const item = await TicketPriority.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ticket Priority not found' });

    if (name !== undefined) item.name = name;
    if (color !== undefined) item.color = color;
    if (description !== undefined) item.description = description;

    const saved = await item.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Ticket Priority', error: error.message });
  }
};

const deleteTicketPriority = async (req, res) => {
  try {
    await TicketPriority.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket Priority removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Ticket Priority', error: error.message });
  }
};

module.exports = {
  getConfig,
  updateConfig,
  getFAQCategories,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
  getTicketCategories,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
  getTicketPriorities,
  createTicketPriority,
  updateTicketPriority,
  deleteTicketPriority
};

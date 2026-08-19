const express = require('express');
const router = express.Router();
const { 
  getConfig, updateConfig,
  getFAQCategories, createFAQCategory, updateFAQCategory, deleteFAQCategory,
  getTicketCategories, createTicketCategory, updateTicketCategory, deleteTicketCategory,
  getTicketPriorities, createTicketPriority, updateTicketPriority, deleteTicketPriority
} = require('../controllers/helpdeskConfigController');
const { protect } = require('../middlewares/authMiddleware');

// Config
router.route('/config')
  .get(protect, getConfig)
  .put(protect, updateConfig);

// FAQ Categories
router.route('/faq-categories')
  .get(protect, getFAQCategories)
  .post(protect, createFAQCategory);

router.route('/faq-categories/:id')
  .put(protect, updateFAQCategory)
  .delete(protect, deleteFAQCategory);

// Ticket Categories
router.route('/ticket-categories')
  .get(protect, getTicketCategories)
  .post(protect, createTicketCategory);

router.route('/ticket-categories/:id')
  .put(protect, updateTicketCategory)
  .delete(protect, deleteTicketCategory);

// Ticket Priorities
router.route('/ticket-priorities')
  .get(protect, getTicketPriorities)
  .post(protect, createTicketPriority);

router.route('/ticket-priorities/:id')
  .put(protect, updateTicketPriority)
  .delete(protect, deleteTicketPriority);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:id')
  .get(protect, getTicketById)
  .put(protect, updateTicket)
  .delete(protect, deleteTicket);

module.exports = router;

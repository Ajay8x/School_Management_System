const express = require('express');
const router = express.Router();
const { 
  getFAQs, 
  getFAQById, 
  createFAQ, 
  updateFAQ, 
  deleteFAQ 
} = require('../controllers/faqController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getFAQs)
  .post(protect, createFAQ);

router.route('/:id')
  .get(protect, getFAQById)
  .put(protect, updateFAQ)
  .delete(protect, deleteFAQ);

module.exports = router;

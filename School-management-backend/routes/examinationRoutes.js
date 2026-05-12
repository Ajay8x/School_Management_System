const express = require('express');
const router = express.Router();
const { getExaminations, createExamination } = require('../controllers/examinationController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getExaminations)
  .post(protect, authRole('admin'), createExamination);

module.exports = router;

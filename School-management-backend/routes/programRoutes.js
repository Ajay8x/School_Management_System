const express = require('express');
const router = express.Router();
const { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getPrograms)
  .post(protect, authRole('admin', 'super-admin'), createProgram);

router.route('/:id')
  .get(protect, getProgram)
  .put(protect, authRole('admin', 'super-admin'), updateProgram)
  .delete(protect, authRole('admin', 'super-admin'), deleteProgram);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getDivisions, getDivision, createDivision, updateDivision, deleteDivision, duplicateDivision, assignIncharge 
} = require('../controllers/divisionController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getDivisions)
  .post(protect, authRole('admin', 'super-admin'), createDivision);

router.route('/:id')
  .get(protect, getDivision)
  .put(protect, authRole('admin', 'super-admin'), updateDivision)
  .delete(protect, authRole('admin', 'super-admin'), deleteDivision);

router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateDivision);
router.patch('/:id/incharge', protect, authRole('admin', 'super-admin'), assignIncharge);

module.exports = router;

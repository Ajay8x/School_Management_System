const express = require('express');
const router = express.Router();
const { 
  getFees, 
  getStudentFees, 
  createFee, 
  updateFee, 
  deleteFee 
} = require('../controllers/feeController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getFees)
  .post(protect, authRole('admin', 'super-admin'), createFee);

router.route('/student/:studentId')
  .get(protect, getStudentFees);

router.route('/:id')
  .put(protect, authRole('admin', 'super-admin'), updateFee)
  .delete(protect, authRole('admin', 'super-admin'), deleteFee);

module.exports = router;

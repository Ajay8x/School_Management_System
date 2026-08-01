const express = require('express');
const router = express.Router();
const { 
  getEnquiries, createEnquiry, updateEnquiry,
  getVisitors, createVisitor, updateVisitorOutTime,
  getComplaints, createComplaint, updateComplaint
} = require('../controllers/receptionController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Enquiry Routes
router.route('/enquiries').get(protect, getEnquiries).post(protect, createEnquiry);
router.route('/enquiries/:id').put(protect, updateEnquiry);

// Visitor Routes
router.route('/visitors').get(protect, getVisitors).post(protect, createVisitor);
router.patch('/visitors/:id/out', protect, updateVisitorOutTime);

// Complaint Routes
router.route('/complaints').get(protect, getComplaints).post(protect, createComplaint);
router.put('/complaints/:id', protect, updateComplaint);

module.exports = router;

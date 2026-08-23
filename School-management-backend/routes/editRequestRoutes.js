const express = require('express');
const router = express.Router();
const {
  getEditRequests,
  getEditRequestById,
  createEditRequest,
  updateEditRequestStatus,
  updateEditRequest,
  deleteEditRequest
} = require('../controllers/editRequestController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getEditRequests)
  .post(protect, createEditRequest);

router.route('/:id')
  .get(protect, getEditRequestById)
  .put(protect, updateEditRequest)
  .delete(protect, authRole('admin', 'super-admin'), deleteEditRequest);

router.put('/:id/status', protect, authRole('admin', 'super-admin'), updateEditRequestStatus);

module.exports = router;

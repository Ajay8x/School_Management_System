const express = require('express');
const router = express.Router();
const {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
  importServiceRequests
} = require('../controllers/serviceRequestController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getServiceRequests)
  .post(protect, createServiceRequest);

router.post('/import', protect, importServiceRequests);

router.route('/:id')
  .get(protect, getServiceRequestById)
  .put(protect, updateServiceRequest)
  .delete(protect, authRole('admin', 'super-admin'), deleteServiceRequest);


router.put('/:id/status', protect, authRole('admin', 'super-admin'), updateServiceRequestStatus);

module.exports = router;

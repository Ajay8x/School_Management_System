const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  bulkDeleteIncidents,
  updateIncidentStatus
} = require('../controllers/incidentController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getIncidents)
  .post(protect, createIncident);

router.post('/bulk-delete', protect, bulkDeleteIncidents);

router.route('/:id')
  .get(protect, getIncidentById)
  .put(protect, updateIncident)
  .delete(protect, deleteIncident);

router.patch('/:id/status', protect, updateIncidentStatus);

module.exports = router;

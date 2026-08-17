const express = require('express');
const router = express.Router();
const { 
  getBatches, getBatch, createBatch, updateBatch, deleteBatch, duplicateBatch, reorderBatchSubjects,
  getBatchIncharges, addBatchIncharge
} = require('../controllers/batchController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getBatches)
  .post(protect, authRole('admin', 'super-admin'), createBatch);

// Batch Incharges Routes
router.get('/incharges/all', protect, getBatchIncharges);
router.post('/incharges/add', protect, authRole('admin', 'super-admin'), addBatchIncharge);

router.route('/:id')
  .get(protect, getBatch)
  .put(protect, authRole('admin', 'super-admin'), updateBatch)
  .delete(protect, authRole('admin', 'super-admin'), deleteBatch);

router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateBatch);
router.post('/:id/reorder-subjects', protect, authRole('admin', 'super-admin'), reorderBatchSubjects);

module.exports = router;

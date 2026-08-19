const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  duplicateSubject,
  deleteSubject,
  allotSubjects
} = require('../controllers/subjectController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authRole('admin', 'super-admin'), createSubject);

router.post('/allot', protect, authRole('admin', 'super-admin'), allotSubjects);
router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateSubject);

router.route('/:id')
  .get(protect, getSubject)
  .put(protect, authRole('admin', 'super-admin'), updateSubject)
  .delete(protect, authRole('admin', 'super-admin'), deleteSubject);

module.exports = router;

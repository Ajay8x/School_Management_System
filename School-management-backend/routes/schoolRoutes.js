const express = require('express');
const router = express.Router();
const {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  updateSchoolModules,
  deleteSchool
} = require('../controllers/schoolController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Get all schools or create
router.route('/')
  .get(protect, getSchools)
  .post(protect, authRole('super-admin'), createSchool);

// Module settings update
router.route('/:id/modules')
  .put(protect, authRole('super-admin'), updateSchoolModules);

// Single school routes
router.route('/:id')
  .get(protect, getSchoolById)
  .put(protect, authRole('super-admin'), updateSchool)
  .delete(protect, authRole('super-admin'), deleteSchool);

module.exports = router;

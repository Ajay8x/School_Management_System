const express = require('express');
const router = express.Router();
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authRole('admin', 'super-admin'), createDepartment);

router.route('/:id')
  .get(protect, getDepartment)
  .put(protect, authRole('admin', 'super-admin'), updateDepartment)
  .delete(protect, authRole('admin', 'super-admin'), deleteDepartment);

module.exports = router;

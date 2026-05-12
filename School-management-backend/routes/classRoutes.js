const express = require('express');
const router = express.Router();
const { getClasss, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getClasss)
  .post(protect, authRole('admin', 'super-admin'), createClass);

router.route('/:id')
  .get(protect, getClass)
  .put(protect, authRole('admin', 'super-admin'), updateClass)
  .delete(protect, authRole('admin', 'super-admin'), deleteClass);

module.exports = router;

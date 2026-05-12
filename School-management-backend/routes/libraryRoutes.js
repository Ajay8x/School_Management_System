const express = require('express');
const router = express.Router();
const { getLibrarys, createLibrary } = require('../controllers/libraryController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getLibrarys)
  .post(protect, authRole('admin'), createLibrary);

module.exports = router;

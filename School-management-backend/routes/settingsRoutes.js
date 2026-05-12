const express = require('express');
const router = express.Router();
const { getSettingss, createSettings } = require('../controllers/settingsController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getSettingss)
  .post(protect, authRole('admin'), createSettings);

module.exports = router;

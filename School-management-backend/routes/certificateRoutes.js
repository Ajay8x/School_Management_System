const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate } = require('../controllers/certificateController');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getCertificates)
  .post(protect, authRole('admin'), createCertificate);

module.exports = router;

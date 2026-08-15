const express = require('express');
const router = express.Router();
const { importBulkData } = require('../controllers/importController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/bulk', protect, importBulkData);

module.exports = router;

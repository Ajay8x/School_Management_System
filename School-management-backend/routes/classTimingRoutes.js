const express = require('express');
const router = express.Router();
const classTimingController = require('../controllers/classTimingController');

router.get('/', classTimingController.getClassTimings);
router.get('/:id', classTimingController.getClassTimingById);
router.post('/', classTimingController.createClassTiming);
router.put('/:id', classTimingController.updateClassTiming);
router.delete('/:id', classTimingController.deleteClassTiming);

module.exports = router;

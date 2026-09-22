const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// Blocks
router.get('/blocks', buildingController.getBlocks);
router.post('/blocks', buildingController.createBlock);
router.put('/blocks/:id', buildingController.updateBlock);
router.delete('/blocks/:id', buildingController.deleteBlock);

// Floors
router.get('/floors', buildingController.getFloors);
router.post('/floors', buildingController.createFloor);
router.put('/floors/:id', buildingController.updateFloor);
router.delete('/floors/:id', buildingController.deleteFloor);

// Rooms
router.get('/rooms', buildingController.getRooms);
router.post('/rooms', buildingController.createRoom);
router.put('/rooms/:id', buildingController.updateRoom);
router.delete('/rooms/:id', buildingController.deleteRoom);

module.exports = router;

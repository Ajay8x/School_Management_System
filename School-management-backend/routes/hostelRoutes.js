const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// Hostels
router.get('/', hostelController.getHostels);
router.post('/', hostelController.createHostel);
router.put('/:id', hostelController.updateHostel);
router.delete('/:id', hostelController.deleteHostel);

// Hostel Incharges
router.get('/incharges', hostelController.getIncharges);
router.post('/incharges', hostelController.createIncharge);
router.put('/incharges/:id', hostelController.updateIncharge);
router.delete('/incharges/:id', hostelController.deleteIncharge);

// Room Allocations
router.get('/allocations', hostelController.getAllocations);
router.post('/allocations', hostelController.createAllocation);
router.put('/allocations/:id', hostelController.updateAllocation);
router.delete('/allocations/:id', hostelController.deleteAllocation);

// Floors
router.get('/floors', hostelController.getFloors);
router.post('/floors', hostelController.createFloor);
router.delete('/floors/:id', hostelController.deleteFloor);

// Rooms
router.get('/rooms', hostelController.getRooms);
router.post('/rooms', hostelController.createRoom);
router.delete('/rooms/:id', hostelController.deleteRoom);

module.exports = router;

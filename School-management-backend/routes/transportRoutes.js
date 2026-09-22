const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const { protect } = require('../middlewares/authMiddleware');

// Apply auth protection to all transport routes
router.use(protect);

// Vehicles
router.get('/vehicles', transportController.getVehicles);
router.post('/vehicles', transportController.createVehicle);
router.put('/vehicles/:id', transportController.updateVehicle);
router.delete('/vehicles/:id', transportController.deleteVehicle);

// Stoppages
router.get('/stoppages', transportController.getStoppages);
router.post('/stoppages', transportController.createStoppage);
router.put('/stoppages/:id', transportController.updateStoppage);
router.delete('/stoppages/:id', transportController.deleteStoppage);

// Circles
router.get('/circles', transportController.getCircles);
router.post('/circles', transportController.createCircle);
router.put('/circles/:id', transportController.updateCircle);
router.delete('/circles/:id', transportController.deleteCircle);

// Transport Fees
router.get('/fees', transportController.getFees);
router.post('/fees', transportController.createFee);
router.put('/fees/:id', transportController.updateFee);
router.delete('/fees/:id', transportController.deleteFee);

// Transport Routes
router.get('/routes', transportController.getRoutes);
router.post('/routes', transportController.createRoute);
router.put('/routes/:id', transportController.updateRoute);
router.delete('/routes/:id', transportController.deleteRoute);

// Transport Report
router.get('/report', transportController.getTransportReport);

module.exports = router;

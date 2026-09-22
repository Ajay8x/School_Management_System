const Vehicle = require('../models/Vehicle');
const TransportStoppage = require('../models/TransportStoppage');
const TransportCircle = require('../models/TransportCircle');
const TransportFee = require('../models/TransportFee');
const TransportRoute = require('../models/TransportRoute');
const School = require('../models/School');
const { logActivity } = require('../utils/logActivity');

// Helper to get active school ID
const getActiveSchoolId = async (req) => {
  if (req.schoolId) return req.schoolId;
  if (req.user && req.user.schoolId) return req.user.schoolId;
  const defaultSchool = await School.findOne({ isDefault: true }) || await School.findOne();
  return defaultSchool ? defaultSchool._id : null;
};

// ==========================================
// 1. VEHICLE CONTROLLERS
// ==========================================

exports.getVehicles = async (req, res) => {
  try {
    const { search, type, status } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { registrationNumber: searchRegex },
        { modelNumber: searchRegex },
        { make: searchRegex },
        { ownerName: searchRegex },
        { ownerPhone: searchRegex }
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server Error fetching vehicles', error: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const schoolId = await getActiveSchoolId(req);
    const vehicleData = {
      ...req.body,
      schoolId
    };

    if (req.headers && req.headers['x-session-id']) {
      vehicleData.sessionId = req.headers['x-session-id'];
    }

    const vehicle = await Vehicle.create(vehicleData);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Added vehicle: "${vehicle.name}" (${vehicle.registrationNumber})`
      });
    }

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({ message: error.message || 'Failed to create vehicle' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated vehicle: "${updatedVehicle.name}"`
      });
    }

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({ message: error.message || 'Failed to update vehicle' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await vehicle.deleteOne();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Deleted vehicle: "${vehicle.name}"`
      });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Server error deleting vehicle' });
  }
};

// ==========================================
// 2. STOPPAGE CONTROLLERS
// ==========================================

exports.getStoppages = async (req, res) => {
  try {
    const { search } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const stoppages = await TransportStoppage.find(filter).sort({ name: 1 });
    res.json(stoppages);
  } catch (error) {
    console.error('Error fetching stoppages:', error);
    res.status(500).json({ message: 'Server Error fetching stoppages', error: error.message });
  }
};

exports.createStoppage = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Stoppage name is required' });
    }

    const schoolId = await getActiveSchoolId(req);
    const stoppage = await TransportStoppage.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created transport stoppage: "${stoppage.name}"`
      });
    }

    res.status(201).json(stoppage);
  } catch (error) {
    console.error('Error creating stoppage:', error);
    res.status(400).json({ message: error.message || 'Failed to create stoppage' });
  }
};

exports.updateStoppage = async (req, res) => {
  try {
    const stoppage = await TransportStoppage.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!stoppage) {
      return res.status(404).json({ message: 'Stoppage not found' });
    }

    res.json(stoppage);
  } catch (error) {
    console.error('Error updating stoppage:', error);
    res.status(400).json({ message: error.message || 'Failed to update stoppage' });
  }
};

exports.deleteStoppage = async (req, res) => {
  try {
    const stoppage = await TransportStoppage.findById(req.params.id);
    if (!stoppage) {
      return res.status(404).json({ message: 'Stoppage not found' });
    }

    await stoppage.deleteOne();
    res.json({ message: 'Stoppage deleted successfully' });
  } catch (error) {
    console.error('Error deleting stoppage:', error);
    res.status(500).json({ message: 'Server error deleting stoppage' });
  }
};

// ==========================================
// 3. CIRCLE CONTROLLERS
// ==========================================

exports.getCircles = async (req, res) => {
  try {
    const { search } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const circles = await TransportCircle.find(filter).sort({ name: 1 });
    res.json(circles);
  } catch (error) {
    console.error('Error fetching circles:', error);
    res.status(500).json({ message: 'Server Error fetching circles', error: error.message });
  }
};

exports.createCircle = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Circle name is required' });
    }

    const schoolId = await getActiveSchoolId(req);
    const circle = await TransportCircle.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created transport circle: "${circle.name}"`
      });
    }

    res.status(201).json(circle);
  } catch (error) {
    console.error('Error creating circle:', error);
    res.status(400).json({ message: error.message || 'Failed to create circle' });
  }
};

exports.updateCircle = async (req, res) => {
  try {
    const circle = await TransportCircle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    res.json(circle);
  } catch (error) {
    console.error('Error updating circle:', error);
    res.status(400).json({ message: error.message || 'Failed to update circle' });
  }
};

exports.deleteCircle = async (req, res) => {
  try {
    const circle = await TransportCircle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    await circle.deleteOne();
    res.json({ message: 'Circle deleted successfully' });
  } catch (error) {
    console.error('Error deleting circle:', error);
    res.status(500).json({ message: 'Server error deleting circle' });
  }
};

// ==========================================
// 4. TRANSPORT FEE CONTROLLERS
// ==========================================

exports.getFees = async (req, res) => {
  try {
    const { search } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const fees = await TransportFee.find(filter).sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    console.error('Error fetching transport fees:', error);
    res.status(500).json({ message: 'Server Error fetching transport fees', error: error.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const { name, description, stoppageFees } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Fee plan name is required' });
    }

    const schoolId = await getActiveSchoolId(req);
    const fee = await TransportFee.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      stoppageFees: stoppageFees || [],
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created transport fee plan: "${fee.name}"`
      });
    }

    res.status(201).json(fee);
  } catch (error) {
    console.error('Error creating fee plan:', error);
    res.status(400).json({ message: error.message || 'Failed to create fee plan' });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await TransportFee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!fee) {
      return res.status(404).json({ message: 'Fee plan not found' });
    }

    res.json(fee);
  } catch (error) {
    console.error('Error updating fee plan:', error);
    res.status(400).json({ message: error.message || 'Failed to update fee plan' });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const fee = await TransportFee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee plan not found' });
    }

    await fee.deleteOne();
    res.json({ message: 'Fee plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee plan:', error);
    res.status(500).json({ message: 'Server error deleting fee plan' });
  }
};

// ==========================================
// 5. TRANSPORT ROUTE CONTROLLERS
// ==========================================

exports.getRoutes = async (req, res) => {
  try {
    const { search, status } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { vehicleName: searchRegex },
        { vehicleNumber: searchRegex },
        { incharge: searchRegex },
        { circleName: searchRegex }
      ];
    }

    const routes = await TransportRoute.find(filter)
      .populate('vehicle', 'name registrationNumber type seatingCapacity')
      .populate('circle', 'name')
      .populate('feePlan', 'name')
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error('Error fetching transport routes:', error);
    res.status(500).json({ message: 'Server Error fetching transport routes', error: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const {
      name,
      routeType,
      vehicle,
      vehicleName,
      vehicleNumber,
      startTime,
      endTime,
      maxCapacity,
      incharge,
      inchargePhone,
      stoppages,
      circle,
      circleName,
      feePlan,
      description,
      status
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Route name is required' });
    }

    const schoolId = await getActiveSchoolId(req);

    // If vehicle ID provided, resolve vehicleName and vehicleNumber if not provided
    let vName = vehicleName;
    let vNum = vehicleNumber;
    let cap = maxCapacity;
    if (vehicle && (!vName || !vNum)) {
      const vObj = await Vehicle.findById(vehicle);
      if (vObj) {
        vName = vObj.name;
        vNum = vObj.registrationNumber;
        if (!cap) cap = vObj.seatingCapacity || vObj.maxSeatingAllowed;
      }
    }

    const routeData = {
      name: name.trim(),
      routeType: routeType || 'Round Trip',
      vehicle: vehicle || undefined,
      vehicleName: vName || '',
      vehicleNumber: vNum || '',
      startTime: startTime || '5:30 AM',
      endTime: endTime || '1:15 PM',
      maxCapacity: cap || 45,
      incharge: incharge ? incharge.trim() : '',
      inchargePhone: inchargePhone ? inchargePhone.trim() : '',
      stoppages: stoppages || [],
      circle: circle || undefined,
      circleName: circleName || '',
      feePlan: feePlan || undefined,
      description: description ? description.trim() : '',
      status: status || 'Active',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    };

    const route = await TransportRoute.create(routeData);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created transport route: "${route.name}"`
      });
    }

    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating transport route:', error);
    res.status(400).json({ message: error.message || 'Failed to create transport route' });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const updatedRoute = await TransportRoute.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: 'Transport route not found' });
    }

    res.json(updatedRoute);
  } catch (error) {
    console.error('Error updating transport route:', error);
    res.status(400).json({ message: error.message || 'Failed to update transport route' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Transport route not found' });
    }

    await route.deleteOne();
    res.json({ message: 'Transport route deleted successfully' });
  } catch (error) {
    console.error('Error deleting transport route:', error);
    res.status(500).json({ message: 'Server error deleting transport route' });
  }
};

// ==========================================
// 6. TRANSPORT REPORT / STATS CONTROLLER
// ==========================================

exports.getTransportReport = async (req, res) => {
  try {
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);
    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }

    const [totalVehicles, activeVehicles, totalRoutes, activeRoutes, totalStoppages, totalCircles, totalFees, routes] = await Promise.all([
      Vehicle.countDocuments(filter),
      Vehicle.countDocuments({ ...filter, status: 'Active' }),
      TransportRoute.countDocuments(filter),
      TransportRoute.countDocuments({ ...filter, status: 'Active' }),
      TransportStoppage.countDocuments(filter),
      TransportCircle.countDocuments(filter),
      TransportFee.countDocuments(filter),
      TransportRoute.find(filter).lean()
    ]);

    let totalCapacity = 0;
    let totalAssignedOccupancy = 0;
    routes.forEach(r => {
      totalCapacity += (r.maxCapacity || 0);
      totalAssignedOccupancy += (r.currentOccupancy || 0);
    });

    res.json({
      totalVehicles,
      activeVehicles,
      totalRoutes,
      activeRoutes,
      totalStoppages,
      totalCircles,
      totalFees,
      totalCapacity,
      totalAssignedOccupancy,
      occupancyRate: totalCapacity > 0 ? ((totalAssignedOccupancy / totalCapacity) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching transport report:', error);
    res.status(500).json({ message: 'Server error fetching report', error: error.message });
  }
};

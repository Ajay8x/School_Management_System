const Trip = require('../models/Trip');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    const { tripType, status, audience, search, fromDate, toDate } = req.query;
    const filter = {};

    if (req.schoolId) filter.schoolId = req.schoolId;
    if (tripType && tripType !== 'All') filter.tripType = tripType;
    if (status && status !== 'All') filter.status = status;
    if (audience && audience !== 'All') filter.audience = audience;

    if (fromDate || toDate) {
      filter.startDate = {};
      if (fromDate) filter.startDate.$gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.startDate.$lte = to;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { incharge: { $regex: search, $options: 'i' } },
        { tripType: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Trip.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error fetching trips' });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const item = await Trip.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Trip not found' });
    res.json(item);
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private (Admin / Super Admin)
exports.createTrip = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.schoolId) payload.schoolId = req.schoolId;
    if (req.user) payload.createdBy = req.user._id;

    // Audience parsing if sent as comma-separated or array
    if (typeof payload.audience === 'string') {
      payload.audience = payload.audience.split(',').map(s => s.trim()).filter(Boolean);
    }

    const item = await Trip.create(payload);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created Trip: ${item.title} (${item.tripType})`
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(400).json({ message: error.message || 'Invalid trip data' });
  }
};

// @desc    Update an existing trip
// @route   PUT /api/trips/:id
// @access  Private (Admin / Super Admin)
exports.updateTrip = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.audience === 'string') {
      payload.audience = payload.audience.split(',').map(s => s.trim()).filter(Boolean);
    }

    const item = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Trip not found' });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated Trip: ${item.title}`
      });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(400).json({ message: error.message || 'Update failed' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private (Admin / Super Admin)
exports.deleteTrip = async (req, res) => {
  try {
    const item = await Trip.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Trip not found' });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Deleted Trip: ${item.title}`
      });
    }

    res.json({ message: 'Trip deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add participant/registration to trip
// @route   POST /api/trips/:id/participants
// @access  Private
exports.addParticipant = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.maxParticipants > 0 && trip.participants.length >= trip.maxParticipants) {
      return res.status(400).json({ message: 'Trip participant limit has been reached' });
    }

    const participantData = {
      ...req.body,
      feeAmount: req.body.feeAmount !== undefined ? req.body.feeAmount : trip.fee
    };

    trip.participants.push(participantData);
    await trip.save();

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Registered ${participantData.name} for Trip: ${trip.title}`
      });
    }

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(400).json({ message: error.message || 'Failed to add participant' });
  }
};

// @desc    Update participant registration (payment status, consent, etc.)
// @route   PUT /api/trips/:id/participants/:participantId
// @access  Private
exports.updateParticipant = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const participant = trip.participants.id(req.params.participantId);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    Object.assign(participant, req.body);
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(400).json({ message: error.message || 'Failed to update participant' });
  }
};

// @desc    Remove participant from trip
// @route   DELETE /api/trips/:id/participants/:participantId
// @access  Private
exports.removeParticipant = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.participants.pull({ _id: req.params.participantId });
    await trip.save();

    res.json(trip);
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(400).json({ message: error.message || 'Failed to remove participant' });
  }
};

// @desc    Bulk Import Trips from Excel
// @route   POST /api/trips/import
// @access  Private
exports.importTrips = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No trip records provided' });
    }

    const prepared = items.map(item => ({
      tripType: item.tripType || 'Educational Trip',
      title: item.title || 'Untitled Trip',
      destination: item.destination || '',
      startDate: item.startDate ? new Date(item.startDate) : new Date(),
      endDate: item.endDate ? new Date(item.endDate) : new Date(),
      fee: Number(item.fee) || 0,
      audience: Array.isArray(item.audience) ? item.audience : (item.audience ? item.audience.split(',').map(s => s.trim()) : ['Batch Wise Student']),
      incharge: item.incharge || '',
      description: item.description || '',
      status: item.status || 'Upcoming',
      schoolId: req.schoolId,
      createdBy: req.user?._id
    }));

    const inserted = await Trip.insertMany(prepared);
    res.status(201).json({ message: `Successfully imported ${inserted.length} trips`, data: inserted });
  } catch (error) {
    console.error('Error importing trips:', error);
    res.status(400).json({ message: error.message || 'Failed to import trips' });
  }
};

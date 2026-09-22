const BuildingBlock = require('../models/BuildingBlock');
const BuildingFloor = require('../models/BuildingFloor');
const BuildingRoom = require('../models/BuildingRoom');
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
// 1. BUILDING BLOCKS CRUD
// ==========================================

exports.getBlocks = async (req, res) => {
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
        { alias: searchRegex },
        { description: searchRegex }
      ];
    }

    const blocks = await BuildingBlock.find(filter).sort({ name: 1 });
    res.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ message: 'Server error fetching blocks', error: error.message });
  }
};

exports.createBlock = async (req, res) => {
  try {
    const { name, alias, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Block name is required' });
    }

    const schoolId = await getActiveSchoolId(req);
    const block = await BuildingBlock.create({
      name: name.trim(),
      alias: alias ? alias.trim() : '',
      description: description ? description.trim() : '',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created building block: "${block.name}"`
      });
    }

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(400).json({ message: error.message || 'Failed to create block' });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const block = await BuildingBlock.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!block) return res.status(404).json({ message: 'Block not found' });
    res.json(block);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update block' });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const block = await BuildingBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    await Promise.all([
      BuildingFloor.deleteMany({ block: block._id }),
      BuildingRoom.deleteMany({ block: block._id }),
      block.deleteOne()
    ]);

    res.json({ message: 'Block and associated floors/rooms deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting block' });
  }
};

// ==========================================
// 2. BUILDING FLOORS CRUD
// ==========================================

exports.getFloors = async (req, res) => {
  try {
    const { search, blockId } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (blockId && blockId !== 'All') {
      filter.block = blockId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { alias: searchRegex },
        { blockName: searchRegex },
        { description: searchRegex }
      ];
    }

    const floors = await BuildingFloor.find(filter).populate('block', 'name alias').sort({ name: 1 });
    res.json(floors);
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({ message: 'Server error fetching floors', error: error.message });
  }
};

exports.createFloor = async (req, res) => {
  try {
    const { name, alias, block, description, floorNumber } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Floor name is required' });
    }
    if (!block) {
      return res.status(400).json({ message: 'Please select a block' });
    }

    const schoolId = await getActiveSchoolId(req);
    let bName = '';
    const bObj = await BuildingBlock.findById(block);
    if (bObj) bName = bObj.name;

    const floor = await BuildingFloor.create({
      name: name.trim(),
      alias: alias ? alias.trim() : '',
      block,
      blockName: bName,
      floorNumber: Number(floorNumber) || 1,
      description: description ? description.trim() : '',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    res.status(201).json(floor);
  } catch (error) {
    console.error('Error creating floor:', error);
    res.status(400).json({ message: error.message || 'Failed to create floor' });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const floor = await BuildingFloor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!floor) return res.status(404).json({ message: 'Floor not found' });
    res.json(floor);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update floor' });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    const floor = await BuildingFloor.findById(req.params.id);
    if (!floor) return res.status(404).json({ message: 'Floor not found' });

    await Promise.all([
      BuildingRoom.deleteMany({ floor: floor._id }),
      floor.deleteOne()
    ]);

    res.json({ message: 'Floor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting floor' });
  }
};

// ==========================================
// 3. BUILDING ROOMS CRUD
// ==========================================

exports.getRooms = async (req, res) => {
  try {
    const { search, blockId, floorId } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (blockId && blockId !== 'All') {
      filter.block = blockId;
    }
    if (floorId && floorId !== 'All') {
      filter.floor = floorId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { alias: searchRegex },
        { blockName: searchRegex },
        { floorName: searchRegex },
        { description: searchRegex }
      ];
    }

    const rooms = await BuildingRoom.find(filter)
      .populate('block', 'name alias')
      .populate('floor', 'name alias')
      .sort({ name: 1 });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error fetching rooms', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, alias, block, floor, type, capacity, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name or number is required' });
    }
    if (!block) {
      return res.status(400).json({ message: 'Please select a block' });
    }

    const schoolId = await getActiveSchoolId(req);
    let bName = '';
    const bObj = await BuildingBlock.findById(block);
    if (bObj) bName = bObj.name;

    let fName = '';
    if (floor) {
      const fObj = await BuildingFloor.findById(floor);
      if (fObj) fName = fObj.name;
    }

    const room = await BuildingRoom.create({
      name: name.trim(),
      alias: alias ? alias.trim() : '',
      block,
      blockName: bName,
      floor: floor || undefined,
      floorName: fName,
      type: type || 'Classroom',
      capacity: Number(capacity) || 40,
      description: description ? description.trim() : '',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(400).json({ message: error.message || 'Failed to create room' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await BuildingRoom.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update room' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await BuildingRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    await room.deleteOne();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
};

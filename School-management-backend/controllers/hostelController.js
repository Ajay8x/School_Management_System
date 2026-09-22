const Hostel = require('../models/Hostel');
const HostelIncharge = require('../models/HostelIncharge');
const HostelFloor = require('../models/HostelFloor');
const HostelRoom = require('../models/HostelRoom');
const HostelAllocation = require('../models/HostelAllocation');
const School = require('../models/School');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { logActivity } = require('../utils/logActivity');

// Helper to get active school ID
const getActiveSchoolId = async (req) => {
  if (req.schoolId) return req.schoolId;
  if (req.user && req.user.schoolId) return req.user.schoolId;
  const defaultSchool = await School.findOne({ isDefault: true }) || await School.findOne();
  return defaultSchool ? defaultSchool._id : null;
};

// ==========================================
// 1. HOSTEL CRUD
// ==========================================

exports.getHostels = async (req, res) => {
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
        { alias: searchRegex },
        { contactNumber: searchRegex },
        { contactEmail: searchRegex },
        { address: searchRegex },
        { description: searchRegex }
      ];
    }

    const hostels = await Hostel.find(filter).sort({ createdAt: -1 });

    // Populate counts for floor, room, incharge
    const hostelsWithCounts = await Promise.all(
      hostels.map(async (h) => {
        const [floorCount, roomCount, incharge] = await Promise.all([
          HostelFloor.countDocuments({ hostel: h._id }),
          HostelRoom.countDocuments({ hostel: h._id }),
          HostelIncharge.findOne({ hostel: h._id, status: 'Present' }).sort({ createdAt: -1 })
        ]);

        const rooms = await HostelRoom.find({ hostel: h._id });
        let totalCapacity = 0;
        let totalOccupancy = 0;
        rooms.forEach(r => {
          totalCapacity += (r.capacity || 0);
          totalOccupancy += (r.currentOccupancy || 0);
        });

        return {
          ...h.toObject(),
          floorCount,
          roomCount,
          totalCapacity,
          totalOccupancy,
          inchargeName: incharge ? incharge.employeeName : ''
        };
      })
    );

    res.json(hostelsWithCounts);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ message: 'Server Error fetching hostels', error: error.message });
  }
};

exports.createHostel = async (req, res) => {
  try {
    const { name, alias, contactNumber, contactEmail, address, description, type } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Hostel name is required' });
    }

    const schoolId = await getActiveSchoolId(req);
    const hostelData = {
      name: name.trim(),
      alias: alias ? alias.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      contactEmail: contactEmail ? contactEmail.trim() : '',
      address: address ? address.trim() : '',
      description: description ? description.trim() : '',
      type: type || 'Boys',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    };

    const hostel = await Hostel.create(hostelData);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Created hostel: "${hostel.name}"`
      });
    }

    res.status(201).json(hostel);
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(400).json({ message: error.message || 'Failed to create hostel' });
  }
};

exports.updateHostel = async (req, res) => {
  try {
    const updatedHostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedHostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Updated hostel: "${updatedHostel.name}"`
      });
    }

    res.json(updatedHostel);
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(400).json({ message: error.message || 'Failed to update hostel' });
  }
};

exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Delete associated floors, rooms, incharges, allocations
    await Promise.all([
      HostelFloor.deleteMany({ hostel: hostel._id }),
      HostelRoom.deleteMany({ hostel: hostel._id }),
      HostelIncharge.deleteMany({ hostel: hostel._id }),
      HostelAllocation.deleteMany({ hostel: hostel._id }),
      hostel.deleteOne()
    ]);

    if (req.user) {
      await logActivity({
        req,
        user: req.user,
        activity: `Deleted hostel: "${hostel.name}"`
      });
    }

    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ message: 'Server error deleting hostel' });
  }
};

// ==========================================
// 2. HOSTEL INCHARGE CRUD
// ==========================================

exports.getIncharges = async (req, res) => {
  try {
    const { search, hostelId } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (hostelId && hostelId !== 'All') {
      filter.hostel = hostelId;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { hostelName: searchRegex },
        { employeeName: searchRegex },
        { employeePhone: searchRegex },
        { remarks: searchRegex }
      ];
    }

    const incharges = await HostelIncharge.find(filter)
      .populate('hostel', 'name alias')
      .populate('employee', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(incharges);
  } catch (error) {
    console.error('Error fetching hostel incharges:', error);
    res.status(500).json({ message: 'Server error fetching incharges', error: error.message });
  }
};

exports.createIncharge = async (req, res) => {
  try {
    const { hostel, employee, employeeName, employeePhone, startDate, endDate, remarks, status } = req.body;
    if (!hostel) {
      return res.status(400).json({ message: 'Please select a hostel' });
    }
    if (!employeeName && !employee) {
      return res.status(400).json({ message: 'Please select or provide an employee name' });
    }

    const schoolId = await getActiveSchoolId(req);
    let hName = '';
    const hObj = await Hostel.findById(hostel);
    if (hObj) hName = hObj.name;

    let eName = employeeName;
    let ePhone = employeePhone;
    if (employee && !eName) {
      const tObj = await Teacher.findById(employee);
      if (tObj) {
        eName = tObj.name;
        ePhone = tObj.phone || '';
      }
    }

    const incharge = await HostelIncharge.create({
      hostel,
      hostelName: hName,
      employee: employee || undefined,
      employeeName: eName || 'Incharge Staff',
      employeePhone: ePhone || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      remarks: remarks ? remarks.trim() : '',
      status: status || 'Present',
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    res.status(201).json(incharge);
  } catch (error) {
    console.error('Error creating incharge:', error);
    res.status(400).json({ message: error.message || 'Failed to assign hostel incharge' });
  }
};

exports.updateIncharge = async (req, res) => {
  try {
    const updated = await HostelIncharge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Incharge record not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating incharge:', error);
    res.status(400).json({ message: error.message || 'Failed to update incharge' });
  }
};

exports.deleteIncharge = async (req, res) => {
  try {
    const incharge = await HostelIncharge.findById(req.params.id);
    if (!incharge) {
      return res.status(404).json({ message: 'Incharge record not found' });
    }
    await incharge.deleteOne();
    res.json({ message: 'Incharge record deleted successfully' });
  } catch (error) {
    console.error('Error deleting incharge:', error);
    res.status(500).json({ message: 'Server error deleting incharge' });
  }
};

// ==========================================
// 3. HOSTEL ALLOCATION CRUD
// ==========================================

exports.getAllocations = async (req, res) => {
  try {
    const { search, hostelId, roomId, status } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);

    let filter = {};
    if (activeSchoolId) {
      filter.schoolId = activeSchoolId;
    }
    if (hostelId && hostelId !== 'All') {
      filter.hostel = hostelId;
    }
    if (roomId && roomId !== 'All') {
      filter.room = roomId;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { studentName: searchRegex },
        { studentRoll: searchRegex },
        { studentClass: searchRegex },
        { roomName: searchRegex },
        { hostelName: searchRegex },
        { remarks: searchRegex }
      ];
    }

    const allocations = await HostelAllocation.find(filter)
      .populate('room', 'roomNumber type capacity currentOccupancy')
      .populate('student', 'name rollNumber className section')
      .populate('hostel', 'name alias')
      .sort({ createdAt: -1 });

    res.json(allocations);
  } catch (error) {
    console.error('Error fetching room allocations:', error);
    res.status(500).json({ message: 'Server error fetching allocations', error: error.message });
  }
};

exports.createAllocation = async (req, res) => {
  try {
    const { room, student, startDate, endDate, remarks, status, feeAmount } = req.body;
    if (!room) {
      return res.status(400).json({ message: 'Please select a room' });
    }
    if (!student) {
      return res.status(400).json({ message: 'Please select a student' });
    }

    const schoolId = await getActiveSchoolId(req);

    // Resolve room & hostel details
    const roomObj = await HostelRoom.findById(room);
    if (!roomObj) {
      return res.status(404).json({ message: 'Selected room not found' });
    }

    // Resolve student details
    const studentObj = await Student.findById(student);
    let sName = studentObj ? `${studentObj.firstName || ''} ${studentObj.lastName || ''}`.trim() || studentObj.name : 'Student';
    let sRoll = studentObj ? studentObj.rollNumber || studentObj.admissionNumber || '' : '';
    let sClass = studentObj ? studentObj.className || '' : '';

    const allocation = await HostelAllocation.create({
      room,
      roomName: roomObj.roomNumber || 'Room',
      hostel: roomObj.hostel,
      hostelName: roomObj.hostelName || '',
      student,
      studentName: sName,
      studentRoll: sRoll,
      studentClass: sClass,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      remarks: remarks ? remarks.trim() : '',
      status: status || 'Active',
      feeAmount: Number(feeAmount) || roomObj.costPerBed || 0,
      schoolId,
      sessionId: req.headers && req.headers['x-session-id'] ? req.headers['x-session-id'] : undefined
    });

    // Update room occupancy
    const activeCount = await HostelAllocation.countDocuments({ room: roomObj._id, status: { $in: ['Active', 'Allocated'] } });
    roomObj.currentOccupancy = activeCount;
    if (activeCount >= roomObj.capacity) {
      roomObj.status = 'Full';
    }
    await roomObj.save();

    res.status(201).json(allocation);
  } catch (error) {
    console.error('Error creating room allocation:', error);
    res.status(400).json({ message: error.message || 'Failed to allocate room' });
  }
};

exports.updateAllocation = async (req, res) => {
  try {
    const updated = await HostelAllocation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Allocation record not found' });
    }

    // Recalculate room occupancy
    if (updated.room) {
      const activeCount = await HostelAllocation.countDocuments({ room: updated.room, status: { $in: ['Active', 'Allocated'] } });
      const rObj = await HostelRoom.findById(updated.room);
      if (rObj) {
        rObj.currentOccupancy = activeCount;
        rObj.status = activeCount >= rObj.capacity ? 'Full' : 'Available';
        await rObj.save();
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(400).json({ message: error.message || 'Failed to update allocation' });
  }
};

exports.deleteAllocation = async (req, res) => {
  try {
    const alloc = await HostelAllocation.findById(req.params.id);
    if (!alloc) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    const roomId = alloc.room;
    await alloc.deleteOne();

    if (roomId) {
      const activeCount = await HostelAllocation.countDocuments({ room: roomId, status: { $in: ['Active', 'Allocated'] } });
      const rObj = await HostelRoom.findById(roomId);
      if (rObj) {
        rObj.currentOccupancy = activeCount;
        rObj.status = activeCount >= rObj.capacity ? 'Full' : 'Available';
        await rObj.save();
      }
    }

    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({ message: 'Server error deleting allocation' });
  }
};

// ==========================================
// 4. FLOORS & ROOMS CRUD
// ==========================================

exports.getFloors = async (req, res) => {
  try {
    const { hostelId } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);
    let filter = {};
    if (activeSchoolId) filter.schoolId = activeSchoolId;
    if (hostelId) filter.hostel = hostelId;

    const floors = await HostelFloor.find(filter).sort({ floorNumber: 1 });
    res.json(floors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching floors', error: error.message });
  }
};

exports.createFloor = async (req, res) => {
  try {
    const schoolId = await getActiveSchoolId(req);
    const hObj = await Hostel.findById(req.body.hostel);
    const floor = await HostelFloor.create({
      ...req.body,
      hostelName: hObj ? hObj.name : '',
      schoolId
    });
    res.status(201).json(floor);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating floor' });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    await HostelFloor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Floor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting floor' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { hostelId, floorId } = req.query;
    const activeSchoolId = req.schoolId || (req.user && req.user.schoolId);
    let filter = {};
    if (activeSchoolId) filter.schoolId = activeSchoolId;
    if (hostelId) filter.hostel = hostelId;
    if (floorId) filter.floor = floorId;

    const rooms = await HostelRoom.find(filter).populate('hostel', 'name').sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const schoolId = await getActiveSchoolId(req);
    const hObj = await Hostel.findById(req.body.hostel);
    let fName = '';
    if (req.body.floor) {
      const fObj = await HostelFloor.findById(req.body.floor);
      if (fObj) fName = fObj.name;
    }

    const room = await HostelRoom.create({
      ...req.body,
      hostelName: hObj ? hObj.name : '',
      floorName: fName,
      schoolId
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating room' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await HostelRoom.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room' });
  }
};

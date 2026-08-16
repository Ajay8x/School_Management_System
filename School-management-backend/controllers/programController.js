const mongoose = require('mongoose');
const Program = require('../models/Program');
const Department = require('../models/Department');
const Teacher = require('../models/Teacher');
const School = require('../models/School');

// Helper to check valid Mongoose ObjectId
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined' && id !== '';

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
exports.getPrograms = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    const programs = await Program.find(filter)
      .populate('department', 'name code')
      .populate('incharge', 'name employeeId subject email contact')
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Private
exports.getProgram = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid program ID' });
    }
    const program = await Program.findById(req.params.id)
      .populate('department', 'name code')
      .populate('incharge', 'name employeeId subject email contact');
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create program
// @route   POST /api/programs
// @access  Private (Admin)
exports.createProgram = async (req, res) => {
  try {
    const programData = { ...req.body };
    
    // Attach school if valid
    if (req.schoolId && isValidId(req.schoolId)) {
      programData.school = req.schoolId;
    } else if (req.user && req.user.school && isValidId(req.user.school)) {
      programData.school = req.user.school;
    } else {
      delete programData.school;
    }

    // Sanitize department
    if (programData.department && isValidId(programData.department)) {
      // keep
    } else {
      delete programData.department;
    }

    // Sanitize incharge
    if (programData.incharge && isValidId(programData.incharge)) {
      // keep
    } else {
      delete programData.incharge;
    }

    // Ensure enableRegistration boolean
    if (typeof programData.enableRegistration !== 'boolean') {
      programData.enableRegistration = programData.enableRegistration !== 'false' && programData.enableRegistration !== false;
    }

    const program = await Program.create(programData);
    const populated = await Program.findById(program._id)
      .populate('department', 'name code')
      .populate('incharge', 'name employeeId subject email contact');
      
    return res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating program:', error);
    return res.status(400).json({ message: error.message || 'Failed to create program' });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin)
exports.updateProgram = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid program ID' });
    }

    const updateData = { ...req.body };

    // Sanitize ObjectId fields for update
    if (!isValidId(updateData.department)) {
      updateData.department = undefined;
    }
    if (!isValidId(updateData.incharge)) {
      updateData.incharge = undefined;
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        returnDocument: 'after',
        runValidators: true
      }
    )
      .populate('department', 'name code')
      .populate('incharge', 'name employeeId subject email contact');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    return res.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    return res.status(400).json({ message: error.message || 'Failed to update program' });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin)
exports.deleteProgram = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid program ID' });
    }
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    await program.deleteOne();
    return res.json({ message: 'Program removed successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

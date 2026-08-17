const mongoose = require('mongoose');
const Division = require('../models/Division');
const { logActivity } = require('../utils/logActivity');

const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined' && id !== '';

// @desc    Get all academic divisions (auto-seed if empty)
// @route   GET /api/divisions
// @access  Private
exports.getDivisions = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    let divisions = await Division.find(filter).sort({ sortOrder: 1, createdAt: 1 });

    // Seed default initial divisions matching screenshot exactly if empty
    if (divisions.length === 0) {
      try {
        const seedData = [
          {
            name: 'Pre Primary',
            code: 'PP',
            shortCode: 'PP',
            program: 'Senior Secondary',
            programSub: '-',
            incharge: '-',
            sortOrder: 1,
            createdAt: new Date('2025-02-07T23:32:00')
          },
          {
            name: 'Primary',
            code: 'P',
            shortCode: 'P',
            program: 'Senior Secondary',
            programSub: '-',
            incharge: '-',
            sortOrder: 2,
            createdAt: new Date('2025-02-10T14:11:00')
          },
          {
            name: 'Middle',
            code: 'M',
            shortCode: 'M',
            program: 'Senior Secondary',
            programSub: '-',
            incharge: '-',
            sortOrder: 3,
            createdAt: new Date('2025-02-10T14:11:00')
          },
          {
            name: 'Higher Secondary',
            code: 'HS',
            shortCode: 'HS',
            program: 'Senior Secondary',
            programSub: '-',
            incharge: '-',
            sortOrder: 4,
            createdAt: new Date('2025-02-10T14:12:00')
          },
          {
            name: 'Senior Secondary',
            code: 'SS',
            shortCode: 'SS',
            program: 'Senior Secondary',
            programSub: '-',
            incharge: '-',
            sortOrder: 5,
            createdAt: new Date('2025-02-10T14:13:00')
          },
          {
            name: 'LKG TO UKG',
            code: '50',
            shortCode: 'pp',
            program: 'Shivam',
            programSub: 'Teaching Staff',
            incharge: '-',
            sortOrder: 6,
            createdAt: new Date('2025-11-03T13:17:00')
          }
        ];

        if (req.schoolId && isValidId(req.schoolId)) {
          seedData.forEach(item => item.school = req.schoolId);
        }

        divisions = await Division.insertMany(seedData);
      } catch (seedErr) {
        console.error('Error seeding initial divisions:', seedErr);
      }
    }

    res.json(divisions);
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single division
// @route   GET /api/divisions/:id
// @access  Private
exports.getDivision = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid division ID' });
    }
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    res.json(division);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create academic division
// @route   POST /api/divisions
// @access  Private (Admin)
exports.createDivision = async (req, res) => {
  try {
    const divisionData = { ...req.body };

    if (req.schoolId && isValidId(req.schoolId)) {
      divisionData.school = req.schoolId;
    } else if (req.user && req.user.school && isValidId(req.user.school)) {
      divisionData.school = req.user.school;
    } else {
      delete divisionData.school;
    }

    const division = await Division.create(divisionData);
    await logActivity({ req, user: req.user, activity: `Created academic division: ${division.name}` });

    return res.status(201).json(division);
  } catch (error) {
    console.error('Error creating division:', error);
    return res.status(400).json({ message: error.message || 'Failed to create division' });
  }
};

// @desc    Update academic division
// @route   PUT /api/divisions/:id
// @access  Private (Admin)
exports.updateDivision = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid division ID' });
    }

    const division = await Division.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    await logActivity({ req, user: req.user, activity: `Updated academic division: ${division.name}` });

    return res.json(division);
  } catch (error) {
    console.error('Error updating division:', error);
    return res.status(400).json({ message: error.message || 'Failed to update division' });
  }
};

// @desc    Delete academic division
// @route   DELETE /api/divisions/:id
// @access  Private (Admin)
exports.deleteDivision = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid division ID' });
    }
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    await Division.findByIdAndDelete(req.params.id);

    await logActivity({ req, user: req.user, activity: `Deleted academic division: ${division.name}` });

    return res.json({ message: 'Academic division deleted successfully' });
  } catch (error) {
    console.error('Error deleting division:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Duplicate academic division
// @route   POST /api/divisions/:id/duplicate
// @access  Private (Admin)
exports.duplicateDivision = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid division ID' });
    }
    const original = await Division.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ message: 'Division not found' });
    }

    const duplicateData = {
      name: `${original.name} (Copy)`,
      code: original.code ? `${original.code}-COPY` : '',
      shortCode: original.shortCode ? `${original.shortCode}-COPY` : '',
      program: original.program || 'Senior Secondary',
      programSub: original.programSub || '-',
      incharge: original.incharge || '-',
      description: original.description || '',
      school: original.school
    };

    const newDivision = await Division.create(duplicateData);
    await logActivity({ req, user: req.user, activity: `Duplicated academic division: ${original.name}` });

    return res.status(201).json(newDivision);
  } catch (error) {
    console.error('Error duplicating division:', error);
    return res.status(500).json({ message: 'Failed to duplicate division' });
  }
};

// @desc    Assign Incharge to division
// @route   PATCH /api/divisions/:id/incharge
// @access  Private (Admin)
exports.assignIncharge = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid division ID' });
    }
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    division.incharge = req.body.incharge || '-';
    await division.save();

    await logActivity({ req, user: req.user, activity: `Assigned incharge ${division.incharge} to division: ${division.name}` });

    return res.json(division);
  } catch (error) {
    console.error('Error assigning incharge:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

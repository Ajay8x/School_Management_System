const mongoose = require('mongoose');
const Period = require('../models/Period');
const { logActivity } = require('../utils/logActivity');

const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined' && id !== '';

// @desc    Get all academic periods
// @route   GET /api/periods
// @access  Private
exports.getPeriods = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    let periods = await Period.find(filter).sort({ createdAt: -1 });

    // Seed default initial period if empty matching screenshot
    if (periods.length === 0) {
      try {
        const seedData = {
          name: 'Session 2025-2026',
          registration: true,
          session: '2025-2026',
          code: '2526',
          startDate: new Date('2025-02-06'),
          endDate: new Date('2026-03-31'),
          isDefault: true,
          description: 'Default Academic Period 2025-2026'
        };
        if (req.schoolId && isValidId(req.schoolId)) {
          seedData.school = req.schoolId;
        }
        const createdSeed = await Period.create(seedData);
        periods = [createdSeed];
      } catch (seedErr) {
        console.error('Error seeding initial period:', seedErr);
      }
    }

    res.json(periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single academic period
// @route   GET /api/periods/:id
// @access  Private
exports.getPeriod = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json(period);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create academic period
// @route   POST /api/periods
// @access  Private (Admin)
exports.createPeriod = async (req, res) => {
  try {
    const periodData = { ...req.body };

    if (req.schoolId && isValidId(req.schoolId)) {
      periodData.school = req.schoolId;
    } else if (req.user && req.user.school && isValidId(req.user.school)) {
      periodData.school = req.user.school;
    } else {
      delete periodData.school;
    }

    // If marked default, unset default on existing periods
    if (periodData.isDefault) {
      const schoolFilter = periodData.school ? { school: periodData.school } : {};
      await Period.updateMany(schoolFilter, { isDefault: false });
    }

    const period = await Period.create(periodData);
    await logActivity({ req, user: req.user, activity: `Created academic period: ${period.name}` });

    return res.status(201).json(period);
  } catch (error) {
    console.error('Error creating period:', error);
    return res.status(400).json({ message: error.message || 'Failed to create academic period' });
  }
};

// @desc    Update academic period
// @route   PUT /api/periods/:id
// @access  Private (Admin)
exports.updatePeriod = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }

    const updateData = { ...req.body };

    if (updateData.isDefault) {
      const existing = await Period.findById(req.params.id);
      const schoolFilter = existing && existing.school ? { school: existing.school } : {};
      await Period.updateMany(schoolFilter, { isDefault: false });
    }

    const period = await Period.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    await logActivity({ req, user: req.user, activity: `Updated academic period: ${period.name}` });

    return res.json(period);
  } catch (error) {
    console.error('Error updating period:', error);
    return res.status(400).json({ message: error.message || 'Failed to update academic period' });
  }
};

// @desc    Delete academic period
// @route   DELETE /api/periods/:id
// @access  Private (Admin)
exports.deletePeriod = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    await Period.findByIdAndDelete(req.params.id);

    await logActivity({ req, user: req.user, activity: `Deleted academic period: ${period.name}` });

    return res.json({ message: 'Academic period deleted successfully' });
  } catch (error) {
    console.error('Error deleting period:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle default period
// @route   PATCH /api/periods/:id/toggle-default
// @access  Private (Admin)
exports.toggleDefault = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    const schoolFilter = period.school ? { school: period.school } : {};
    await Period.updateMany(schoolFilter, { isDefault: false });

    period.isDefault = true;
    await period.save();

    await logActivity({ req, user: req.user, activity: `Set academic period as default: ${period.name}` });

    return res.json(period);
  } catch (error) {
    console.error('Error toggling default period:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Duplicate academic period
// @route   POST /api/periods/:id/duplicate
// @access  Private (Admin)
exports.duplicatePeriod = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const original = await Period.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ message: 'Period not found' });
    }

    const duplicateData = {
      name: `${original.name} (Copy)`,
      code: original.code ? `${original.code}-COPY` : '',
      session: original.session || '',
      startDate: original.startDate,
      endDate: original.endDate,
      registration: original.registration,
      isDefault: false,
      isArchived: false,
      isExamLocked: original.isExamLocked || false,
      description: original.description || '',
      school: original.school
    };

    const newPeriod = await Period.create(duplicateData);
    await logActivity({ req, user: req.user, activity: `Duplicated academic period: ${original.name}` });

    return res.status(201).json(newPeriod);
  } catch (error) {
    console.error('Error duplicating period:', error);
    return res.status(500).json({ message: 'Failed to duplicate period' });
  }
};

// @desc    Toggle archive period status
// @route   PATCH /api/periods/:id/toggle-archive
// @access  Private (Admin)
exports.toggleArchive = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    period.isArchived = !period.isArchived;
    period.status = period.isArchived ? 'Inactive' : 'Active';
    await period.save();

    await logActivity({ req, user: req.user, activity: `${period.isArchived ? 'Archived' : 'Unarchived'} period: ${period.name}` });

    return res.json(period);
  } catch (error) {
    console.error('Error toggling archive:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle lock exam status
// @route   PATCH /api/periods/:id/toggle-lock-exam
// @access  Private (Admin)
exports.toggleLockExam = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid period ID' });
    }
    const period = await Period.findById(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    period.isExamLocked = !period.isExamLocked;
    await period.save();

    await logActivity({ req, user: req.user, activity: `${period.isExamLocked ? 'Locked' : 'Unlocked'} exam for period: ${period.name}` });

    return res.json(period);
  } catch (error) {
    console.error('Error toggling exam lock:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

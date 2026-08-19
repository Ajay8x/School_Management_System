const StudentConfig = require('../models/StudentConfig');
const StudentConfigOption = require('../models/StudentConfigOption');

// Helper to seed defaults for options matching screenshots
const seedDefaultOptions = async (schoolId, type) => {
  const count = await StudentConfigOption.countDocuments({
    ...(schoolId ? { schoolId } : {}),
    type
  });

  if (count === 0) {
    if (type === 'enrollment-type') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'enrollment-type', name: 'Regular', color: '#000000', description: 'Regular enrolled student' },
        { schoolId, type: 'enrollment-type', name: 'Private', color: '#ec4899', description: 'Private enrolled student' }
      ]);
    } else if (type === 'enrollment-status') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'enrollment-status', name: 'Active', color: '#22c55e', description: 'Currently active student' },
        { schoolId, type: 'enrollment-status', name: 'Promoted', color: '#3b82f6', description: 'Promoted to next grade' },
        { schoolId, type: 'enrollment-status', name: 'Withdrawn', color: '#ef4444', description: 'Withdrawn from school' }
      ]);
    } else if (type === 'leave-category') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'leave-category', name: 'Health Issue', color: '#22c55e', description: '' },
        { schoolId, type: 'leave-category', name: 'Family Function', color: '#6366f1', description: '' },
        { schoolId, type: 'leave-category', name: 'Going Outstation', color: '#eab308', description: '' }
      ]);
    } else if (type === 'transfer-reason') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'transfer-reason', name: 'Move to another city', color: '#a855f7', description: '' },
        { schoolId, type: 'transfer-reason', name: 'Move to another school', color: '#a855f7', description: '' },
        { schoolId, type: 'transfer-reason', name: 'On Parent Request', color: '#3b82f6', description: '' }
      ]);
    } else if (type === 'registration-stage') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'registration-stage', name: 'Applied', color: '#f59e0b', description: 'Initial registration received' },
        { schoolId, type: 'registration-stage', name: 'Verified', color: '#3b82f6', description: 'Documents verified' },
        { schoolId, type: 'registration-stage', name: 'Admitted', color: '#10b981', description: 'Final admission confirmed' }
      ]);
    } else if (type === 'document-type') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'document-type', name: 'Aadhaar Card', color: '#3b82f6', hasNumber: true, isRequired: true, description: 'National Identification' },
        { schoolId, type: 'document-type', name: 'Birth Certificate', color: '#10b981', isRequired: true, description: 'Proof of Age' },
        { schoolId, type: 'document-type', name: 'Transfer Certificate', color: '#f59e0b', hasNumber: true, isRequired: false, description: 'Previous School TC' }
      ]);
    } else if (type === 'attendance-type') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'attendance-type', name: 'Present', code: 'P', subType: 'Daily', color: '#22c55e', description: 'Student is present' },
        { schoolId, type: 'attendance-type', name: 'Absent', code: 'A', subType: 'Daily', color: '#ef4444', description: 'Student is absent' },
        { schoolId, type: 'attendance-type', name: 'Half Day', code: 'HD', subType: 'Daily', color: '#f59e0b', description: 'Attended half day' },
        { schoolId, type: 'attendance-type', name: 'Late', code: 'L', subType: 'Daily', color: '#eab308', description: 'Arrived late' }
      ]);
    } else if (type === 'house') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'house', name: 'Red House', code: 'RH', color: '#ef4444', description: 'Red Sports & Cultural House' },
        { schoolId, type: 'house', name: 'Blue House', code: 'BH', color: '#3b82f6', description: 'Blue Sports & Cultural House' },
        { schoolId, type: 'house', name: 'Green House', code: 'GH', color: '#22c55e', description: 'Green Sports & Cultural House' },
        { schoolId, type: 'house', name: 'Yellow House', code: 'YH', color: '#eab308', description: 'Yellow Sports & Cultural House' }
      ]);
    } else if (type === 'student-group') {
      await StudentConfigOption.insertMany([
        { schoolId, type: 'student-group', name: 'Red House', color: '#ec4899', description: '' },
        { schoolId, type: 'student-group', name: 'Blue House', color: '#06b6d4', description: '' },
        { schoolId, type: 'student-group', name: 'Green House', color: '#10b981', description: '' },
        { schoolId, type: 'student-group', name: 'Yellow House', color: '#f43f5e', description: '' }
      ]);
    }
  }
};

// @desc Get Student Config
// @route GET /api/students/config
exports.getConfig = async (req, res) => {
  try {
    const schoolId = req.schoolId || req.user?.schoolId;
    let config = await StudentConfig.findOne(schoolId ? { schoolId } : {});
    if (!config) {
      config = await StudentConfig.create({ ...(schoolId && { schoolId }) });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching student config:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Update Student Config
// @route PUT /api/students/config
exports.updateConfig = async (req, res) => {
  try {
    const schoolId = req.schoolId || req.user?.schoolId;
    let config = await StudentConfig.findOneAndUpdate(
      schoolId ? { schoolId } : {},
      { ...req.body, ...(schoolId && { schoolId }) },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (error) {
    console.error('Error updating student config:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Get Options by Type
// @route GET /api/students/config/options/:type
exports.getOptions = async (req, res) => {
  try {
    const { type } = req.params;
    const schoolId = req.schoolId || req.user?.schoolId;
    await seedDefaultOptions(schoolId, type);

    const filter = schoolId
      ? { schoolId, type }
      : { type };

    const options = await StudentConfigOption.find(filter).sort({ createdAt: -1 });
    res.json(options);
  } catch (error) {
    console.error(`Error fetching student options (${req.params.type}):`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Create Option
// @route POST /api/students/config/options/:type
exports.createOption = async (req, res) => {
  try {
    const { type } = req.params;
    const { name, color, description, code, subType, hasNumber, hasExpiryDate, isRequired } = req.body;
    const schoolId = req.schoolId || req.user?.schoolId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newOption = await StudentConfigOption.create({
      type,
      name: name.trim(),
      color: color || '#3b82f6',
      description: description || '',
      code: code || '',
      subType: subType || '',
      hasNumber: !!hasNumber,
      hasExpiryDate: !!hasExpiryDate,
      isRequired: !!isRequired,
      ...(schoolId && { schoolId })
    });

    res.status(201).json(newOption);
  } catch (error) {
    console.error('Error creating student config option:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Update Option
// @route PUT /api/students/config/options/:type/:id
exports.updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description, code, subType, hasNumber, hasExpiryDate, isRequired } = req.body;

    const updatedOption = await StudentConfigOption.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(description !== undefined && { description }),
        ...(code !== undefined && { code }),
        ...(subType !== undefined && { subType }),
        ...(hasNumber !== undefined && { hasNumber: !!hasNumber }),
        ...(hasExpiryDate !== undefined && { hasExpiryDate: !!hasExpiryDate }),
        ...(isRequired !== undefined && { isRequired: !!isRequired })
      },
      { new: true }
    );

    if (!updatedOption) {
      return res.status(404).json({ message: 'Option item not found' });
    }

    res.json(updatedOption);
  } catch (error) {
    console.error('Error updating student config option:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc Delete Option
// @route DELETE /api/students/config/options/:type/:id
exports.deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOption = await StudentConfigOption.findByIdAndDelete(id);

    if (!deletedOption) {
      return res.status(404).json({ message: 'Option item not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting student config option:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

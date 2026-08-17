const Batch = require('../models/Batch');
const BatchIncharge = require('../models/BatchIncharge');
const { logActivity } = require('../utils/logActivity');

// Initial seed data matching user's screenshots
const seedDefaultBatches = async (schoolId) => {
  const sampleSubjects = [
    { name: 'COMPUTER', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'English', code: 'ENG', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'ARTS and CRAFTS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'HINDI', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'RHYMES and STORIES', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'MUSIC', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'EVS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'Conclusion', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'Art', code: '', isElective: false, hasGrading: true, hasNoExam: false }
  ];

  const defaultBatches = [
    {
      school: schoolId,
      name: 'Section B',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 0,
      rollPrefix: '',
      paymentAccount: '',
      description: 'Nursery Section B',
      incharge: '-',
      inchargeDates: '',
      subjects: sampleSubjects,
      sortOrder: 1,
      createdAt: new Date('2025-02-10T14:28:00')
    },
    {
      school: schoolId,
      name: 'Section A',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 22,
      rollPrefix: '',
      paymentAccount: '',
      description: 'Nursery Section A',
      incharge: '-',
      inchargeDates: '',
      subjects: sampleSubjects,
      sortOrder: 2,
      createdAt: new Date('2025-02-08T00:21:00')
    },
    {
      school: schoolId,
      name: 'Section C',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 0,
      rollPrefix: '',
      paymentAccount: '',
      description: 'Nursery Section C',
      incharge: '-',
      inchargeDates: '',
      subjects: sampleSubjects,
      sortOrder: 3,
      createdAt: new Date('2025-02-10T14:28:00')
    }
  ];

  await Batch.insertMany(defaultBatches);

  // Seed default batch incharges
  const defaultIncharges = [
    {
      school: schoolId,
      batch: 'Section B',
      employee: 'Anamika Tiwari',
      employeeCode: 'ESM001',
      period: 'November 29, 2025 - Present'
    },
    {
      school: schoolId,
      batch: 'Section A',
      employee: 'Kalpana Comar',
      employeeCode: 'ESM100',
      period: 'February 1, 2025 - March 31, 2026'
    }
  ];
  await BatchIncharge.insertMany(defaultIncharges);
};

// @desc    Get all batches for current school
// @route   GET /api/batches
// @access  Private
exports.getBatches = async (req, res) => {
  try {
    let batches = await Batch.find({ school: req.schoolId }).sort({ sortOrder: 1, createdAt: -1 });

    if (batches.length === 0) {
      await seedDefaultBatches(req.schoolId);
      batches = await Batch.find({ school: req.schoolId }).sort({ sortOrder: 1, createdAt: -1 });
    }

    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Server error fetching batches' });
  }
};

// @desc    Get single batch by ID
// @route   GET /api/batches/:id
// @access  Private
exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.id, school: req.schoolId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private (Admin)
exports.createBatch = async (req, res) => {
  try {
    const { name, course, code, shortCode, maxStrength, rollPrefix, paymentAccount, description } = req.body;

    if (!name || !course) {
      return res.status(400).json({ message: 'Batch Name and Course are required' });
    }

    const defaultSubjects = [
      { name: 'COMPUTER', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'English', code: 'ENG', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'ARTS and CRAFTS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'HINDI', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'RHYMES and STORIES', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'MUSIC', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'EVS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'Conclusion', code: '', isElective: false, hasGrading: false, hasNoExam: false },
      { name: 'Art', code: '', isElective: false, hasGrading: true, hasNoExam: false }
    ];

    const batch = new Batch({
      school: req.schoolId,
      name,
      course,
      code: code || '',
      shortCode: shortCode || '',
      maxStrength: maxStrength || 45,
      currentStrength: 0,
      rollPrefix: rollPrefix || '',
      paymentAccount: paymentAccount || '',
      description: description || '',
      subjects: defaultSubjects
    });

    await batch.save();

    await logActivity(
      req.user._id,
      'CREATE_BATCH',
      `Created academic batch "${name}" for course "${course}"`,
      req.schoolId
    );

    res.status(201).json(batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Server error creating batch' });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin)
exports.updateBatch = async (req, res) => {
  try {
    const { name, course, code, shortCode, maxStrength, rollPrefix, paymentAccount, description } = req.body;

    const batch = await Batch.findOne({ _id: req.params.id, school: req.schoolId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (name) batch.name = name;
    if (course) batch.course = course;
    if (code !== undefined) batch.code = code;
    if (shortCode !== undefined) batch.shortCode = shortCode;
    if (maxStrength !== undefined) batch.maxStrength = maxStrength;
    if (rollPrefix !== undefined) batch.rollPrefix = rollPrefix;
    if (paymentAccount !== undefined) batch.paymentAccount = paymentAccount;
    if (description !== undefined) batch.description = description;

    await batch.save();

    await logActivity(
      req.user._id,
      'UPDATE_BATCH',
      `Updated academic batch "${batch.name}"`,
      req.schoolId
    );

    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating batch' });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin)
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({ _id: req.params.id, school: req.schoolId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await logActivity(
      req.user._id,
      'DELETE_BATCH',
      `Deleted batch "${batch.name}"`,
      req.schoolId
    );

    res.json({ message: 'Batch removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting batch' });
  }
};

// @desc    Duplicate batch
// @route   POST /api/batches/:id/duplicate
// @access  Private (Admin)
exports.duplicateBatch = async (req, res) => {
  try {
    const original = await Batch.findOne({ _id: req.params.id, school: req.schoolId });
    if (!original) {
      return res.status(404).json({ message: 'Original batch not found' });
    }

    const duplicated = new Batch({
      school: req.schoolId,
      name: `${original.name} (Copy)`,
      course: original.course,
      code: original.code ? `${original.code}-COPY` : '',
      shortCode: original.shortCode ? `${original.shortCode}-COPY` : '',
      maxStrength: original.maxStrength,
      currentStrength: 0,
      rollPrefix: original.rollPrefix,
      paymentAccount: original.paymentAccount,
      description: original.description,
      subjects: original.subjects
    });

    await duplicated.save();

    await logActivity(
      req.user._id,
      'DUPLICATE_BATCH',
      `Duplicated batch "${original.name}" to "${duplicated.name}"`,
      req.schoolId
    );

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ message: 'Server error duplicating batch' });
  }
};

// @desc    Reorder subjects inside a batch (Screenshot 2: Reorder Subject)
// @route   POST /api/batches/:id/reorder-subjects
// @access  Private (Admin)
exports.reorderBatchSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    const batch = await Batch.findOne({ _id: req.params.id, school: req.schoolId });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (Array.isArray(subjects)) {
      batch.subjects = subjects;
      await batch.save();
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Server error reordering subjects' });
  }
};

// @desc    Get batch incharges
// @route   GET /api/batches/incharges/all
// @access  Private
exports.getBatchIncharges = async (req, res) => {
  try {
    let incharges = await BatchIncharge.find({ school: req.schoolId }).sort({ createdAt: -1 });

    if (incharges.length === 0) {
      const defaultIncharges = [
        {
          school: req.schoolId,
          batch: 'Section B',
          employee: 'Anamika Tiwari',
          employeeCode: 'ESM001',
          period: 'November 29, 2025 - Present'
        },
        {
          school: req.schoolId,
          batch: 'Section A',
          employee: 'Kalpana Comar',
          employeeCode: 'ESM100',
          period: 'February 1, 2025 - March 31, 2026'
        }
      ];
      await BatchIncharge.insertMany(defaultIncharges);
      incharges = await BatchIncharge.find({ school: req.schoolId }).sort({ createdAt: -1 });
    }

    res.json(incharges);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching batch incharges' });
  }
};

// @desc    Add batch incharge
// @route   POST /api/batches/incharges/add
// @access  Private (Admin)
exports.addBatchIncharge = async (req, res) => {
  try {
    const { batch, employee, employeeCode, period } = req.body;

    const incharge = new BatchIncharge({
      school: req.schoolId,
      batch: batch || 'Section B',
      employee: employee || 'Anamika Tiwari',
      employeeCode: employeeCode || 'ESM001',
      period: period || 'November 29, 2025 - Present'
    });

    await incharge.save();

    // Update batch incharge field
    await Batch.findOneAndUpdate(
      { name: batch, school: req.schoolId },
      { incharge: employee, inchargeDates: period }
    );

    res.status(201).json(incharge);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding batch incharge' });
  }
};

const Subject = require('../models/Subject');

// Helper to seed default subjects if empty
const seedDefaultSubjects = async (schoolId) => {
  const count = await Subject.countDocuments({ schoolId });
  if (count === 0) {
    const defaultSubjects = [
      { name: 'Science', type: 'Practical' },
      { name: 'Moral science', type: 'Theory', alias: 'ms', code: 'ms', shortCode: 'ms' },
      { name: 'RECITATION', type: 'Theory', alias: 'R', code: '50', shortCode: 'R' },
      { name: 'Computer Science', type: 'Practical' },
      { name: 'History', type: 'Theory' },
      { name: 'Geography', type: 'Theory' },
      { name: 'Political Science', type: 'Theory' },
      { name: 'Economics', type: 'Theory' },
      { name: 'Business Studies', type: 'Theory' },
      { name: 'Accountancy', type: 'Theory' },
      { name: 'Biology', type: 'Theory' },
      { name: 'Chemistry', type: 'Practical' },
      { name: 'Physics', type: 'Theory' },
      { name: 'Art', type: 'Practical' },
      { name: 'Physical Education', type: 'Practical' },
      { name: 'Socialscience', type: 'Theory' },
      { name: 'English', type: 'Theory', code: 'ENG', shortCode: 'ENG' },
      { name: 'Hindi', type: 'Theory' },
      { name: 'Health and Physical Education', type: 'Theory' },
      { name: 'General Knowledge', type: 'Theory' },
      { name: 'Environmental Studies', type: 'Theory' },
      { name: 'Art and Craft', type: 'Practical' },
      { name: 'Environment Science', type: 'Practical' },
      { name: 'General Awareness', type: 'Theory' },
      { name: 'Basic Mathematics', type: 'Theory' }
    ];

    const docs = defaultSubjects.map(s => ({
      ...s,
      schoolId,
      alias: s.alias || '',
      code: s.code || '',
      shortCode: s.shortCode || '',
      description: ''
    }));

    await Subject.insertMany(docs);
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (schoolId) {
      await seedDefaultSubjects(schoolId);
    }
    const subjects = await Subject.find({ schoolId }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res) => {
  try {
    const { name, alias, code, shortCode, type, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const subject = new Subject({
      schoolId: req.schoolId,
      name: name.trim(),
      alias: alias ? alias.trim() : '',
      code: code ? code.trim() : '',
      shortCode: shortCode ? shortCode.trim() : '',
      type: type || 'Theory',
      description: description ? description.trim() : ''
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res) => {
  try {
    const { name, alias, code, shortCode, type, description } = req.body;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      {
        name: name ? name.trim() : undefined,
        alias: alias !== undefined ? alias.trim() : undefined,
        code: code !== undefined ? code.trim() : undefined,
        shortCode: shortCode !== undefined ? shortCode.trim() : undefined,
        type: type || undefined,
        description: description !== undefined ? description.trim() : undefined
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Duplicate subject
// @route   POST /api/subjects/:id/duplicate
// @access  Private (Admin)
exports.duplicateSubject = async (req, res) => {
  try {
    const existing = await Subject.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!existing) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const duplicateDoc = new Subject({
      schoolId: req.schoolId,
      name: `${existing.name} (Copy)`,
      alias: existing.alias,
      code: existing.code,
      shortCode: existing.shortCode,
      type: existing.type,
      description: existing.description
    });

    await duplicateDoc.save();
    res.status(201).json(duplicateDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Allot subjects to courses or batches
// @route   POST /api/subjects/allot
// @access  Private (Admin)
exports.allotSubjects = async (req, res) => {
  try {
    const { subjectNames, targetType, targetIds } = req.body;
    const Course = require('../models/Course');
    const Batch = require('../models/Batch');

    if (!Array.isArray(subjectNames) || subjectNames.length === 0) {
      return res.status(400).json({ message: 'At least one subject name is required' });
    }
    if (!Array.isArray(targetIds) || targetIds.length === 0) {
      return res.status(400).json({ message: 'At least one target Course/Batch must be selected' });
    }

    if (targetType === 'course') {
      for (const courseId of targetIds) {
        const course = await Course.findById(courseId);
        if (course) {
          subjectNames.forEach(name => {
            if (!course.subjects.includes(name)) {
              course.subjects.push(name);
            }
          });
          await course.save();
        }
      }
    } else if (targetType === 'batch') {
      for (const batchId of targetIds) {
        const batch = await Batch.findById(batchId);
        if (batch) {
          const existingNames = batch.subjects.map(s => typeof s === 'string' ? s : s.name);
          subjectNames.forEach(name => {
            if (!existingNames.includes(name)) {
              batch.subjects.push({ name, code: '', isElective: false, hasGrading: false, hasNoExam: false });
            }
          });
          await batch.save();
        }
      }
    } else {
      return res.status(400).json({ message: 'Target type must be "course" or "batch"' });
    }

    res.json({ message: `Successfully allotted subject(s) to selected ${targetType}(s)!` });
  } catch (error) {
    console.error('Allot subjects error:', error);
    res.status(500).json({ message: error.message });
  }
};

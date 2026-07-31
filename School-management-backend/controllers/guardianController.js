const Student = require('../models/Student');

// @desc    Get all guardians (Aggregated from Student collection)
// @route   GET /api/guardians
// @access  Private
exports.getGuardians = async (req, res) => {
  try {
    // Fetch all students who have at least one guardian
    const students = await Student.find({ "guardians.0": { $exists: true } });
    
    const allGuardians = [];
    const seenGuardians = new Set();

    students.forEach(student => {
      student.guardians.forEach(guardian => {
        // Use phone + name as a unique key to avoid showing the same person multiple times if they have multiple kids
        const uniqueKey = `${guardian.name}-${guardian.contact}`;
        if (!seenGuardians.has(uniqueKey)) {
          seenGuardians.add(uniqueKey);
          allGuardians.push({
            _id: guardian._id,
            name: guardian.name,
            phone: guardian.contact,
            relationship: guardian.relation,
            studentName: student.name,
            studentId: student._id
          });
        }
      });
    });

    res.json(allGuardians);
  } catch (error) {
    console.error('Get Guardians Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single guardian
// @route   GET /api/guardians/:id
// @access  Private
exports.getGuardian = async (req, res) => {
  try {
    const guardian = await Guardian.findById(req.params.id);
    if (!guardian) {
      return res.status(404).json({ message: 'Guardian not found' });
    }
    res.json(guardian);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create guardian
// @route   POST /api/guardians
// @access  Private (Admin)
exports.createGuardian = async (req, res) => {
  try {
    const guardian = await Guardian.create(req.body);
    res.status(201).json(guardian);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update guardian
// @route   PUT /api/guardians/:id
// @access  Private (Admin)
exports.updateGuardian = async (req, res) => {
  try {
    const guardian = await Guardian.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!guardian) {
      return res.status(404).json({ message: 'Guardian not found' });
    }
    res.json(guardian);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete guardian
// @route   DELETE /api/guardians/:id
// @access  Private (Admin)
exports.deleteGuardian = async (req, res) => {
  try {
    const guardian = await Guardian.findById(req.params.id);
    if (!guardian) {
      return res.status(404).json({ message: 'Guardian not found' });
    }
    await guardian.deleteOne();
    res.json({ message: 'Guardian removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

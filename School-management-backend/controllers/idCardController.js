const IdCardTemplate = require('../models/IdCardTemplate');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// --- ID CARD TEMPLATES CONTROLLER ---

// @desc    Get all ID Card Templates
// @route   GET /api/id-card-templates
exports.getIdCardTemplates = async (req, res) => {
  try {
    const items = await IdCardTemplate.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching ID Card templates:', error);
    res.status(500).json({ message: 'Server error fetching ID card templates' });
  }
};

// @desc    Get ID Card Template by ID
// @route   GET /api/id-card-templates/:id
exports.getIdCardTemplateById = async (req, res) => {
  try {
    const item = await IdCardTemplate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ID Card Template not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create ID Card Template
// @route   POST /api/id-card-templates
exports.createIdCardTemplate = async (req, res) => {
  try {
    const item = await IdCardTemplate.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating ID card template:', error);
    res.status(400).json({ message: error.message || 'Invalid template data' });
  }
};

// @desc    Update ID Card Template
// @route   PUT /api/id-card-templates/:id
exports.updateIdCardTemplate = async (req, res) => {
  try {
    const item = await IdCardTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: 'ID Card Template not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating template' });
  }
};

// @desc    Delete ID Card Template
// @route   DELETE /api/id-card-templates/:id
exports.deleteIdCardTemplate = async (req, res) => {
  try {
    const item = await IdCardTemplate.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ID Card Template not found' });
    }
    res.json({ message: 'ID Card Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate ID Card Template
// @route   POST /api/id-card-templates/:id/duplicate
exports.duplicateIdCardTemplate = async (req, res) => {
  try {
    const existing = await IdCardTemplate.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'ID Card Template not found' });
    }

    const obj = existing.toObject();
    delete obj._id;
    delete obj.createdAt;
    obj.name = `${existing.name} Copy`;
    
    const duplicated = await IdCardTemplate.create(obj);
    res.status(201).json(duplicated);
  } catch (error) {
    console.error('Error duplicating ID card template:', error);
    res.status(500).json({ message: 'Error duplicating template' });
  }
};

// @desc    Get filtered students or staff for ID Card Generation
// @route   GET /api/id-cards/filter
exports.filterIdCardMembers = async (req, res) => {
  try {
    const { forType, course, batch, search } = req.query;

    if (forType === 'Teacher' || forType === 'Staff') {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      const teachers = await Teacher.find(query).sort({ name: 1 });
      const mapped = teachers.map(t => ({
        _id: t._id,
        name: t.name,
        code: t.employeeId || `EMP${t._id.toString().slice(-4)}`,
        role: 'Teacher',
        className: t.subject || 'Faculty',
        section: t.department || 'Academic',
        dob: t.dob || '1990-01-01',
        bloodGroup: t.bloodGroup || 'O+',
        phone: t.contact || t.phone || '9876543210',
        address: t.address || 'Campus Staff Quarters',
        emergencyContact: t.emergencyContact || t.contact || '9876543210',
        avatar: t.photo || t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0D8ABC&color=fff`
      }));
      return res.json(mapped);
    }

    // Default: Student filtering
    let query = {};
    if (course) {
      query.className = { $regex: course, $options: 'i' };
    }
    if (batch) {
      query.section = { $regex: batch, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ className: 1, rollNumber: 1, name: 1 });
    const mapped = students.map(s => ({
      _id: s._id,
      name: s.name,
      code: s.rollNumber || `SM${s._id.toString().slice(-3)}`,
      role: 'Student',
      className: s.className || 'Class 1',
      section: s.section || 'A',
      dob: s.dob || '2012-05-15',
      bloodGroup: s.bloodGroup || 'B+',
      phone: s.contact || s.phone || '9876543210',
      address: s.address || 'City Campus Housing',
      emergencyContact: s.emergencyContact || s.guardianContact || s.contact || '9876543210',
      fatherName: s.fatherName || s.guardianName || '',
      avatar: s.photo || s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=2563eb&color=fff`
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error filtering members for ID card:', error);
    res.status(500).json({ message: 'Server error filtering ID Card members' });
  }
};

const Department = require('../models/Department');
const { logActivity } = require('../utils/logActivity');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    const departments = await Department.find(filter).populate('incharge', 'name employeeId subject email contact');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('incharge', 'name employeeId subject email contact');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const deptData = { ...req.body };
    if (req.schoolId) deptData.school = req.schoolId;
    const department = await Department.create(deptData);
    const populated = await Department.findById(department._id).populate('incharge', 'name employeeId subject email contact');
    await logActivity({ req, user: req.user, activity: `Created new department: ${department.name}` });
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(400).json({ message: error.message || 'Failed to create department' });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    }).populate('incharge', 'name employeeId subject email contact');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await logActivity({ req, user: req.user, activity: `Updated department: ${department.name}` });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update department' });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await department.deleteOne();
    await logActivity({ req, user: req.user, activity: `Deleted department: ${department.name}` });
    res.json({ message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

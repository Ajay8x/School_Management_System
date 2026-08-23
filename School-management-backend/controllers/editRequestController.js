const EditRequest = require('../models/EditRequest');
const Student = require('../models/Student');

// @desc    Get all edit requests with optional filters
// @route   GET /api/students/edit-requests
// @access  Private
exports.getEditRequests = async (req, res) => {
  try {
    const { studentId, status, startDate, endDate } = req.query;
    let query = {};

    if (studentId) {
      query.$or = [
        { student: studentId },
        { studentName: { $regex: studentId, $options: 'i' } },
        { admissionNumber: { $regex: studentId, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const requests = await EditRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getEditRequests:', error);
    res.status(500).json({ message: 'Server error fetching edit requests', error: error.message });
  }
};

// @desc    Get single edit request detail
// @route   GET /api/students/edit-requests/:id
// @access  Private
exports.getEditRequestById = async (req, res) => {
  try {
    const request = await EditRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Edit request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error in getEditRequestById:', error);
    res.status(500).json({ message: 'Server error fetching request details', error: error.message });
  }
};

// @desc    Create new edit request
// @route   POST /api/students/edit-requests
// @access  Private
exports.createEditRequest = async (req, res) => {
  try {
    const {
      student,
      studentName,
      contact,
      fatherName,
      motherName,
      dateOfAdmission,
      admissionNumber,
      course,
      section,
      birthDate,
      requestBy,
      bloodGroup,
      attachment
    } = req.body;

    const parentName = [fatherName, motherName].filter(Boolean).join(' / ') || fatherName || motherName || '';

    const newRequest = await EditRequest.create({
      student: student || null,
      studentName,
      contact: contact || '',
      fatherName: fatherName || '',
      motherName: motherName || '',
      parentName,
      dateOfAdmission: dateOfAdmission || '',
      admissionNumber,
      course: course || '',
      section: section || '',
      birthDate: birthDate || '',
      requestBy: requestBy || studentName,
      bloodGroup: bloodGroup || '',
      attachment: attachment || null,
      status: 'Pending',
      createdAt: new Date(),
      lastUpdatedAt: new Date()
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in createEditRequest:', error);
    res.status(500).json({ message: 'Server error creating edit request', error: error.message });
  }
};

// @desc    Update edit request status (Approve / Reject)
// @route   PUT /api/students/edit-requests/:id/status
// @access  Private
exports.updateEditRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const request = await EditRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Edit request not found' });
    }

    if (status) {
      request.status = status;
    }
    if (rejectionReason !== undefined) {
      request.rejectionReason = rejectionReason;
    }

    request.lastUpdatedAt = new Date();
    await request.save();

    // If approved and student reference exists, update student record
    if (status === 'Approved' && request.student) {
      const student = await Student.findById(request.student);
      if (student) {
        if (request.fatherName) student.parentName = request.fatherName;
        if (request.contact) student.contact = request.contact;
        if (request.birthDate) student.dateOfBirth = new Date(request.birthDate);
        if (request.bloodGroup) student.bloodGroup = request.bloodGroup;
        await student.save();
      }
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error in updateEditRequestStatus:', error);
    res.status(500).json({ message: 'Server error updating status', error: error.message });
  }
};

// @desc    Update full edit request details
// @route   PUT /api/students/edit-requests/:id
// @access  Private
exports.updateEditRequest = async (req, res) => {
  try {
    const request = await EditRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Edit request not found' });
    }

    Object.assign(request, req.body, { lastUpdatedAt: new Date() });
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    console.error('Error in updateEditRequest:', error);
    res.status(500).json({ message: 'Server error updating edit request', error: error.message });
  }
};

// @desc    Delete edit request
// @route   DELETE /api/students/edit-requests/:id
// @access  Private
exports.deleteEditRequest = async (req, res) => {
  try {
    const request = await EditRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Edit request not found' });
    }
    res.status(200).json({ message: 'Edit request deleted successfully' });
  } catch (error) {
    console.error('Error in deleteEditRequest:', error);
    res.status(500).json({ message: 'Server error deleting edit request', error: error.message });
  }
};

const ServiceRequest = require('../models/ServiceRequest');
const Student = require('../models/Student');

// @desc    Get all service requests with optional filters
// @route   GET /api/service-requests
// @access  Private
exports.getServiceRequests = async (req, res) => {
  try {
    const { studentId, status, type, requestType, startDate, endDate, search } = req.query;
    let query = {};

    if (studentId) {
      query.$or = [
        { student: studentId },
        { studentName: { $regex: studentId, $options: 'i' } },
        { admissionNumber: { $regex: studentId, $options: 'i' } },
        { codeNumber: { $regex: studentId, $options: 'i' } }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { codeNumber: searchRegex },
        { studentName: searchRegex },
        { parentName: searchRegex },
        { course: searchRegex },
        { type: searchRegex },
        { description: searchRegex }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = { $regex: new RegExp(`^${type}`, 'i') };
    }

    if (requestType && requestType !== 'All') {
      query.requestType = requestType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const requests = await ServiceRequest.find(query).populate('student').sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getServiceRequests:', error);
    res.status(500).json({ message: 'Server error fetching service requests', error: error.message });
  }
};

// @desc    Get single service request
// @route   GET /api/service-requests/:id
// @access  Private
exports.getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('student');
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error in getServiceRequestById:', error);
    res.status(500).json({ message: 'Server error fetching service request details', error: error.message });
  }
};

// @desc    Create new service request
// @route   POST /api/service-requests
// @access  Private
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      contact,
      fatherName,
      motherName,
      parentName,
      dateOfAdmission,
      admissionNumber,
      course,
      section,
      date,
      type,
      requestType,
      description,
      attachment,
      fileUrl,
      status
    } = req.body;

    let studentObj = null;
    let finalStudentName = studentName || '';
    let finalParentName = parentName || '';
    let finalContact = contact || '';
    let finalAdmissionNo = admissionNumber || '';
    let finalCourse = course || '';
    let finalSection = section || '';
    let finalDateOfAdmission = dateOfAdmission || '';

    if (studentId) {
      studentObj = await Student.findById(studentId);
      if (studentObj) {
        finalStudentName = studentObj.name || finalStudentName;
        finalParentName = studentObj.parentName || finalParentName;
        finalContact = studentObj.contact || finalContact;
        finalAdmissionNo = studentObj.admissionNumber || studentObj.rollNumber || finalAdmissionNo;
        finalCourse = studentObj.className || finalCourse;
        finalSection = studentObj.section || finalSection;
        finalDateOfAdmission = studentObj.dateOfAdmission || finalDateOfAdmission;
      }
    }

    if (!finalStudentName && !finalParentName) {
      finalStudentName = 'Ritisha Tripathi';
      finalParentName = 'Hariom Tripathi / Anamika Tripathi';
    }

    // Auto-generate code number (e.g. SR001, SR002...)
    const count = await ServiceRequest.countDocuments();
    const nextNum = (count + 1).toString().padStart(3, '0');
    const codeNumber = `SR${nextNum}`;

    let attachmentObj = null;
    if (attachment) {
      attachmentObj = attachment;
    } else if (fileUrl) {
      attachmentObj = { fileName: 'Attached File', fileSize: '100 KB', url: fileUrl };
    }

    const newRequest = await ServiceRequest.create({
      codeNumber,
      student: studentId || (studentObj ? studentObj._id : null),
      studentName: finalStudentName,
      contact: finalContact,
      fatherName: fatherName || '',
      motherName: motherName || '',
      parentName: finalParentName,
      dateOfAdmission: finalDateOfAdmission,
      admissionNumber: finalAdmissionNo,
      course: finalCourse,
      section: finalSection,
      date: date ? new Date(date) : new Date(),
      type: type || 'Mess',
      requestType: requestType || 'Opt In',
      description: description || '',
      attachment: attachmentObj,
      status: status || 'Requested'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in createServiceRequest:', error);
    res.status(500).json({ message: 'Server error creating service request', error: error.message });
  }
};

// @desc    Update service request
// @route   PUT /api/service-requests/:id
// @access  Private
exports.updateServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    Object.assign(request, req.body);
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    console.error('Error in updateServiceRequest:', error);
    res.status(500).json({ message: 'Server error updating service request', error: error.message });
  }
};

// @desc    Update service request status (Approve / Reject)
// @route   PUT /api/service-requests/:id/status
// @access  Private
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    if (status) request.status = status;
    if (rejectionReason !== undefined) request.rejectionReason = rejectionReason;

    await request.save();
    res.status(200).json(request);
  } catch (error) {
    console.error('Error in updateServiceRequestStatus:', error);
    res.status(500).json({ message: 'Server error updating status', error: error.message });
  }
};

// @desc    Delete service request
// @route   DELETE /api/service-requests/:id
// @access  Private
exports.deleteServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    res.status(200).json({ message: 'Service request deleted successfully' });
  } catch (error) {
    console.error('Error in deleteServiceRequest:', error);
    res.status(500).json({ message: 'Server error deleting service request', error: error.message });
  }
};

// @desc    Bulk import service requests
// @route   POST /api/service-requests/import
// @access  Private
exports.importServiceRequests = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for import' });
    }

    const createdItems = [];
    const count = await ServiceRequest.countDocuments();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const codeNumber = item.codeNumber || `SR${(count + i + 1).toString().padStart(3, '0')}`;
      const newReq = await ServiceRequest.create({
        codeNumber,
        studentName: item.studentName || item.Name || 'Student',
        parentName: item.parentName || item.Parent || '',
        contact: item.contact || item.Phone || '',
        dateOfAdmission: item.dateOfAdmission || 'February 8, 2025',
        admissionNumber: item.admissionNumber || `SM00${i + 1}`,
        course: item.course || item.Course || 'IX Section A',
        type: item.type || item.Type || 'Mess',
        requestType: item.requestType || item['Request Type'] || 'Opt In',
        description: item.description || '',
        status: item.status || item.Status || 'Requested',
        date: item.date ? new Date(item.date) : new Date()
      });
      createdItems.push(newReq);
    }

    res.status(201).json({ message: `Successfully imported ${createdItems.length} service requests`, items: createdItems });
  } catch (error) {
    console.error('Error in importServiceRequests:', error);
    res.status(500).json({ message: 'Server error importing service requests', error: error.message });
  }
};

const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Student = require('../models/Student');

// --- CERTIFICATES ---

// @desc    Get all certificates (with optional search & pagination)
// @route   GET /api/certificates
exports.getCertificates = async (req, res) => {
  try {
    const { search, templateId, applicableFor } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { certificateNo: { $regex: search, $options: 'i' } },
        { toName: { $regex: search, $options: 'i' } },
        { toCode: { $regex: search, $options: 'i' } },
        { templateName: { $regex: search, $options: 'i' } }
      ];
    }

    if (templateId) {
      query.templateId = templateId;
    }

    if (applicableFor) {
      query.applicableFor = applicableFor;
    }

    const items = await Certificate.find(query).sort({ createdAt: -1 }).populate('templateId');
    res.json(items);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Server error fetching certificates' });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
exports.getCertificateById = async (req, res) => {
  try {
    const item = await Certificate.findById(req.params.id).populate('templateId').populate('studentId');
    if (!item) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new certificate
// @route   POST /api/certificates
exports.createCertificate = async (req, res) => {
  try {
    let {
      certificateNo,
      templateId,
      templateName,
      applicableFor,
      studentId,
      toName,
      toCode,
      date,
      isDuplicate,
      customData
    } = req.body;

    // Auto-fill templateName if templateId provided
    if (templateId && !templateName) {
      const tpl = await CertificateTemplate.findById(templateId);
      if (tpl) {
        templateName = tpl.name;
        if (!applicableFor) applicableFor = tpl.applicableFor;
      }
    }

    // Generate certificateNo if empty
    if (!certificateNo) {
      const count = await Certificate.countDocuments();
      const prefix = templateName ? templateName.substring(0, 2).toUpperCase() : 'TC';
      certificateNo = `${prefix}-${Date.now().toString().slice(-5)}`;
    }

    // Auto-fill student info if studentId provided
    if (studentId && (!toName || !toCode)) {
      const student = await Student.findById(studentId);
      if (student) {
        toName = toName || student.name;
        toCode = toCode || student.rollNumber || `SM${student._id.toString().slice(-3)}`;
      }
    }

    const item = await Certificate.create({
      certificateNo,
      templateId,
      templateName: templateName || 'Transfer Certificate',
      applicableFor: applicableFor || 'Student',
      studentId,
      toName,
      toCode: toCode || '',
      date: date || new Date(),
      isDuplicate: !!isDuplicate,
      customData: customData || {},
      createdBy: req.user ? req.user.name : '-'
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

// @desc    Update certificate
// @route   PUT /api/certificates/:id
exports.updateCertificate = async (req, res) => {
  try {
    const item = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating certificate' });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
exports.deleteCertificate = async (req, res) => {
  try {
    const item = await Certificate.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate certificate
// @route   POST /api/certificates/:id/duplicate
exports.duplicateCertificate = async (req, res) => {
  try {
    const existing = await Certificate.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const count = await Certificate.countDocuments();
    const prefix = existing.certificateNo.split('-')[0] || 'TC';
    const newNo = `${prefix}-DUP${count + 1}`;

    const duplicated = await Certificate.create({
      certificateNo: newNo,
      templateId: existing.templateId,
      templateName: existing.templateName,
      applicableFor: existing.applicableFor,
      studentId: existing.studentId,
      toName: existing.toName,
      toCode: existing.toCode,
      date: new Date(),
      isDuplicate: true,
      customData: existing.customData,
      createdBy: req.user ? req.user.name : '-'
    });

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating certificate' });
  }
};


// --- CERTIFICATE TEMPLATES ---

// @desc    Get all certificate templates
// @route   GET /api/certificates/templates or /api/certificate-templates
exports.getCertificateTemplates = async (req, res) => {
  try {
    const items = await CertificateTemplate.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching templates' });
  }
};

// @desc    Get certificate template by ID
// @route   GET /api/certificates/templates/:id
exports.getCertificateTemplateById = async (req, res) => {
  try {
    const item = await CertificateTemplate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Certificate template not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create certificate template
// @route   POST /api/certificates/templates
exports.createCertificateTemplate = async (req, res) => {
  try {
    const item = await CertificateTemplate.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid template data' });
  }
};

// @desc    Update certificate template
// @route   PUT /api/certificates/templates/:id
exports.updateCertificateTemplate = async (req, res) => {
  try {
    const item = await CertificateTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: 'Certificate template not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating template' });
  }
};

// @desc    Delete certificate template
// @route   DELETE /api/certificates/templates/:id
exports.deleteCertificateTemplate = async (req, res) => {
  try {
    const item = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Certificate template not found' });
    }
    res.json({ message: 'Certificate template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate certificate template
// @route   POST /api/certificates/templates/:id/duplicate
exports.duplicateCertificateTemplate = async (req, res) => {
  try {
    const existing = await CertificateTemplate.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Certificate template not found' });
    }

    const duplicated = await CertificateTemplate.create({
      name: `${existing.name} (Copy)`,
      type: existing.type,
      applicableFor: existing.applicableFor,
      headerText: existing.headerText,
      subHeader: existing.subHeader,
      bodyText: existing.bodyText,
      leftSignatureTitle: existing.leftSignatureTitle,
      rightSignatureTitle: existing.rightSignatureTitle,
      backgroundStyle: existing.backgroundStyle
    });

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating template' });
  }
};

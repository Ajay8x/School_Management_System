const School = require('../models/School');
const { defaultModulesConfig } = require('../models/School');

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private
exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: 1 });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Server error fetching schools' });
  }
};

// @desc    Get single school by ID
// @route   GET /api/schools/:id
// @access  Private
exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ message: 'Server error fetching school' });
  }
};

// @desc    Create a new school
// @route   POST /api/schools
// @access  Private (Super Admin)
exports.createSchool = async (req, res) => {
  try {
    const {
      name, appName, code, tagline, description,
      metaAuthor, metaDescription, metaKeywords,
      address, addressLine1, addressLine2, city, state, zipcode, country,
      phone, email, fax, website, financialYearCode, logoUrl, status, modules
    } = req.body;

    if (!name && !appName) {
      return res.status(400).json({ message: 'School or App name is required' });
    }

    const schoolName = name || appName;

    const school = await School.create({
      name: schoolName,
      appName: appName || schoolName,
      code: code || schoolName.split(' ').map(w => w[0]).join('').toUpperCase(),
      tagline: tagline || 'Excellence in Education',
      description: description || 'Innovative Partner',
      metaAuthor: metaAuthor || '',
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || '',
      address: address || '',
      addressLine1: addressLine1 || '',
      addressLine2: addressLine2 || '',
      city: city || '',
      state: state || '',
      zipcode: zipcode || '',
      country: country || '',
      phone: phone || '',
      email: email || '',
      fax: fax || '',
      website: website || '',
      financialYearCode: financialYearCode || '',
      logoUrl: logoUrl || '',
      status: status || 'active',
      modules: modules || defaultModulesConfig
    });

    res.status(201).json(school);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ message: 'Server error creating school' });
  }
};

// @desc    Update school info
// @route   PUT /api/schools/:id
// @access  Private (Super Admin)
exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const updated = await School.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ message: 'Server error updating school' });
  }
};

// @desc    Update module configuration for a school
// @route   PUT /api/schools/:id/modules
// @access  Private (Super Admin)
exports.updateSchoolModules = async (req, res) => {
  try {
    const { modules } = req.body;
    if (!modules) {
      return res.status(400).json({ message: 'Modules configuration data is required' });
    }

    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    school.modules = modules;
    await school.save();

    res.json({ message: 'Module configuration updated successfully', modules: school.modules });
  } catch (error) {
    console.error('Error updating school modules:', error);
    res.status(500).json({ message: 'Server error updating modules' });
  }
};

// @desc    Delete a school
// @route   DELETE /api/schools/:id
// @access  Private (Super Admin)
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    await School.findByIdAndDelete(req.params.id);
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ message: 'Server error deleting school' });
  }
};

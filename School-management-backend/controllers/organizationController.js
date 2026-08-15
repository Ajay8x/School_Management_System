const Organization = require('../models/Organization');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private
exports.getOrganizations = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const organizations = await Organization.find(filter).sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res) => {
  try {
    const { name, code, contactNumber, email, website, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const organization = new Organization({
      name,
      code,
      contactNumber,
      email,
      website,
      address,
      schoolId: req.schoolId
    });

    const savedOrg = await organization.save();
    res.status(201).json(savedOrg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private
exports.updateOrganization = async (req, res) => {
  try {
    const { name, code, contactNumber, email, website, address } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    organization.name = name || organization.name;
    organization.code = code !== undefined ? code : organization.code;
    organization.contactNumber = contactNumber !== undefined ? contactNumber : organization.contactNumber;
    organization.email = email !== undefined ? email : organization.email;
    organization.website = website !== undefined ? website : organization.website;
    organization.address = address !== undefined ? address : organization.address;

    const updatedOrg = await organization.save();
    res.json(updatedOrg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    await organization.deleteOne();
    res.json({ message: 'Organization removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Enquiry = require('../models/Enquiry');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');

// --- Enquiry ---
exports.getEnquiries = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const data = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEnquiry = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    const data = await Enquiry.create(d);
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const data = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- Visitor ---
exports.getVisitors = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const data = await Visitor.find(filter).sort({ inTime: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createVisitor = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    const data = await Visitor.create(d);
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateVisitorOutTime = async (req, res) => {
  try {
    const data = await Visitor.findByIdAndUpdate(req.params.id, { outTime: Date.now() }, { returnDocument: 'after' });
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- Complaint ---
exports.getComplaints = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const data = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createComplaint = async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.schoolId) d.schoolId = req.schoolId;
    const data = await Complaint.create(d);
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateComplaint = async (req, res) => {
  try {
    const data = await Complaint.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const Enquiry = require('../models/Enquiry');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');

// --- Enquiry ---
exports.getEnquiries = async (req, res) => {
  try {
    const data = await Enquiry.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEnquiry = async (req, res) => {
  try {
    const data = await Enquiry.create(req.body);
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- Visitor ---
exports.getVisitors = async (req, res) => {
  try {
    const data = await Visitor.find().sort({ inTime: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createVisitor = async (req, res) => {
  try {
    const data = await Visitor.create(req.body);
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
    const data = await Complaint.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createComplaint = async (req, res) => {
  try {
    const data = await Complaint.create(req.body);
    res.status(201).json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateComplaint = async (req, res) => {
  try {
    const data = await Complaint.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Class', fields: "name: { type: String, required: true }, teacher: { type: String }" },
  { name: 'Examination', fields: "name: { type: String, required: true }, date: { type: Date }" },
  { name: 'Fee', fields: "studentId: { type: String, required: true }, amount: { type: Number, required: true }, status: { type: String, default: 'Pending' }" },
  { name: 'Attendance', fields: "studentId: { type: String, required: true }, date: { type: Date, required: true }, status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }" },
  { name: 'Leave', fields: "userId: { type: String, required: true }, reason: { type: String }, status: { type: String, default: 'Pending' }" },
  { name: 'Certificate', fields: "studentId: { type: String, required: true }, type: { type: String }, dateIssued: { type: Date, default: Date.now }" },
  { name: 'Library', fields: "bookName: { type: String, required: true }, author: { type: String }, status: { type: String, enum: ['Available', 'Issued'], default: 'Available' }" },
  { name: 'Account', fields: "title: { type: String, required: true }, amount: { type: Number }, type: { type: String, enum: ['Income', 'Expense'] }" },
  { name: 'HRM', fields: "employeeName: { type: String, required: true }, position: { type: String }, salary: { type: Number }" },
  { name: 'Notice', fields: "title: { type: String, required: true }, content: { type: String }, date: { type: Date, default: Date.now }" },
  { name: 'Event', fields: "title: { type: String, required: true }, date: { type: Date }, location: { type: String }" },
  { name: 'Message', fields: "senderId: { type: String, required: true }, receiverId: { type: String, required: true }, content: { type: String }" },
  { name: 'Settings', fields: "schoolName: { type: String }, logoUrl: { type: String }" }
];

const backendPath = path.join(__dirname, 'School-management-backend');

models.forEach(model => {
  const modelName = model.name;
  const lowerName = modelName.toLowerCase();

  // Model
  const modelCode = `const mongoose = require('mongoose');

const ${lowerName}Schema = new mongoose.Schema({
  ${model.fields},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('${modelName}', ${lowerName}Schema);
`;
  fs.writeFileSync(path.join(backendPath, 'models', `${modelName}.js`), modelCode);

  // Controller
  const controllerCode = `const ${modelName} = require('../models/${modelName}');

exports.get${modelName}s = async (req, res) => {
  try {
    const items = await ${modelName}.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create${modelName} = async (req, res) => {
  try {
    const item = await ${modelName}.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};
`;
  fs.writeFileSync(path.join(backendPath, 'controllers', `${lowerName}Controller.js`), controllerCode);

  // Route
  const routeCode = `const express = require('express');
const router = express.Router();
const { get${modelName}s, create${modelName} } = require('../controllers/${lowerName}Controller');
const { protect, authRole } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, get${modelName}s)
  .post(protect, authRole('admin'), create${modelName});

module.exports = router;
`;
  fs.writeFileSync(path.join(backendPath, 'routes', `${lowerName}Routes.js`), routeCode);
});

console.log("Backend scaffolding complete.");

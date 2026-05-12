const Certificate = require('../models/Certificate');

exports.getCertificates = async (req, res) => {
  try {
    const items = await Certificate.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCertificate = async (req, res) => {
  try {
    const item = await Certificate.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

const Account = require('../models/Account');

// @desc    Get all transactions
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const transactions = await Account.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create transaction
// @route   POST /api/accounts
// @access  Private (Admin)
exports.createAccount = async (req, res) => {
  try {
    const txData = { ...req.body };
    if (req.schoolId) txData.schoolId = req.schoolId;
    const transaction = await Account.create(txData);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/accounts/:id
// @access  Private (Admin)
exports.updateAccount = async (req, res) => {
  try {
    const transaction = await Account.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/accounts/:id
// @access  Private (Admin)
exports.deleteAccount = async (req, res) => {
  try {
    const transaction = await Account.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

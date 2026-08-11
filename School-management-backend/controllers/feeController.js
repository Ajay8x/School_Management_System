const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Account = require('../models/Account');

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private
exports.getFees = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const fees = await Fee.find(filter).populate('student', 'name rollNumber className');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get fees for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Private
exports.getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.params.studentId });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin)
exports.createFee = async (req, res) => {
  try {
    const feeData = { ...req.body };
    if (req.schoolId) feeData.schoolId = req.schoolId;
    const fee = await Fee.create(feeData);
    
    // If initially paid, add to accounts
    if (fee.paidAmount > 0) {
      await Account.create({
        title: `Fee Payment: ${fee.feeType}`,
        amount: fee.paidAmount,
        type: 'Income',
        date: fee.date
      });
    }
    
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res) => {
  try {
    const oldFee = await Fee.findById(req.params.id);
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // If payment increased, add the difference to accounts
    const paymentDiff = fee.paidAmount - (oldFee.paidAmount || 0);
    if (paymentDiff > 0) {
      await Account.create({
        title: `Fee Payment Update: ${fee.feeType}`,
        amount: paymentDiff,
        type: 'Income'
      });
    }

    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    res.json({ message: 'Fee record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

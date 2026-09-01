const PaymentMethod = require('../models/PaymentMethod');

// @desc    Get all payment methods
// @route   GET /api/payment-methods
// @access  Private
exports.getPaymentMethods = async (req, res) => {
  try {
    const { name, search, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (req.schoolId) {
      query.school = req.schoolId;
    }

    const searchTerm = name || search;
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await PaymentMethod.countDocuments(query);
    const paymentMethods = await PaymentMethod.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: paymentMethods,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single payment method
// @route   GET /api/payment-methods/:id
// @access  Private
exports.getPaymentMethodById = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment Method not found' });
    }
    res.json({ success: true, data: paymentMethod });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create payment method
// @route   POST /api/payment-methods
// @access  Private
exports.createPaymentMethod = async (req, res) => {
  try {
    const {
      name,
      code,
      isPaymentGateway,
      hasInstrumentNumber,
      hasInstrumentDate,
      hasClearingDate,
      hasBankDetail,
      hasBranchDetail,
      hasReferenceNumber,
      hasCardProvider,
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Payment method name is required' });
    }

    const paymentMethod = new PaymentMethod({
      school: req.schoolId || null,
      name,
      code: code ? code.toUpperCase() : '',
      isPaymentGateway: !!isPaymentGateway,
      hasInstrumentNumber: !!hasInstrumentNumber,
      hasInstrumentDate: !!hasInstrumentDate,
      hasClearingDate: !!hasClearingDate,
      hasBankDetail: !!hasBankDetail,
      hasBranchDetail: !!hasBranchDetail,
      hasReferenceNumber: !!hasReferenceNumber,
      hasCardProvider: !!hasCardProvider,
      description: description || ''
    });

    await paymentMethod.save();
    res.status(201).json({ success: true, message: 'Payment method created successfully', data: paymentMethod });
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private
exports.updatePaymentMethod = async (req, res) => {
  try {
    const {
      name,
      code,
      isPaymentGateway,
      hasInstrumentNumber,
      hasInstrumentDate,
      hasClearingDate,
      hasBankDetail,
      hasBranchDetail,
      hasReferenceNumber,
      hasCardProvider,
      description
    } = req.body;

    let paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    if (name !== undefined) paymentMethod.name = name;
    if (code !== undefined) paymentMethod.code = code.toUpperCase();
    if (isPaymentGateway !== undefined) paymentMethod.isPaymentGateway = isPaymentGateway;
    if (hasInstrumentNumber !== undefined) paymentMethod.hasInstrumentNumber = hasInstrumentNumber;
    if (hasInstrumentDate !== undefined) paymentMethod.hasInstrumentDate = hasInstrumentDate;
    if (hasClearingDate !== undefined) paymentMethod.hasClearingDate = hasClearingDate;
    if (hasBankDetail !== undefined) paymentMethod.hasBankDetail = hasBankDetail;
    if (hasBranchDetail !== undefined) paymentMethod.hasBranchDetail = hasBranchDetail;
    if (hasReferenceNumber !== undefined) paymentMethod.hasReferenceNumber = hasReferenceNumber;
    if (hasCardProvider !== undefined) paymentMethod.hasCardProvider = hasCardProvider;
    if (description !== undefined) paymentMethod.description = description;

    await paymentMethod.save();
    res.json({ success: true, message: 'Payment method updated successfully', data: paymentMethod });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Duplicate payment method
// @route   POST /api/payment-methods/:id/duplicate
// @access  Private
exports.duplicatePaymentMethod = async (req, res) => {
  try {
    const original = await PaymentMethod.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    const duplicated = new PaymentMethod({
      school: original.school,
      name: `${original.name} (Copy)`,
      code: original.code ? `${original.code}_COPY` : '',
      isPaymentGateway: original.isPaymentGateway,
      hasInstrumentNumber: original.hasInstrumentNumber,
      hasInstrumentDate: original.hasInstrumentDate,
      hasClearingDate: original.hasClearingDate,
      hasBankDetail: original.hasBankDetail,
      hasBranchDetail: original.hasBranchDetail,
      hasReferenceNumber: original.hasReferenceNumber,
      hasCardProvider: original.hasCardProvider,
      description: original.description
    });

    await duplicated.save();
    res.status(201).json({ success: true, message: 'Payment method duplicated successfully', data: duplicated });
  } catch (error) {
    console.error('Error duplicating payment method:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

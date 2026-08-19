const FAQ = require('../models/FAQ');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Private
const getFAQs = async (req, res) => {
  try {
    const { category, tag, search, publish } = req.query;
    let query = {};

    if (req.schoolId) {
      query.$or = [
        { schoolId: req.schoolId },
        { schoolId: { $exists: false } },
        { schoolId: null }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tag = tag;
    }

    if (publish !== undefined) {
      query.publish = publish === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$and = [
        {
          $or: [
            { question: searchRegex },
            { answer: searchRegex },
            { category: searchRegex },
            { tag: searchRegex }
          ]
        }
      ];
    }

    const faqs = await FAQ.find(query).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server Error fetching FAQs', error: error.message });
  }
};

// @desc    Get FAQ by ID
// @route   GET /api/faqs/:id
// @access  Private
const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching FAQ', error: error.message });
  }
};

// @desc    Create FAQ
// @route   POST /api/faqs
// @access  Private
const createFAQ = async (req, res) => {
  try {
    const { question, category, tag, answer, publish } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and Answer are required' });
    }

    const schoolId = req.schoolId || (req.user ? req.user.schoolId : undefined);

    const newFAQ = new FAQ({
      question,
      category: category || 'General',
      tag: tag || '',
      answer,
      publish: publish !== undefined ? publish : true,
      createdBy: req.user ? req.user._id : undefined,
      schoolId
    });

    const savedFAQ = await newFAQ.save();
    res.status(201).json(savedFAQ);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Server Error creating FAQ', error: error.message });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private
const updateFAQ = async (req, res) => {
  try {
    const { question, category, tag, answer, publish } = req.body;

    let faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (question !== undefined) faq.question = question;
    if (category !== undefined) faq.category = category;
    if (tag !== undefined) faq.tag = tag;
    if (answer !== undefined) faq.answer = answer;
    if (publish !== undefined) faq.publish = publish;

    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Server Error updating FAQ', error: error.message });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ removed successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Server Error deleting FAQ', error: error.message });
  }
};

module.exports = {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ
};

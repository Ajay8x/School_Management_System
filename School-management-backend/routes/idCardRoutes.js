const express = require('express');
const router = express.Router();
const {
  getIdCardTemplates,
  getIdCardTemplateById,
  createIdCardTemplate,
  updateIdCardTemplate,
  deleteIdCardTemplate,
  duplicateIdCardTemplate,
  filterIdCardMembers
} = require('../controllers/idCardController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Template Routes
router.route('/templates')
  .get(protect, getIdCardTemplates)
  .post(protect, authRole('admin', 'super-admin'), createIdCardTemplate);

router.route('/templates/:id')
  .get(protect, getIdCardTemplateById)
  .put(protect, authRole('admin', 'super-admin'), updateIdCardTemplate)
  .delete(protect, authRole('admin', 'super-admin'), deleteIdCardTemplate);

router.post('/templates/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateIdCardTemplate);

// Filter Members Route
router.get('/members/filter', protect, filterIdCardMembers);

module.exports = router;

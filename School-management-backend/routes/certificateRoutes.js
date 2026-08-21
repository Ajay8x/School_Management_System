const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  duplicateCertificate,
  getCertificateTemplates,
  getCertificateTemplateById,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  duplicateCertificateTemplate
} = require('../controllers/certificateController');
const { protect, authRole } = require('../middlewares/authMiddleware');

// Certificate Templates Routes
router.route('/templates')
  .get(protect, getCertificateTemplates)
  .post(protect, authRole('admin', 'super-admin'), createCertificateTemplate);

router.route('/templates/:id')
  .get(protect, getCertificateTemplateById)
  .put(protect, authRole('admin', 'super-admin'), updateCertificateTemplate)
  .delete(protect, authRole('admin', 'super-admin'), deleteCertificateTemplate);

router.post('/templates/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateCertificateTemplate);

// Certificate Main Routes
router.route('/')
  .get(protect, getCertificates)
  .post(protect, authRole('admin', 'super-admin'), createCertificate);

router.route('/:id')
  .get(protect, getCertificateById)
  .put(protect, authRole('admin', 'super-admin'), updateCertificate)
  .delete(protect, authRole('admin', 'super-admin'), deleteCertificate);

router.post('/:id/duplicate', protect, authRole('admin', 'super-admin'), duplicateCertificate);

module.exports = router;

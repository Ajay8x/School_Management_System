const mongoose = require('mongoose');

const idCardTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  for: { type: String, enum: ['Student', 'Teacher', 'Staff', 'Other'], default: 'Student' },
  customTemplateFileName: { type: String, default: 'IDCARDI-new' },
  layout: { type: String, enum: ['Portrait', 'Landscape'], default: 'Portrait font-sans' },
  dimensions: { type: String, default: 'Standard CR80' },
  headerBgColor: { type: String, default: '#0f172a' },
  headerTextColor: { type: String, default: '#ffffff' },
  cardBgColor: { type: String, default: '#ffffff' },
  schoolTitle: { type: String, default: 'ROYAL INTERNATIONAL ACADEMY' },
  subTitle: { type: String, default: 'STUDENT IDENTITY CARD' },
  showLogo: { type: Boolean, default: true },
  showPhoto: { type: Boolean, default: true },
  showRollNo: { type: Boolean, default: true },
  showClassCourse: { type: Boolean, default: true },
  showBatchSection: { type: Boolean, default: true },
  showDob: { type: Boolean, default: true },
  showBloodGroup: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: true },
  showEmergencyContact: { type: Boolean, default: true },
  showAddress: { type: Boolean, default: true },
  showBarcode: { type: Boolean, default: true },
  showSignature: { type: Boolean, default: true },
  signatureTitle: { type: String, default: 'Principal' },
  termsText: { type: String, default: 'This ID card is property of the institution. If found, please return to the school administration office.' },
  createdAt: { type: Date, default: Date.now }
});

idCardTemplateSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
idCardTemplateSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('IdCardTemplate', idCardTemplateSchema);

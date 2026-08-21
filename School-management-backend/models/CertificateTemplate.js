const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Transfer Certificate' },
  applicableFor: { type: String, enum: ['Student', 'Staff', 'Other'], default: 'Student' },
  headerText: { type: String, default: 'TRANSFER CERTIFICATE' },
  subHeader: { type: String, default: 'TO WHOM IT MAY CONCERN' },
  bodyText: { type: String, default: 'This is to certify that {{student_name}}, son/daughter of {{father_name}}, was a student of this institution. His/Her conduct and character during the stay in the school has been satisfactory.' },
  leftSignatureTitle: { type: String, default: 'Class Teacher' },
  rightSignatureTitle: { type: String, default: 'Principal' },
  backgroundStyle: { type: String, enum: ['Classic', 'Modern', 'Elegant', 'Minimalist'], default: 'Classic' },
  createdAt: { type: Date, default: Date.now }
});

certificateTemplateSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
certificateTemplateSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);

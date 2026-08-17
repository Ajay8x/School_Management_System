const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  name: { type: String, required: true }, date: { type: Date },
  createdAt: { type: Date, default: Date.now }
});


examinationSchema.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });
examinationSchema.plugin(require('../plugins/tenantPlugin'));

module.exports = mongoose.model('Examination', examinationSchema);

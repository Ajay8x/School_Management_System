const mongoose = require('mongoose');

const studentConfigSchema = new mongoose.Schema({
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    index: true 
  },
  regPrefix: { type: String, default: 'Reg-' },
  regDigit: { type: Number, default: 4 },
  regSuffix: { type: String, default: '' },
  admPrefix: { type: String, default: 'Adm-' },
  admDigit: { type: Number, default: 4 },
  admSuffix: { type: String, default: '' },
  trPrefix: { type: String, default: 'TR-' },
  trDigit: { type: Number, default: 3 },
  trSuffix: { type: String, default: '' },
  tnPrefix: { type: String, default: 'TN-' },
  tnDigit: { type: Number, default: 3 },
  tnSuffix: { type: String, default: '' },

  enableProvisionalAdmission: { type: Boolean, default: false },
  enableRollSort: { type: Boolean, default: true },
  enableAdmissionDate: { type: Boolean, default: true },
  allowEditRequest: { type: Boolean, default: true },
  allowParentPrefix: { type: Boolean, default: false },
  enableUniqueIdPrefix: { type: Boolean, default: false },

  attendancePastDays: { type: Number, default: 60 },
  enableAttendanceSms: { type: Boolean, default: false },
  enableAttendanceThreshold: { type: Boolean, default: false },
  enableAbsenceNotification: { type: Boolean, default: true },

  lateFeeBasis: { type: String, default: 'late fee on due date' },
  allowFlexibleInstallment: { type: Boolean, default: true },
  allowMultipleInstallment: { type: Boolean, default: true },
  enableAllDuePayment: { type: Boolean, default: false },
  allowPartialPayment: { type: Boolean, default: true },
  installmentChooseMethod: { type: String, default: 'fee group sequence' },
  allowBalanceFeeReceipt: { type: Boolean, default: true },

  forceTransferApproval: { type: Boolean, default: true },

  servicePrefix: { type: String, default: 'SR-' },
  serviceDigit: { type: Number, default: 4 },
  serviceSuffix: { type: String, default: '' },
  serviceInstructions: { type: String, default: '' },
  paymentType: { type: String, default: 'Amount Based Payment' }
}, { timestamps: true });

module.exports = mongoose.model('StudentConfig', studentConfigSchema);

const mongoose = require('mongoose');

const defaultModulesConfig = {
  reception: {
    enabled: true,
    submodules: {
      enquiry: true,
      visitorLog: true,
      gatePass: true,
      complaint: true,
      correspondence: true,
      callLog: true,
      query: true
    }
  },
  student: {
    enabled: true,
    submodules: {
      registration: true,
      rollNumber: true,
      photo: true,
      healthRecord: true,
      electiveSubject: true,
      attendance: true,
      feeAllocation: true,
      serviceAllocation: true,
      promotion: true,
      editRequest: true,
      serviceRequest: true,
      leaveRequest: true,
      transferRequest: true,
      transfer: true,
      alumni: true,
      report: true
    }
  },
  teachers: {
    enabled: true,
    submodules: {
      teacherList: true,
      addTeacher: true
    }
  },
  guardians: {
    enabled: true,
    submodules: {
      guardianList: true,
      addGuardian: true
    }
  },
  academic: {
    enabled: true,
    submodules: {
      classRoutine: true,
      section: true,
      subject: true,
      classGroup: true,
      syllabus: true,
      classAssign: true,
      teacherAllocation: true,
      bookList: true,
      certificate: true,
      allLevel: true
    }
  },
  finance: {
    enabled: true,
    submodules: {
      paymentMethod: true,
      feeType: true,
      feeGroup: true,
      feeComponent: true,
      fineGeneration: true,
      feeAllocation: true,
      ledgerType: true,
      ledger: true,
      fee: true,
      transaction: true,
      receipt: true,
      report: true
    }
  },
  exam: {
    enabled: true,
    submodules: {
      gradeScale: true,
      examTerm: true,
      markDistribution: true,
      classworkAssessment: true,
      competencyAssessment: true,
      examSchedule: true,
      tabulationSheet: true,
      marks: true,
      report: true
    }
  },
  employee: {
    enabled: true,
    submodules: {
      department: true,
      designation: true,
      attendance: true,
      leave: true,
      payroll: true,
      subResource: true
    }
  },
  library: {
    enabled: true,
    submodules: {
      bookList: true,
      borrowLog: true,
      assignment: true,
      lessonPlan: true,
      syllabus: true,
      homework: true,
      learningMaterial: true,
      download: true
    }
  },
  accounts: {
    enabled: true,
    submodules: {
      income: true,
      expense: true,
      invoice: true,
      report: true
    }
  },
  attendance: {
    enabled: true,
    submodules: {
      studentAttendance: true,
      employeeAttendance: true,
      report: true
    }
  },
  leaves: {
    enabled: true,
    submodules: {
      applyLeave: true,
      leaveTypes: true,
      leaveRequests: true
    }
  },
  certificate: {
    enabled: true,
    submodules: {
      studentCertificate: true,
      idCard: true,
      template: true
    }
  },
  transport: {
    enabled: true,
    submodules: {
      routes: true,
      vehicles: true,
      assignTransport: true
    }
  },
  communication: {
    enabled: true,
    submodules: {
      noticeBoard: true,
      events: true,
      messages: true,
      smsConfig: true,
      whatsAppConfig: true
    }
  },
  settings: {
    enabled: true,
    submodules: {
      generalConfig: true,
      userLimits: true,
      authentication: true,
      customField: true,
      rolesPermissions: true
    }
  }
};

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a school name'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  tagline: {
    type: String,
    default: 'Excellence in Education'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  modules: {
    type: mongoose.Schema.Types.Mixed,
    default: defaultModulesConfig
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('School', schoolSchema);
module.exports.defaultModulesConfig = defaultModulesConfig;

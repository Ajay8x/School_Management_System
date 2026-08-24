const mongoose = require('mongoose');

const defaultModulesConfig = {
  reception: {
    enabled: true,
    submodules: {
      enquiry: true,
      visitorLog: true,
      gatePass: true,
      complaint: true,
      callLog: true,
      correspondence: true
    }
  },
  store: {
    enabled: true,
    submodules: {
      storeSaleSale: true
    }
  },
  blog: {
    enabled: true,
    submodules: {
    }
  },
  news: {
    enabled: true,
    submodules: {
    }
  },
  task: {
    enabled: true,
    submodules: {
    }
  },
  helpdesk: {
    enabled: true,
    submodules: {
      fAQ: true,
      ticket: true
    }
  },
  academic: {
    enabled: true,
    submodules: {
      department: true,
      program: true,
      period: true,
      session: true,
      division: true,
      course: true,
      batch: true,
      subject: true,
      classTiming: true,
      timetable: true,
      bookList: true,
      certificate: true,
      iDCard: true
    }
  },
  student: {
    enabled: true,
    submodules: {
      registration: true,
      rollNumber: true,
      healthRecord: true,
      electiveSubject: true,
      attendance: true,
      feeAllocation: true,
      promotion: true,
      editRequest: true,
      leaveRequest: true,
      transferRequest: true,
      transfer: true,
      alumni: true,
      report: true
    }
  },
  finance: {
    enabled: true,
    submodules: {
      paymentMethod: true,
      feeGroup: true,
      feeHead: true,
      feeComponent: true,
      feeConcession: true,
      feeStructure: true,
      ledgerType: true,
      ledger: true,
      tax: true,
      transaction: true,
      receipt: true,
      report: true
    }
  },
  exam: {
    enabled: true,
    submodules: {
      examTerm: true,
      examGrade: true,
      examAssessment: true,
      observationParameter: true,
      competencyParameter: true,
      examSchedule: true,
      examForm: true,
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
      editRequest: true
    }
  },
  resource: {
    enabled: true,
    submodules: {
      bookList: true,
      studentDiary: true,
      assignment: true,
      lessonPlan: true,
      syllabus: true,
      onlineClass: true,
      learningMaterial: true,
      download: true
    }
  },
  transport: {
    enabled: true,
    submodules: {
      transportRoute: true,
      transportCircle: true,
      transportFee: true,
      vehicle: true
    }
  },
  calendar: {
    enabled: true,
    submodules: {
      holiday: true,
      celebration: true,
      event: true
    }
  },
  gallery: {
    enabled: true,
    submodules: {
    }
  },
  discipline: {
    enabled: true,
    submodules: {
      incident: true
    }
  },
  guardian: {
    enabled: true,
    submodules: {
    }
  },
  approval: {
    enabled: true,
    submodules: {
      type: true,
      request: true,
      pendingRequests: true,
      processedRequests: true
    }
  },
  contact: {
    enabled: true,
    submodules: {
    }
  },
  mess: {
    enabled: true,
    submodules: {
      menu: true,
      meal: true,
      mealLog: true
    }
  },
  inventory: {
    enabled: true,
    submodules: {
      stockCategory: true,
      stockItem: true,
      stockRequisition: true,
      stockPurchase: true,
      stockTransfer: true,
      stockAdjustment: true
    }
  },
  communication: {
    enabled: true,
    submodules: {
      announcement: true,
      email: true,
      sMS: true
    }
  },
  library: {
    enabled: true,
    submodules: {
      book: true,
      bookAddition: true,
      transaction: true
    }
  },
  activity: {
    enabled: true,
    submodules: {
      trip: true
    }
  },
  hostel: {
    enabled: true,
    submodules: {
      hostel: true,
      roomAllocation: true
    }
  },
  form: {
    enabled: true,
    submodules: {
    }
  },
  asset: {
    enabled: true,
    submodules: {
      building: true
    }
  },
  site: {
    enabled: true,
    submodules: {
      page: true,
      menu: true,
      block: true
    }
  },
  recruitment: {
    enabled: true,
    submodules: {
      jobVacancy: true,
      jobApplication: true
    }
  },
  customField: {
    enabled: true,
    submodules: {
    }
  },
  user: {
    enabled: true,
    submodules: {
    }
  }
};

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a school name'],
    trim: true
  },
  appName: {
    type: String,
    default: 'Campus Pilot',
    trim: true
  },
  footerText: {
    type: String,
    default: 'Campus Pilot',
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
  description: {
    type: String,
    default: 'Innovative Partner'
  },
  metaAuthor: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    default: ''
  },
  metaKeywords: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  addressLine1: {
    type: String,
    default: ''
  },
  addressLine2: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  zipcode: {
    type: String,
    default: ''
  },
  country: {
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
  fax: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  financialYearCode: {
    type: String,
    default: ''
  },
  title1: { type: String, default: '' },
  title2: { type: String, default: '' },
  title3: { type: String, default: '' },
  identifiers: { type: mongoose.Schema.Types.Mixed, default: [] },
  inchargeDetails: { type: mongoose.Schema.Types.Mixed, default: [] },
  logoUrl: {
    type: String,
    default: ''
  },
  assets: {
    guestBackground: { type: String, default: '' },
    guestFullPageBackground: { type: String, default: '' },
    logo: { type: String, default: '' },
    logoLight: { type: String, default: '' },
    icon: { type: String, default: '' },
    iconLight: { type: String, default: '' },
    favicon: { type: String, default: '' }
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

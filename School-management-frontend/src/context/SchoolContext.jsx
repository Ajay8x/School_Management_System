import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const SchoolContext = createContext();

// All 14 categories matching exact system architecture & screenshot specifications
export const DEFAULT_MODULES_CONFIG = {
  reception: {
    enabled: true,
    title: 'Reception',
    roles: { admin: true, teacher: true, student: false, parent: false, accountant: false, librarian: false },
    submodules: {
      enquiry: { name: 'Enquiry', enabled: true, roles: { admin: true, teacher: true, student: false, parent: false } },
      visitorLog: { name: 'Visitor Log', enabled: true, roles: { admin: true, teacher: false, student: false, parent: false } },
      gatePass: { name: 'Gate Pass', enabled: true, roles: { admin: true, teacher: true, student: false, parent: false } },
      complaint: { name: 'Complaint', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } },
      callLog: { name: 'Call Log', enabled: false, roles: { admin: true, teacher: false, student: false, parent: false } },
      correspondence: { name: 'Correspondence', enabled: true, roles: { admin: true, teacher: false, student: false, parent: false } }
    }
  },
  academic: {
    enabled: true,
    title: 'Academic',
    roles: { admin: true, teacher: true, student: true, parent: true, accountant: false, librarian: false },
    submodules: {
      department: { name: 'Department', enabled: true, roles: { admin: true, teacher: true, student: false } },
      program: { name: 'Program', enabled: true, roles: { admin: true, teacher: true, student: false } },
      period: { name: 'Period', enabled: true, roles: { admin: true, teacher: true, student: true } },
      session: { name: 'Session', enabled: true, roles: { admin: true, teacher: true, student: true } },
      division: { name: 'Division', enabled: true, roles: { admin: true, teacher: true, student: false } },
      course: { name: 'Course', enabled: true, roles: { admin: true, teacher: true, student: true } },
      batch: { name: 'Batch', enabled: true, roles: { admin: true, teacher: true, student: true } },
      subject: { name: 'Subject', enabled: true, roles: { admin: true, teacher: true, student: true } },
      classTiming: { name: 'Class Timing', enabled: true, roles: { admin: true, teacher: true, student: true } },
      timetable: { name: 'Timetable', enabled: true, roles: { admin: true, teacher: true, student: true } },
      bookList: { name: 'Book list', enabled: true, roles: { admin: true, teacher: true, student: true } },
      certificate: { name: 'Certificate', enabled: true, roles: { admin: true, teacher: false, student: false } },
      idCard: { name: 'ID Card', enabled: true, roles: { admin: true, teacher: true, student: true } }
    }
  },
  student: {
    enabled: true,
    title: 'Student',
    roles: { admin: true, teacher: true, student: true, parent: true, accountant: false, librarian: false },
    submodules: {
      registration: { name: 'Registration', enabled: true, roles: { admin: true, teacher: false, student: false } },
      rollNumber: { name: 'Roll Number', enabled: true, roles: { admin: true, teacher: true, student: true } },
      healthRecord: { name: 'Health Record', enabled: true, roles: { admin: true, teacher: true, student: true } },
      electiveSubject: { name: 'Elective Subject', enabled: true, roles: { admin: true, teacher: true, student: true } },
      attendance: { name: 'Attendance', enabled: true, roles: { admin: true, teacher: true, student: true } },
      feeAllocation: { name: 'Fee Allocation', enabled: true, roles: { admin: true, teacher: false, student: false } },
      promotion: { name: 'Promotion', enabled: true, roles: { admin: true, teacher: false, student: false } },
      editRequest: { name: 'Edit Request', enabled: true, roles: { admin: true, teacher: true, student: true } },
      leaveRequest: { name: 'Leave Request', enabled: true, roles: { admin: true, teacher: true, student: true } },
      transferRequest: { name: 'Transfer Request', enabled: true, roles: { admin: true, teacher: false, student: false } },
      transfer: { name: 'Transfer', enabled: true, roles: { admin: true, teacher: false, student: false } },
      alumni: { name: 'Alumni', enabled: true, roles: { admin: true, teacher: false, student: false } },
      report: { name: 'Report', enabled: true, roles: { admin: true, teacher: true, student: false } }
    }
  },
  finance: {
    enabled: true,
    title: 'Finance',
    roles: { admin: true, teacher: false, student: false, parent: true, accountant: true, librarian: false },
    submodules: {
      paymentMethod: { name: 'Payment Method', enabled: true, roles: { admin: true, accountant: true } },
      feeGroup: { name: 'Fee Group', enabled: true, roles: { admin: true, accountant: true } },
      feeHead: { name: 'Fee Head', enabled: true, roles: { admin: true, accountant: true } },
      feeComponent: { name: 'Fee Component', enabled: true, roles: { admin: true, accountant: true } },
      feeConcession: { name: 'Fee Concession', enabled: true, roles: { admin: true, accountant: true } },
      feeStructure: { name: 'Fee Structure', enabled: true, roles: { admin: true, accountant: true } },
      ledgerType: { name: 'Ledger Type', enabled: true, roles: { admin: true, accountant: true } },
      ledger: { name: 'Ledger', enabled: true, roles: { admin: true, accountant: true } },
      tax: { name: 'Tax', enabled: true, roles: { admin: true, accountant: true } },
      transaction: { name: 'Transaction', enabled: true, roles: { admin: true, accountant: true } },
      receipt: { name: 'Receipt', enabled: true, roles: { admin: true, parent: true, accountant: true } },
      report: { name: 'Report', enabled: true, roles: { admin: true, accountant: true } }
    }
  },
  exam: {
    enabled: true,
    title: 'Exam',
    roles: { admin: true, teacher: true, student: true, parent: true, accountant: false, librarian: false },
    submodules: {
      examTerm: { name: 'Exam Term', enabled: true, roles: { admin: true, teacher: true, student: true } },
      examGrade: { name: 'Exam Grade', enabled: true, roles: { admin: true, teacher: true, student: true } },
      examAssessment: { name: 'Exam Assessment', enabled: true, roles: { admin: true, teacher: true, student: true } },
      observationParameter: { name: 'Observation Parameter', enabled: true, roles: { admin: true, teacher: true } },
      competencyParameter: { name: 'Competency Parameter', enabled: true, roles: { admin: true, teacher: true } },
      examSchedule: { name: 'Exam Schedule', enabled: true, roles: { admin: true, teacher: true, student: true } },
      examForm: { name: 'Exam Form', enabled: true, roles: { admin: true, teacher: true, student: true } },
      report: { name: 'Report', enabled: true, roles: { admin: true, teacher: true, student: true } }
    }
  },
  employee: {
    enabled: true,
    title: 'Employee',
    roles: { admin: true, teacher: true, student: false, parent: false, accountant: true, librarian: false },
    submodules: {
      department: { name: 'Department', enabled: true, roles: { admin: true } },
      designation: { name: 'Designation', enabled: true, roles: { admin: true } },
      attendance: { name: 'Attendance', enabled: true, roles: { admin: true, teacher: true } },
      leave: { name: 'Leave', enabled: true, roles: { admin: true, teacher: true } },
      payroll: { name: 'Payroll', enabled: true, roles: { admin: true, accountant: true } },
      editRequest: { name: 'Edit Request', enabled: true, roles: { admin: true, teacher: true } }
    }
  },
  resource: {
    enabled: true,
    title: 'Resource',
    roles: { admin: true, teacher: true, student: true, parent: true, accountant: false, librarian: true },
    submodules: {
      bookList: { name: 'Book List', enabled: true, roles: { admin: true, teacher: true, student: true, librarian: true } },
      studentDiary: { name: 'Student Diary', enabled: true, roles: { admin: true, teacher: true, student: true } },
      assignment: { name: 'Assignment', enabled: true, roles: { admin: true, teacher: true, student: true } },
      lessonPlan: { name: 'Lesson Plan', enabled: true, roles: { admin: true, teacher: true } },
      syllabus: { name: 'Syllabus', enabled: true, roles: { admin: true, teacher: true, student: true } },
      onlineClass: { name: 'Online Class', enabled: true, roles: { admin: true, teacher: true, student: true } },
      learningMaterial: { name: 'Learning Material', enabled: true, roles: { admin: true, teacher: true, student: true } },
      download: { name: 'Download', enabled: true, roles: { admin: true, teacher: true, student: true } }
    }
  },
  store: {
    enabled: true,
    title: 'Store',
    roles: { admin: true, teacher: false, student: false, parent: false, accountant: true, librarian: false },
    submodules: {
      sale: { name: 'store.sale.sale', enabled: true, roles: { admin: true, accountant: true } }
    }
  },
  blog: {
    enabled: true,
    title: 'Blog',
    roles: { admin: true, teacher: true, student: true, parent: true },
    submodules: {}
  },
  news: {
    enabled: true,
    title: 'News',
    roles: { admin: true, teacher: true, student: true, parent: true },
    submodules: {}
  },
  task: {
    enabled: true,
    title: 'Task',
    roles: { admin: true, teacher: true, student: true },
    submodules: {}
  },
  helpdesk: {
    enabled: true,
    title: 'Helpdesk',
    roles: { admin: true, teacher: true, student: true, parent: true },
    submodules: {
      faq: { name: 'FAQ', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } },
      ticket: { name: 'Ticket', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } }
    }
  },
  utility: {
    enabled: true,
    title: 'Utility',
    roles: { admin: true, teacher: true, student: true, parent: true, accountant: true, librarian: true },
    submodules: {
      activityLog: { name: 'Activity Log', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true, accountant: true, librarian: true } },
      config: { name: 'Config', enabled: true, roles: { admin: true, teacher: true } }
    }
  },
  communication: {
    enabled: true,
    title: 'Communication',
    roles: { admin: true, teacher: true, student: true, parent: true },
    submodules: {
      noticeBoard: { name: 'Notice Board', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } },
      event: { name: 'Event', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } },
      message: { name: 'Message', enabled: true, roles: { admin: true, teacher: true, student: true, parent: true } }
    }
  }
};

const DEFAULT_SCHOOLS = [
  { 
    _id: 'school_1', 
    name: 'Demo International School',
    appName: 'Campus Tracker',
    description: 'Innovative Partner',
    metaAuthor: 'CampusTracker',
    metaDescription: 'Application by campustracker',
    metaKeywords: 'campustracker',
    addressLine1: 'Campus Tracker Campus',
    addressLine2: 'Near BLW',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    zipcode: '221005',
    country: 'India',
    email: 'help.chbs@gmail.com',
    phone: '+919935332556',
    fax: 'Fax',
    website: 'https://campustracker.in',
    financialYearCode: '2025-2026',
    code: 'DIS001', 
    isDefault: true, 
    assets: {
      guestBackground: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1920&q=80',
      guestFullPageBackground: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      logo: '',
      logoLight: '',
      icon: '',
      iconLight: '',
      favicon: ''
    },
    modules: DEFAULT_MODULES_CONFIG 
  },
  { 
    _id: 'school_2', 
    name: 'CampusTracker School', 
    appName: 'Campus Tracker',
    description: 'Innovative Partner',
    metaAuthor: 'CampusTracker',
    metaDescription: 'Application by campustracker',
    metaKeywords: 'campustracker',
    addressLine1: 'Campus Tracker Main Branch',
    addressLine2: 'Near BLW',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    zipcode: '221005',
    country: 'India',
    email: 'help.chbs@gmail.com',
    phone: '+919935332556',
    fax: 'Fax',
    website: 'https://campustracker.in',
    financialYearCode: '2025-2026',
    code: 'CTS002', 
    isDefault: false, 
    assets: {
      guestBackground: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1920&q=80',
      guestFullPageBackground: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
      logo: '',
      logoLight: '',
      icon: '',
      iconLight: '',
      favicon: ''
    },
    modules: DEFAULT_MODULES_CONFIG 
  }
];

export const SchoolProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [schools, setSchools] = useState(DEFAULT_SCHOOLS);
  const [currentSchool, setCurrentSchool] = useState(() => {
    const saved = localStorage.getItem('active_school');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_SCHOOLS[0];
  });
  const [loading, setLoading] = useState(false);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await API.get('/schools');
      if (res.data && res.data.length > 0) {
        setSchools(res.data);
        const activeId = localStorage.getItem('active_school_id');
        const found = res.data.find(s => s._id === activeId) || res.data.find(s => s.isDefault) || res.data[0];
        setCurrentSchool(found);
        localStorage.setItem('active_school_id', found._id);
        localStorage.setItem('active_school', JSON.stringify(found));
      }
    } catch (err) {
      console.warn('Could not fetch schools from backend, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchools();
    }
  }, [user]);

  const switchSchool = (schoolOrId) => {
    let target = typeof schoolOrId === 'string' ? schools.find(s => s._id === schoolOrId) : schoolOrId;
    if (target) {
      setCurrentSchool(target);
      localStorage.setItem('active_school_id', target._id);
      localStorage.setItem('active_school', JSON.stringify(target));
      window.dispatchEvent(new CustomEvent('school-switched', { detail: { schoolId: target._id, school: target } }));
    }
  };

  const updateSchoolModules = async (schoolId, newModules) => {
    try {
      await API.put(`/schools/${schoolId}/modules`, { modules: newModules });
    } catch (err) {
      console.warn('Backend update failed or running offline, saving in local state:', err);
    }

    setSchools(prev => prev.map(s => s._id === schoolId ? { ...s, modules: newModules } : s));
    if (currentSchool && currentSchool._id === schoolId) {
      const updated = { ...currentSchool, modules: newModules };
      setCurrentSchool(updated);
      localStorage.setItem('active_school', JSON.stringify(updated));
    }
  };

  const createSchool = async (schoolData) => {
    try {
      const res = await API.post('/schools', schoolData);
      setSchools(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      const newSchool = {
        _id: 'school_' + Date.now(),
        ...schoolData,
        modules: schoolData.modules || DEFAULT_MODULES_CONFIG
      };
      setSchools(prev => [...prev, newSchool]);
      return newSchool;
    }
  };

  const updateSchool = async (schoolId, schoolData) => {
    try {
      const res = await API.put(`/schools/${schoolId}`, schoolData);
      setSchools(prev => prev.map(s => s._id === schoolId ? res.data : s));
      if (currentSchool?._id === schoolId) {
        setCurrentSchool(res.data);
        localStorage.setItem('active_school', JSON.stringify(res.data));
      }
      return res.data;
    } catch (err) {
      setSchools(prev => prev.map(s => s._id === schoolId ? { ...s, ...schoolData } : s));
      if (currentSchool?._id === schoolId) {
        const updated = { ...currentSchool, ...schoolData };
        setCurrentSchool(updated);
        localStorage.setItem('active_school', JSON.stringify(updated));
      }
    }
  };

  const deleteSchool = async (schoolId) => {
    try {
      await API.delete(`/schools/${schoolId}`);
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err);
    }
    const filtered = schools.filter(s => s._id !== schoolId);
    setSchools(filtered);
    if (currentSchool?._id === schoolId && filtered.length > 0) {
      switchSchool(filtered[0]);
    }
  };

  // Check if a module or submodule is enabled for a given role (or active user)
  const isModuleEnabled = (moduleKey, subModuleKey = null, userRole = null) => {
    const key = String(moduleKey).toLowerCase().replace(/\s+/g, '');
    const modules = currentSchool?.modules || DEFAULT_MODULES_CONFIG;
    
    const targetModule = modules[key] || modules[moduleKey];
    if (!targetModule) return true; // Default to true if not specified

    if (typeof targetModule === 'boolean') return targetModule;
    if (targetModule.enabled === false) return false;

    // Role-level override check
    const checkRole = userRole || user?.role;
    if (checkRole && targetModule.roles && targetModule.roles[checkRole] === false) {
      return false;
    }

    // Check submodule
    if (subModuleKey && targetModule.submodules) {
      const sub = targetModule.submodules[subModuleKey];
      if (typeof sub === 'boolean') return sub;
      if (sub) {
        if (sub.enabled === false) return false;
        if (checkRole && sub.roles && sub.roles[checkRole] === false) return false;
      }
    }

    return true;
  };

  return (
    <SchoolContext.Provider value={{
      schools,
      currentSchool,
      loading,
      switchSchool,
      fetchSchools,
      updateSchoolModules,
      createSchool,
      updateSchool,
      deleteSchool,
      isModuleEnabled,
      defaultModulesConfig: DEFAULT_MODULES_CONFIG
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

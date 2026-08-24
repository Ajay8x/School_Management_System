import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const SchoolContext = createContext();

const rolesTemplate = { 
  Admin: true, Accountant: false, 'Attendance Assistant': false, 'Exam Incharge': false,
  Guardian: false, 'Hostel Incharge': false, 'Inventory Incharge': false, Librarian: false,
  Manager: false, 'Mess Incharge': false, Observer: false, Principal: false, Receptionist: false,
  Staff: false, Student: false, 'Transport Incharge': false, User: false, 'Vice Principal': false 
};


export const DEFAULT_MODULES_CONFIG = {
  reception: {
    enabled: true,
    title: 'Reception',
    roles: { ...rolesTemplate },
    submodules: {
      enquiry: { name: 'Enquiry', enabled: true, roles: { ...rolesTemplate } },
      visitorLog: { name: 'Visitor Log', enabled: true, roles: { ...rolesTemplate } },
      gatePass: { name: 'Gate Pass', enabled: true, roles: { ...rolesTemplate } },
      complaint: { name: 'Complaint', enabled: true, roles: { ...rolesTemplate } },
      callLog: { name: 'Call Log', enabled: true, roles: { ...rolesTemplate } },
      correspondence: { name: 'Correspondence', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  store: {
    enabled: true,
    title: 'Store',
    roles: { ...rolesTemplate },
    submodules: {
      storeSaleSale: { name: 'store.sale.sale', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  blog: {
    enabled: true,
    title: 'Blog',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  news: {
    enabled: true,
    title: 'News',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  task: {
    enabled: true,
    title: 'Task',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  helpdesk: {
    enabled: true,
    title: 'Helpdesk',
    roles: { ...rolesTemplate },
    submodules: {
      fAQ: { name: 'FAQ', enabled: true, roles: { ...rolesTemplate } },
      ticket: { name: 'Ticket', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  academic: {
    enabled: true,
    title: 'Academic',
    roles: { ...rolesTemplate },
    submodules: {
      department: { name: 'Department', enabled: true, roles: { ...rolesTemplate } },
      program: { name: 'Program', enabled: true, roles: { ...rolesTemplate } },
      period: { name: 'Period', enabled: true, roles: { ...rolesTemplate } },
      session: { name: 'Session', enabled: true, roles: { ...rolesTemplate } },
      division: { name: 'Division', enabled: true, roles: { ...rolesTemplate } },
      course: { name: 'Course', enabled: true, roles: { ...rolesTemplate } },
      batch: { name: 'Batch', enabled: true, roles: { ...rolesTemplate } },
      subject: { name: 'Subject', enabled: true, roles: { ...rolesTemplate } },
      classTiming: { name: 'Class Timing', enabled: true, roles: { ...rolesTemplate } },
      timetable: { name: 'Timetable', enabled: true, roles: { ...rolesTemplate } },
      bookList: { name: 'Book list', enabled: true, roles: { ...rolesTemplate } },
      certificate: { name: 'Certificate', enabled: true, roles: { ...rolesTemplate } },
      iDCard: { name: 'ID Card', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  student: {
    enabled: true,
    title: 'Student',
    roles: { ...rolesTemplate },
    submodules: {
      registration: { name: 'Registration', enabled: true, roles: { ...rolesTemplate } },
      rollNumber: { name: 'Roll Number', enabled: true, roles: { ...rolesTemplate } },
      healthRecord: { name: 'Health Record', enabled: true, roles: { ...rolesTemplate } },
      electiveSubject: { name: 'Elective Subject', enabled: true, roles: { ...rolesTemplate } },
      attendance: { name: 'Attendance', enabled: true, roles: { ...rolesTemplate } },
      feeAllocation: { name: 'Fee Allocation', enabled: true, roles: { ...rolesTemplate } },
      promotion: { name: 'Promotion', enabled: true, roles: { ...rolesTemplate } },
      editRequest: { name: 'Edit Request', enabled: true, roles: { ...rolesTemplate } },
      leaveRequest: { name: 'Leave Request', enabled: true, roles: { ...rolesTemplate } },
      transferRequest: { name: 'Transfer Request', enabled: true, roles: { ...rolesTemplate } },
      transfer: { name: 'Transfer', enabled: true, roles: { ...rolesTemplate } },
      alumni: { name: 'Alumni', enabled: true, roles: { ...rolesTemplate } },
      report: { name: 'Report', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  finance: {
    enabled: true,
    title: 'Finance',
    roles: { ...rolesTemplate },
    submodules: {
      paymentMethod: { name: 'Payment Method', enabled: true, roles: { ...rolesTemplate } },
      feeGroup: { name: 'Fee Group', enabled: true, roles: { ...rolesTemplate } },
      feeHead: { name: 'Fee Head', enabled: true, roles: { ...rolesTemplate } },
      feeComponent: { name: 'Fee Component', enabled: true, roles: { ...rolesTemplate } },
      feeConcession: { name: 'Fee Concession', enabled: true, roles: { ...rolesTemplate } },
      feeStructure: { name: 'Fee Structure', enabled: true, roles: { ...rolesTemplate } },
      ledgerType: { name: 'Ledger Type', enabled: true, roles: { ...rolesTemplate } },
      ledger: { name: 'Ledger', enabled: true, roles: { ...rolesTemplate } },
      tax: { name: 'Tax', enabled: true, roles: { ...rolesTemplate } },
      transaction: { name: 'Transaction', enabled: true, roles: { ...rolesTemplate } },
      receipt: { name: 'Receipt', enabled: true, roles: { ...rolesTemplate } },
      report: { name: 'Report', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  exam: {
    enabled: true,
    title: 'Exam',
    roles: { ...rolesTemplate },
    submodules: {
      examTerm: { name: 'Exam Term', enabled: true, roles: { ...rolesTemplate } },
      examGrade: { name: 'Exam Grade', enabled: true, roles: { ...rolesTemplate } },
      examAssessment: { name: 'Exam Assessment', enabled: true, roles: { ...rolesTemplate } },
      observationParameter: { name: 'Observation Parameter', enabled: true, roles: { ...rolesTemplate } },
      competencyParameter: { name: 'Competency Parameter', enabled: true, roles: { ...rolesTemplate } },
      examSchedule: { name: 'Exam Schedule', enabled: true, roles: { ...rolesTemplate } },
      examForm: { name: 'Exam Form', enabled: true, roles: { ...rolesTemplate } },
      report: { name: 'Report', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  employee: {
    enabled: true,
    title: 'Employee',
    roles: { ...rolesTemplate },
    submodules: {
      department: { name: 'Department', enabled: true, roles: { ...rolesTemplate } },
      designation: { name: 'Designation', enabled: true, roles: { ...rolesTemplate } },
      attendance: { name: 'Attendance', enabled: true, roles: { ...rolesTemplate } },
      leave: { name: 'Leave', enabled: true, roles: { ...rolesTemplate } },
      payroll: { name: 'Payroll', enabled: true, roles: { ...rolesTemplate } },
      editRequest: { name: 'Edit Request', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  resource: {
    enabled: true,
    title: 'Resource',
    roles: { ...rolesTemplate },
    submodules: {
      bookList: { name: 'Book List', enabled: true, roles: { ...rolesTemplate } },
      studentDiary: { name: 'Student Diary', enabled: true, roles: { ...rolesTemplate } },
      assignment: { name: 'Assignment', enabled: true, roles: { ...rolesTemplate } },
      lessonPlan: { name: 'Lesson Plan', enabled: true, roles: { ...rolesTemplate } },
      syllabus: { name: 'Syllabus', enabled: true, roles: { ...rolesTemplate } },
      onlineClass: { name: 'Online Class', enabled: true, roles: { ...rolesTemplate } },
      learningMaterial: { name: 'Learning Material', enabled: true, roles: { ...rolesTemplate } },
      download: { name: 'Download', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  transport: {
    enabled: true,
    title: 'Transport',
    roles: { ...rolesTemplate },
    submodules: {
      transportRoute: { name: 'Transport Route', enabled: true, roles: { ...rolesTemplate } },
      transportCircle: { name: 'Transport Circle', enabled: true, roles: { ...rolesTemplate } },
      transportFee: { name: 'Transport Fee', enabled: true, roles: { ...rolesTemplate } },
      vehicle: { name: 'Vehicle', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  calendar: {
    enabled: true,
    title: 'Calendar',
    roles: { ...rolesTemplate },
    submodules: {
      holiday: { name: 'Holiday', enabled: true, roles: { ...rolesTemplate } },
      celebration: { name: 'Celebration', enabled: true, roles: { ...rolesTemplate } },
      event: { name: 'Event', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  gallery: {
    enabled: true,
    title: 'Gallery',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  discipline: {
    enabled: true,
    title: 'Discipline',
    roles: { ...rolesTemplate },
    submodules: {
      incident: { name: 'Incident', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  guardian: {
    enabled: true,
    title: 'Guardian',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  approval: {
    enabled: true,
    title: 'Approval',
    roles: { ...rolesTemplate },
    submodules: {
      type: { name: 'Type', enabled: true, roles: { ...rolesTemplate } },
      request: { name: 'Request', enabled: true, roles: { ...rolesTemplate } },
      pendingRequests: { name: 'Pending Requests', enabled: true, roles: { ...rolesTemplate } },
      processedRequests: { name: 'Processed Requests', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  contact: {
    enabled: true,
    title: 'Contact',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  mess: {
    enabled: true,
    title: 'Mess',
    roles: { ...rolesTemplate },
    submodules: {
      menu: { name: 'Menu', enabled: true, roles: { ...rolesTemplate } },
      meal: { name: 'Meal', enabled: true, roles: { ...rolesTemplate } },
      mealLog: { name: 'Meal Log', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  inventory: {
    enabled: true,
    title: 'Inventory',
    roles: { ...rolesTemplate },
    submodules: {
      stockCategory: { name: 'Stock Category', enabled: true, roles: { ...rolesTemplate } },
      stockItem: { name: 'Stock Item', enabled: true, roles: { ...rolesTemplate } },
      stockRequisition: { name: 'Stock Requisition', enabled: true, roles: { ...rolesTemplate } },
      stockPurchase: { name: 'Stock Purchase', enabled: true, roles: { ...rolesTemplate } },
      stockTransfer: { name: 'Stock Transfer', enabled: true, roles: { ...rolesTemplate } },
      stockAdjustment: { name: 'Stock Adjustment', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  communication: {
    enabled: true,
    title: 'Communication',
    roles: { ...rolesTemplate },
    submodules: {
      announcement: { name: 'Announcement', enabled: true, roles: { ...rolesTemplate } },
      email: { name: 'Email', enabled: true, roles: { ...rolesTemplate } },
      sMS: { name: 'SMS', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  library: {
    enabled: true,
    title: 'Library',
    roles: { ...rolesTemplate },
    submodules: {
      book: { name: 'Book', enabled: true, roles: { ...rolesTemplate } },
      bookAddition: { name: 'Book Addition', enabled: true, roles: { ...rolesTemplate } },
      transaction: { name: 'Transaction', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  activity: {
    enabled: true,
    title: 'Activity',
    roles: { ...rolesTemplate },
    submodules: {
      trip: { name: 'Trip', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  hostel: {
    enabled: true,
    title: 'Hostel',
    roles: { ...rolesTemplate },
    submodules: {
      hostel: { name: 'Hostel', enabled: true, roles: { ...rolesTemplate } },
      roomAllocation: { name: 'Room Allocation', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  form: {
    enabled: true,
    title: 'Form',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  asset: {
    enabled: true,
    title: 'Asset',
    roles: { ...rolesTemplate },
    submodules: {
      building: { name: 'Building', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  site: {
    enabled: true,
    title: 'Site',
    roles: { ...rolesTemplate },
    submodules: {
      page: { name: 'Page', enabled: true, roles: { ...rolesTemplate } },
      menu: { name: 'Menu', enabled: true, roles: { ...rolesTemplate } },
      block: { name: 'Block', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  recruitment: {
    enabled: true,
    title: 'Recruitment',
    roles: { ...rolesTemplate },
    submodules: {
      jobVacancy: { name: 'Job Vacancy', enabled: true, roles: { ...rolesTemplate } },
      jobApplication: { name: 'Job Application', enabled: true, roles: { ...rolesTemplate } }
    }
  },
  customField: {
    enabled: true,
    title: 'Custom Field',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  user: {
    enabled: true,
    title: 'User',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  config: {
    enabled: true,
    title: 'Config',
    roles: { ...rolesTemplate },
    submodules: {
    }
  },
  utility: {
    enabled: true,
    title: 'Utility',
    roles: { ...rolesTemplate },
    submodules: {
    }
  }
};

const DEFAULT_SCHOOLS = [
  { 
    _id: 'school_1', 
    name: 'Demo International School',
    appName: 'Campus Pilot',
    footerText: 'Campus Pilot',
    description: 'Innovative Partner',
    metaAuthor: 'CampusPilot',
    metaDescription: 'Application by campuspilot',
    metaKeywords: 'campuspilot',
    addressLine1: 'Campus Pilot Campus',
    addressLine2: 'Near BLW',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    zipcode: '221005',
    country: 'India',
    email: 'help.chbs@gmail.com',
    phone: '+919935332556',
    fax: 'Fax',
    website: 'https://campuspilot.in',
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
    name: 'Campus Pilot School', 
    appName: 'Campus Pilot',
    description: 'Innovative Partner',
    metaAuthor: 'CampusPilot',
    metaDescription: 'Application by campuspilot',
    metaKeywords: 'campuspilot',
    addressLine1: 'Campus Pilot Main Branch',
    addressLine2: 'Near BLW',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    zipcode: '221005',
    country: 'India',
    email: 'help.chbs@gmail.com',
    phone: '+919935332556',
    fax: 'Fax',
    website: 'https://campuspilot.in',
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

  // Active Session state
  const [sessionsList, setSessionsList] = useState([
    { _id: 'default_sess', name: '2025-2026', code: '2025-2026' }
  ]);
  const [currentSession, setCurrentSession] = useState(() => {
    const saved = localStorage.getItem('active_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return { name: '2025-2026', code: '2025-2026' };
  });

  const fetchSessions = async () => {
    try {
      const res = await API.get('/sessions');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setSessionsList(res.data);
        const savedSession = localStorage.getItem('active_session');
        let activeSess = null;
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            activeSess = res.data.find(s => s._id === parsed._id || s.name === parsed.name);
          } catch (e) { /* ignore */ }
        }
        if (!activeSess) {
          activeSess = res.data[0];
        }
        setCurrentSession(activeSess);
        localStorage.setItem('active_session', JSON.stringify(activeSess));
      }
    } catch (err) {
      console.warn('Could not fetch sessions for context:', err);
    }
  };

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
      fetchSessions();
    }
  }, [user]);

  const switchSchool = (schoolOrId) => {
    let target = typeof schoolOrId === 'string' ? schools.find(s => s._id === schoolOrId) : schoolOrId;
    if (target) {
      setCurrentSchool(target);
      localStorage.setItem('active_school_id', target._id);
      localStorage.setItem('active_school', JSON.stringify(target));
      window.dispatchEvent(new CustomEvent('school-switched', { detail: { schoolId: target._id, school: target } }));
      fetchSessions();
    }
  };

  const switchSession = (sessionObj) => {
    if (sessionObj) {
      setCurrentSession(sessionObj);
      localStorage.setItem('active_session', JSON.stringify(sessionObj));
      window.dispatchEvent(new CustomEvent('session-switched', { detail: { session: sessionObj } }));
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
      sessionsList,
      currentSession,
      switchSession,
      fetchSessions,
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

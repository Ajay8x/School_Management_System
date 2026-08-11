import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const SchoolContext = createContext();

export const DEFAULT_MODULES_CONFIG = {
  reception: {
    enabled: true,
    title: 'Reception',
    submodules: {
      enquiry: { name: 'Enquiry', enabled: true },
      visitorLog: { name: 'Visitor Log', enabled: true },
      gatePass: { name: 'Gate Pass', enabled: true },
      complaint: { name: 'Complaint', enabled: true },
      callLog: { name: 'Call Log', enabled: true },
      correspondence: { name: 'Correspondence', enabled: true },
      query: { name: 'Query', enabled: true }
    }
  },
  student: {
    enabled: true,
    title: 'Student',
    submodules: {
      registration: { name: 'Registration', enabled: true },
      rollNumber: { name: 'Roll Number', enabled: true },
      photo: { name: 'Photo', enabled: true },
      healthRecord: { name: 'Health Record', enabled: true },
      electiveSubject: { name: 'Elective Subject', enabled: true },
      attendance: { name: 'Attendance', enabled: true },
      feeAllocation: { name: 'Fee Allocation', enabled: true },
      serviceAllocation: { name: 'Service Allocation', enabled: true },
      promotion: { name: 'Promotion', enabled: true },
      editRequest: { name: 'Edit Request', enabled: true },
      serviceRequest: { name: 'Service Request', enabled: true },
      leaveRequest: { name: 'Leave Request', enabled: true },
      transferRequest: { name: 'Transfer Request', enabled: true },
      transfer: { name: 'Transfer', enabled: true },
      alumni: { name: 'Alumni', enabled: true },
      report: { name: 'Report', enabled: true }
    }
  },
  teachers: {
    enabled: true,
    title: 'Teachers',
    submodules: {
      teacherList: { name: 'Teacher List', enabled: true },
      addTeacher: { name: 'Add Teacher', enabled: true }
    }
  },
  guardians: {
    enabled: true,
    title: 'Guardians',
    submodules: {
      guardianList: { name: 'Guardian List', enabled: true },
      addGuardian: { name: 'Add Guardian', enabled: true }
    }
  },
  academic: {
    enabled: true,
    title: 'Academic / Classes',
    submodules: {
      classRoutine: { name: 'Class Routine', enabled: true },
      section: { name: 'Section', enabled: true },
      subject: { name: 'Subject', enabled: true },
      classGroup: { name: 'Class Group', enabled: true },
      syllabus: { name: 'Syllabus', enabled: true },
      classAssign: { name: 'Class Assign', enabled: true },
      teacherAllocation: { name: 'Teacher Allocation', enabled: true },
      bookList: { name: 'Book List', enabled: true },
      certificate: { name: 'Certificate', enabled: true },
      allLevel: { name: 'All Level', enabled: true }
    }
  },
  finance: {
    enabled: true,
    title: 'Finance & Fees',
    submodules: {
      paymentMethod: { name: 'Payment Method', enabled: true },
      feeType: { name: 'Fee Type', enabled: true },
      feeGroup: { name: 'Fee Group', enabled: true },
      feeComponent: { name: 'Fee Component', enabled: true },
      fineGeneration: { name: 'Fine Generation', enabled: true },
      feeAllocation: { name: 'Fee Allocation', enabled: true },
      ledgerType: { name: 'Ledger Type', enabled: true },
      ledger: { name: 'Ledger', enabled: true },
      fee: { name: 'Fee', enabled: true },
      transaction: { name: 'Transaction', enabled: true },
      receipt: { name: 'Receipt', enabled: true },
      report: { name: 'Report', enabled: true }
    }
  },
  exam: {
    enabled: true,
    title: 'Exam & Assessment',
    submodules: {
      gradeScale: { name: 'Grade Scale', enabled: true },
      examTerm: { name: 'Exam Term', enabled: true },
      markDistribution: { name: 'Mark Distribution', enabled: true },
      classworkAssessment: { name: 'Classwork Assessment', enabled: true },
      competencyAssessment: { name: 'Competency Assessment', enabled: true },
      examSchedule: { name: 'Exam Schedule', enabled: true },
      tabulationSheet: { name: 'Tabulation Sheet', enabled: true },
      marks: { name: 'Marks', enabled: true },
      report: { name: 'Report', enabled: true }
    }
  },
  employee: {
    enabled: true,
    title: 'Employee & HRM',
    submodules: {
      department: { name: 'Department', enabled: true },
      designation: { name: 'Designation', enabled: true },
      attendance: { name: 'Attendance', enabled: true },
      leave: { name: 'Leave', enabled: true },
      payroll: { name: 'Payroll', enabled: true },
      subResource: { name: 'Sub Resource', enabled: true }
    }
  },
  library: {
    enabled: true,
    title: 'Library',
    submodules: {
      bookList: { name: 'Book List', enabled: true },
      borrowLog: { name: 'Borrow Log', enabled: true },
      assignment: { name: 'Assignment', enabled: true },
      lessonPlan: { name: 'Lesson Plan', enabled: true },
      syllabus: { name: 'Syllabus', enabled: true },
      homework: { name: 'Homework', enabled: true },
      learningMaterial: { name: 'Learning Material', enabled: true },
      download: { name: 'Download', enabled: true }
    }
  },
  accounts: {
    enabled: true,
    title: 'Accounts',
    submodules: {
      income: { name: 'Income', enabled: true },
      expense: { name: 'Expense', enabled: true },
      invoice: { name: 'Invoice', enabled: true },
      report: { name: 'Report', enabled: true }
    }
  },
  attendance: {
    enabled: true,
    title: 'Attendance',
    submodules: {
      studentAttendance: { name: 'Student Attendance', enabled: true },
      employeeAttendance: { name: 'Employee Attendance', enabled: true },
      report: { name: 'Report', enabled: true }
    }
  },
  leaves: {
    enabled: true,
    title: 'Leaves',
    submodules: {
      applyLeave: { name: 'Apply Leave', enabled: true },
      leaveTypes: { name: 'Leave Types', enabled: true },
      leaveRequests: { name: 'Leave Requests', enabled: true }
    }
  },
  certificate: {
    enabled: true,
    title: 'Certificate',
    submodules: {
      studentCertificate: { name: 'Student Certificate', enabled: true },
      idCard: { name: 'ID Card', enabled: true },
      template: { name: 'Template', enabled: true }
    }
  },
  transport: {
    enabled: true,
    title: 'Transport',
    submodules: {
      routes: { name: 'Routes', enabled: true },
      vehicles: { name: 'Vehicles', enabled: true },
      assignTransport: { name: 'Assign Transport', enabled: true }
    }
  },
  communication: {
    enabled: true,
    title: 'Communication & Notices',
    submodules: {
      noticeBoard: { name: 'Notice Board', enabled: true },
      events: { name: 'Events', enabled: true },
      messages: { name: 'Messages', enabled: true },
      smsConfig: { name: 'SMS Config', enabled: true },
      whatsAppConfig: { name: 'WhatsApp Config', enabled: true }
    }
  },
  settings: {
    enabled: true,
    title: 'System Settings',
    submodules: {
      generalConfig: { name: 'General Config', enabled: true },
      userLimits: { name: 'User Limits', enabled: true },
      authentication: { name: 'Authentication', enabled: true },
      customField: { name: 'Custom Field', enabled: true },
      rolesPermissions: { name: 'Roles & Permissions', enabled: true }
    }
  }
};

const DEFAULT_SCHOOLS = [
  { _id: 'school_1', name: 'Demo International School', code: 'DIS001', isDefault: true, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_2', name: 'CampusTracker School', code: 'CTS002', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_3', name: 'BPS School Bhadoi', code: 'BPS003', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_4', name: 'Lions School Mirzapur', code: 'LSM004', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_5', name: 'Shubham Model School', code: 'SMS005', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_6', name: 'SS PUBLIC SCHOOL', code: 'SSPS006', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_7', name: 'HMS', code: 'HMS007', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_8', name: 'INDIAN PUBLIC SCHOOL', code: 'IPS008', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_9', name: 'Kids Ocean School', code: 'KOS009', isDefault: false, modules: DEFAULT_MODULES_CONFIG },
  { _id: 'school_10', name: 'Dhruv Public School', code: 'DPS010', isDefault: false, modules: DEFAULT_MODULES_CONFIG }
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
        
        // Find existing active school in the fetched list
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
      // Notify all pages to re-fetch their data for the new school
      window.dispatchEvent(new CustomEvent('school-switched', { detail: { schoolId: target._id, school: target } }));
    }
  };

  const updateSchoolModules = async (schoolId, newModules) => {
    try {
      // Backend call
      await API.put(`/schools/${schoolId}/modules`, { modules: newModules });
    } catch (err) {
      console.warn('Backend update failed or running offline, saving in local state:', err);
    }

    // Update local state
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
      // Fallback
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

  // Helper function to check if a module is enabled
  const isModuleEnabled = (moduleKey, subModuleKey = null) => {
    // Normalize module key
    const key = String(moduleKey).toLowerCase().replace(/\s+/g, '');
    const modules = currentSchool?.modules || DEFAULT_MODULES_CONFIG;
    
    // Check main module
    const targetModule = modules[key] || modules[moduleKey];
    if (!targetModule) return true; // default allowed if not mapped

    if (typeof targetModule === 'boolean') return targetModule;
    if (targetModule.enabled === false) return false;

    // If sub-module is requested
    if (subModuleKey && targetModule.submodules) {
      const sub = targetModule.submodules[subModuleKey];
      if (typeof sub === 'boolean') return sub;
      if (sub && sub.enabled === false) return false;
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

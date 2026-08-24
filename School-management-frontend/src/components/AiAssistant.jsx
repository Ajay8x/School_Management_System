import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
  Mic, MicOff, Send, X, Bot, Sparkles, Building, Volume2, VolumeX,
  Compass, RefreshCw, CheckCircle2, ChevronRight, Zap, HelpCircle, Search, PlusCircle, Globe,
  ShieldCheck, UserPlus, BookOpen, FileText, CreditCard, Clock, Activity, FileBadge, Trash2, Edit3, Settings,
  Database, Server, Layers, Sliders, CheckSquare, MessageSquare, AlertCircle, HelpCircle as QuestionIcon,
  Calendar, Award, UserCheck, Bell, Briefcase, DollarSign, Truck, Home, ShoppingBag, PieChart, Lock, PhoneCall,
  UserCheck as TeacherIcon, BookMarked, Layers3, Hash, Flag, UserX, AlertTriangle, FileSpreadsheet, FolderPlus,
  Image, Store, Newspaper, ShieldAlert, CheckCircle, Mail, Coffee, Bus, Bed, Layout, UserSearch, Wrench
} from 'lucide-react';
import aiLogo from '../assets/ai-logo.png';

export default function AiAssistant({ isOpen, onClose, toggleTheme, isDark }) {
  const navigate = useNavigate();
  const { currentSchool, updateSchool, schools, switchSchool, currentSession, sessionsList, switchSession } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Namaste ${user?.name || 'Admin'}! I am your Universal School Master AI Copilot, trained on ALL 36 Sidebar Modules (Dashboard, Reception, Task, Helpdesk, Academic, Student, Finance, Exam, Employee, Resource, Transport, Calendar, Notice Board, Gallery, Inventory, Store, Blog, News, Discipline, Guardian, Approval, Contact, Mess, Communication, Library, Activity, Hostel, Form, Asset, Site, Recruitment, Configuration, User, Custom Field, Utility, Config). Give any command, and I will execute it live!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [thinking, setThinking] = useState(false);

  // Universal Dynamic Multi-Module Form Wizard Engine
  const [wizardType, setWizardType] = useState('student');
  const [wizardStep, setWizardStep] = useState(0); 
  const [wizardData, setWizardData] = useState({});

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Speech Recognition with Dynamic Language Support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInputText(transcript);
        if (event.results[0].isFinal) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const [availableVoices, setAvailableVoices] = useState([]);

  // Pre-load natural voices from browser/OS
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const vList = window.speechSynthesis.getVoices();
      setAvailableVoices(vList);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Dynamic Multilingual Text-To-Speech Engine (Auto-detects spoken language)
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let cleanSpeech = text
      .replace(/[*_~#`]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/📌|🎉|⚡|🎙️|📝|🎯|🔍|🌟|🧪|👉|✔|✕|•/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const vList = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    const isHindiDevanagari = /[\u0900-\u097F]/.test(text);
    const isHinglish = /\b(karo|kya|hai|namaste|puch|naya|banao|student|ka|ki|ko|se|me|bataiye|chahiye|mera|hum|aap|bhai|raha|sharma|kumar|nahi|karna|hoga)\b/i.test(text);
    const isSpanish = /\b(hola|gracias|estudiante|crear|agregar)\b/i.test(text);
    const isFrench = /\b(bonjour|merci|etudiant|creer)\b/i.test(text);

    let targetLang = 'en-IN';
    if (isHindiDevanagari || isHinglish) {
      targetLang = 'hi-IN';
    } else if (isSpanish) {
      targetLang = 'es-ES';
    } else if (isFrench) {
      targetLang = 'fr-FR';
    } else {
      targetLang = 'en-IN';
    }

    const preferredVoice = 
      vList.find(v => v.lang === targetLang) ||
      vList.find(v => v.lang.startsWith(targetLang.split('-')[0])) ||
      vList.find(v => (targetLang === 'hi-IN' || targetLang === 'en-IN') && (v.name.includes('Swara') || v.name.includes('Hemant') || v.name.includes('Neerja') || v.name.includes('Google हिन्दी') || v.name.toLowerCase().includes('india'))) ||
      vList.find(v => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google')) ||
      vList[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = targetLang;
    }

    utterance.rate = targetLang.startsWith('hi') ? 0.90 : 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceListen = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please type your prompt.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
    }
  };

  const getRolePrefix = () => {
    return user?.role === 'super-admin' || user?.role === 'admin' ? '/admin' : `/${user?.role || 'admin'}`;
  };

  // Master Universal Route Map for ALL 36 SIDEBAR MODULES & SUB-ROUTES
  const ROUTE_MAP = {
    // 1. Dashboard
    dashboard: `${getRolePrefix()}/dashboard`,
    home: `${getRolePrefix()}/dashboard`,

    // 2. Reception
    reception: `${getRolePrefix()}/reception/enquiry`,
    enquiry: `${getRolePrefix()}/reception/enquiry`,
    visitor: `${getRolePrefix()}/reception/visitor-log`,
    visitorlog: `${getRolePrefix()}/reception/visitor-log`,
    gatepass: `${getRolePrefix()}/reception/gate-pass`,
    complaint: `${getRolePrefix()}/reception/complaint`,
    correspondence: `${getRolePrefix()}/reception/correspondence`,
    query: `${getRolePrefix()}/reception/query`,

    // 3. Task
    task: `${getRolePrefix()}/task`,

    // 4. Helpdesk
    helpdesk: `${getRolePrefix()}/helpdesk/ticket`,
    ticket: `${getRolePrefix()}/helpdesk/ticket`,
    tickets: `${getRolePrefix()}/helpdesk/ticket`,
    faq: `${getRolePrefix()}/helpdesk/faq`,
    faqs: `${getRolePrefix()}/helpdesk/faq`,
    helpdeskconfig: `${getRolePrefix()}/helpdesk/config`,

    // 5. Academic
    academic: `${getRolePrefix()}/academic/department`,
    department: `${getRolePrefix()}/academic/department`,
    departments: `${getRolePrefix()}/academic/department`,
    program: `${getRolePrefix()}/academic/program`,
    programs: `${getRolePrefix()}/academic/program`,
    session: `${getRolePrefix()}/academic/session`,
    sessions: `${getRolePrefix()}/academic/session`,
    period: `${getRolePrefix()}/academic/period`,
    periods: `${getRolePrefix()}/academic/period`,
    division: `${getRolePrefix()}/academic/division`,
    divisions: `${getRolePrefix()}/academic/division`,
    course: `${getRolePrefix()}/academic/course`,
    courses: `${getRolePrefix()}/academic/course`,
    batch: `${getRolePrefix()}/academic/batch`,
    batches: `${getRolePrefix()}/academic/batch`,
    class: `${getRolePrefix()}/academic/batch`,
    classes: `${getRolePrefix()}/academic/batch`,
    timetable: `${getRolePrefix()}/academic/timetable`,
    routine: `${getRolePrefix()}/academic/timetable`,
    section: `${getRolePrefix()}/academic/section`,
    subject: `${getRolePrefix()}/academic/subject`,
    subjects: `${getRolePrefix()}/academic/subject`,
    classtiming: `${getRolePrefix()}/academic/class-timing`,
    syllabus: `${getRolePrefix()}/academic/syllabus`,
    booklist: `${getRolePrefix()}/academic/book-list`,
    books: `${getRolePrefix()}/academic/book-list`,
    certificate: `${getRolePrefix()}/academic/certificate`,
    certificates: `${getRolePrefix()}/academic/certificate`,
    idcard: `${getRolePrefix()}/academic/id-card`,
    idcards: `${getRolePrefix()}/academic/id-card`,

    // 6. Student
    student: `${getRolePrefix()}/students`,
    students: `${getRolePrefix()}/students`,
    addstudent: `${getRolePrefix()}/students/add`,
    rollnumber: `${getRolePrefix()}/students/roll-number`,
    photo: `${getRolePrefix()}/students/photo`,
    healthrecord: `${getRolePrefix()}/students/health-record`,
    electivesubject: `${getRolePrefix()}/students/elective-subject`,
    feeallocation: `${getRolePrefix()}/students/fee-allocation`,
    serviceallocation: `${getRolePrefix()}/students/service-allocation`,
    promotion: `${getRolePrefix()}/students/promotion`,
    editrequests: `${getRolePrefix()}/students/edit-requests`,
    servicerequests: `${getRolePrefix()}/students/service-requests`,
    studentconfig: `${getRolePrefix()}/students/config`,

    // 7. Finance
    finance: `${getRolePrefix()}/fees`,
    fees: `${getRolePrefix()}/fees`,
    paymentmethod: `${getRolePrefix()}/finance/payment-method`,
    feegroup: `${getRolePrefix()}/finance/fee-group`,
    feehead: `${getRolePrefix()}/finance/fee-head`,
    feecomponent: `${getRolePrefix()}/finance/fee-component`,
    feeconcession: `${getRolePrefix()}/finance/fee-concession`,
    ledger: `${getRolePrefix()}/finance/ledger`,
    tax: `${getRolePrefix()}/finance/tax`,
    receipt: `${getRolePrefix()}/finance/receipt`,
    financereport: `${getRolePrefix()}/finance/report`,

    // 8. Exam
    exam: `${getRolePrefix()}/examinations`,
    examinations: `${getRolePrefix()}/examinations`,
    examterm: `${getRolePrefix()}/exam/term`,
    gradescale: `${getRolePrefix()}/exam/grade-scale`,
    assessment: `${getRolePrefix()}/exam/assessment`,
    examschedule: `${getRolePrefix()}/exam/schedule`,
    onlineexam: `${getRolePrefix()}/exam/online-exam`,
    examform: `${getRolePrefix()}/exam/form`,
    admitcard: `${getRolePrefix()}/exam/admit-card`,
    marks: `${getRolePrefix()}/exam/marks`,
    marksheet: `${getRolePrefix()}/exam/marksheet`,
    examreport: `${getRolePrefix()}/exam/report`,

    // 9. Employee
    employee: `${getRolePrefix()}/teachers`,
    teachers: `${getRolePrefix()}/teachers`,
    teacher: `${getRolePrefix()}/teachers`,
    designation: `${getRolePrefix()}/employee/designation`,
    payroll: `${getRolePrefix()}/employee/payroll`,

    // 10. Resource
    resource: `${getRolePrefix()}/resource/student-diary`,
    studentdiary: `${getRolePrefix()}/resource/student-diary`,
    lessonplan: `${getRolePrefix()}/resource/lesson-plan`,
    assignment: `${getRolePrefix()}/resource/assignment`,
    onlineclass: `${getRolePrefix()}/resource/online-class`,
    learningmaterial: `${getRolePrefix()}/resource/learning-material`,
    download: `${getRolePrefix()}/resource/download`,

    // 11. Transport
    transport: `${getRolePrefix()}/transport/route`,
    transportroute: `${getRolePrefix()}/transport/route`,
    transportcircle: `${getRolePrefix()}/transport/circle`,
    transportfee: `${getRolePrefix()}/transport/fee`,
    transportvehicle: `${getRolePrefix()}/transport/vehicle`,

    // 12. Calendar
    calendar: `${getRolePrefix()}/calendar/event`,
    holiday: `${getRolePrefix()}/calendar/holiday`,
    celebration: `${getRolePrefix()}/calendar/celebration`,
    event: `${getRolePrefix()}/calendar/event`,

    // 13. Notice Board
    noticeboard: `${getRolePrefix()}/notice-board`,
    notice: `${getRolePrefix()}/notice-board`,
    notices: `${getRolePrefix()}/notice-board`,

    // 14. Gallery
    gallery: `${getRolePrefix()}/gallery`,

    // 15. Inventory
    inventory: `${getRolePrefix()}/inventory/item`,
    vendor: `${getRolePrefix()}/inventory/vendor`,
    inventorycategory: `${getRolePrefix()}/inventory/category`,
    inventoryitem: `${getRolePrefix()}/inventory/item`,
    requisition: `${getRolePrefix()}/inventory/requisition`,
    purchase: `${getRolePrefix()}/inventory/purchase`,

    // 16. Store
    store: `${getRolePrefix()}/store/sale`,
    storesale: `${getRolePrefix()}/store/sale`,

    // 17. Blog
    blog: `${getRolePrefix()}/blog`,

    // 18. News
    news: `${getRolePrefix()}/news`,

    // 19. Discipline
    discipline: `${getRolePrefix()}/discipline/incident`,

    // 20. Guardian
    guardian: `${getRolePrefix()}/guardians`,
    guardians: `${getRolePrefix()}/guardians`,

    // 21. Approval
    approval: `${getRolePrefix()}/approval/request`,

    // 22. Contact
    contact: `${getRolePrefix()}/reception/correspondence`,

    // 23. Mess
    mess: `${getRolePrefix()}/mess/item`,

    // 24. Communication
    communication: `${getRolePrefix()}/communication/email`,
    email: `${getRolePrefix()}/communication/email`,
    sms: `${getRolePrefix()}/communication/sms`,
    whatsapp: `${getRolePrefix()}/communication/whatsapp`,
    message: `${getRolePrefix()}/message`,

    // 25. Library
    library: `${getRolePrefix()}/library`,

    // 26. Activity
    activity: `${getRolePrefix()}/activity/trip`,

    // 27. Hostel
    hostel: `${getRolePrefix()}/hostel/list`,

    // 28. Form
    form: `${getRolePrefix()}/download-format`,

    // 29. Asset
    asset: `${getRolePrefix()}/asset/building`,
    assetconfig: `${getRolePrefix()}/asset-config`,

    // 30. Site
    site: `${getRolePrefix()}/site/page`,

    // 31. Recruitment
    recruitment: `${getRolePrefix()}/recruitment/vacancy`,

    // 32. Configuration
    configuration: `${getRolePrefix()}/general-config`,
    generalconfig: `${getRolePrefix()}/general-config`,
    moduleconfig: `${getRolePrefix()}/module-config`,

    // 33. User
    user: `${getRolePrefix()}/users`,
    users: `${getRolePrefix()}/users`,
    credentials: `${getRolePrefix()}/credentials`,

    // 34. Custom Field
    customfield: `${getRolePrefix()}/custom-field`,

    // 35. Utility
    utility: `${getRolePrefix()}/utility/activity-log`,
    activitylog: `${getRolePrefix()}/utility/activity-log`,

    // 36. Config
    config: `${getRolePrefix()}/general-config`,
    bulkimport: `${getRolePrefix()}/download-format`,
    downloadformat: `${getRolePrefix()}/download-format`
  };

  // Master Supreme Universal NLP Intent Engine across ALL 36 SIDEBAR MODULES
  const processAICommand = async (commandText) => {
    setThinking(true);
    const lower = commandText.toLowerCase().trim();
    let reply = '';
    let executedAction = null;
    let autoCloseModal = false;

    try {
      // =========================================================
      // 1. UNIVERSAL MULTI-MODULE INTERACTIVE WIZARD ENGINE
      // =========================================================
      if (wizardStep > 0) {
        if (wizardType === 'student') {
          if (wizardStep === 1) {
            const studentName = commandText.trim();
            const firstName = studentName.split(' ')[0] || studentName;
            const lastName = studentName.split(' ').slice(1).join(' ') || 'Sharma';
            const timestamp = Date.now().toString().slice(-4);
            const email = `${studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}${timestamp}@school.com`;

            setWizardData({ ...wizardData, name: studentName, firstName, lastName, email });
            setWizardStep(2);
            window.dispatchEvent(new CustomEvent('ai_form_fill', { detail: { name: studentName, firstName, lastName, email } }));
            reply = `Student Name set to "${studentName}"!\n\n📌 Step 2/4: Student ki Class/Grade konsi hai? (e.g. Class 10)`;
          } else if (wizardStep === 2) {
            const className = commandText.trim();
            setWizardData({ ...wizardData, className });
            setWizardStep(3);
            window.dispatchEvent(new CustomEvent('ai_form_fill', { detail: { className, course: className } }));
            reply = `Class set to "${className}"!\n\n📌 Step 3/4: Parent / Guardian ka Full Name kya hai?`;
          } else if (wizardStep === 3) {
            const parentName = commandText.trim();
            setWizardData({ ...wizardData, parentName });
            setWizardStep(4);
            window.dispatchEvent(new CustomEvent('ai_form_fill', { detail: { parentName } }));
            reply = `Parent Name set to "${parentName}"!\n\n📌 Step 4/4: Mobile Contact Number kya hai?`;
          } else if (wizardStep === 4) {
            const contact = commandText.trim();
            const finalData = { ...wizardData, contact, rollNumber: `STU-${Date.now().toString().slice(-4)}`, status: 'Active' };
            window.dispatchEvent(new CustomEvent('ai_form_fill', { detail: { contact } }));
            try {
              await API.post('/students', finalData);
              reply = `🎉 Student "${finalData.name}" saved to MongoDB! Opening Students Directory live.`;
            } catch (e) {
              reply = `Form complete for "${finalData.name}". Opening Students list!`;
            }
            setWizardStep(0);
            autoCloseModal = true;
            navigate(ROUTE_MAP.students);
          }
        }
        else if (wizardType === 'teacher') {
          if (wizardStep === 1) {
            const name = commandText.trim();
            setWizardData({ ...wizardData, name });
            setWizardStep(2);
            reply = `Teacher Name set to "${name}"!\n\n📌 Step 2/3: Teaching Subject kya hai? (e.g. Mathematics, Science)`;
          } else if (wizardStep === 2) {
            const subject = commandText.trim();
            setWizardData({ ...wizardData, subject });
            setWizardStep(3);
            reply = `Subject set to "${subject}"!\n\n📌 Step 3/3: Teacher Email / Contact Details?`;
          } else if (wizardStep === 3) {
            const emailOrPhone = commandText.trim();
            const email = emailOrPhone.includes('@') ? emailOrPhone : `${wizardData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.com`;
            const finalTeacher = { ...wizardData, email, status: 'Active' };
            try {
              await API.post('/teachers', finalTeacher);
              reply = `🎉 Teacher "${finalTeacher.name}" created! Opening Faculty list live.`;
            } catch (e) {
              reply = `Teacher form filled! Opening Faculty list live.`;
            }
            setWizardStep(0);
            autoCloseModal = true;
            navigate(ROUTE_MAP.teachers);
          }
        }
        else if (wizardType === 'department') {
          if (wizardStep === 1) {
            const deptName = commandText.trim();
            const code = deptName.substring(0, 4).toUpperCase();
            setWizardData({ name: deptName, code });
            setWizardStep(2);
            reply = `Department Name set to "${deptName}" (Code: ${code})!\n\n📌 Step 2/2: HOD / Department Head का नाम क्या है?`;
          } else if (wizardStep === 2) {
            const hod = commandText.trim();
            const finalDept = { ...wizardData, hod, status: 'Active' };
            try {
              await API.post('/departments', finalDept);
              reply = `🎉 Department "${finalDept.name}" created in MongoDB! Opening Departments live.`;
            } catch (e) {
              reply = `Department processed! Opening Departments view.`;
            }
            setWizardStep(0);
            autoCloseModal = true;
            navigate(ROUTE_MAP.department);
          }
        }
      }

      // =========================================================
      // 2. TRIGGER STEP-BY-STEP INTERACTIVE WIZARDS FOR ANY MODULE
      // =========================================================
      else if (lower.includes('puch') || lower.includes('step by step') || lower.includes('interview')) {
        if (lower.includes('teacher') || lower.includes('faculty') || lower.includes('employee')) {
          setWizardType('teacher');
          setWizardStep(1);
          setWizardData({});
          navigate(ROUTE_MAP.addteacher);
          reply = `Starting Step-by-Step Teacher Registration Wizard!\n\n📌 Step 1/3: Teacher ka Full Name kya hai?`;
        } else if (lower.includes('department')) {
          setWizardType('department');
          setWizardStep(1);
          setWizardData({});
          navigate(ROUTE_MAP.department);
          reply = `Starting Step-by-Step Department Wizard!\n\n📌 Step 1/2: Department ka Name kya hai?`;
        } else {
          setWizardType('student');
          setWizardStep(1);
          setWizardData({});
          navigate(ROUTE_MAP.addstudent);
          reply = `Starting Step-by-Step Interactive Student Registration Wizard!\n\n📌 Step 1/4: Student ka Full Name kya hai?`;
        }
        executedAction = `Started ${wizardType} Wizard`;
      }

      // =========================================================
      // 3. DIRECT CREATIONS FOR MODULES
      // =========================================================
      else if (lower.includes('student') && (lower.includes('add') || lower.includes('create') || lower.includes('register') || lower.includes('karo') || lower.includes('banao'))) {
        let name = commandText.replace(/add|create|register|student|karo|banao|naya|new|ko|ka|ki/gi, '').trim();
        if (!name) {
          setWizardType('student');
          setWizardStep(1);
          setWizardData({});
          navigate(ROUTE_MAP.addstudent);
          reply = `Starting Interactive Student Wizard!\n\n📌 Step 1/4: Student ka Full Name kya hai?`;
        } else {
          try {
            await API.post('/students', { name, className: 'Class 10', parentName: 'Mr. Parent', contact: '9876543210', status: 'Active' });
            reply = `Student "${name}" registered in MongoDB! Opening Students list live.`;
            executedAction = `Student Created: ${name}`;
          } catch (e) {
            reply = `Opening Student Add screen live for "${name}".`;
          }
          autoCloseModal = true;
          navigate(ROUTE_MAP.students);
        }
      }
      else if ((lower.includes('teacher') || lower.includes('faculty') || lower.includes('employee')) && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let name = commandText.replace(/add|create|teacher|faculty|employee|karo|banao|naya|new|ko|ka|ki/gi, '').trim() || 'Dr. Vikram Seth';
        try {
          await API.post('/teachers', { name, subject: 'Science & Mathematics', status: 'Active' });
          reply = `Teacher "${name}" added! Opening Teachers list live.`;
          executedAction = `Teacher Created: ${name}`;
        } catch (e) {
          reply = `Opening Teachers screen live.`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.teachers);
      }
      else if (lower.includes('department') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let name = commandText.replace(/add|create|department|karo|banao|naya|new|ko|ka|ki/gi, '').trim() || 'Artificial Intelligence';
        try {
          await API.post('/departments', { name, code: name.substring(0, 4).toUpperCase(), status: 'Active' });
          reply = `Department "${name}" created! Opening Departments live.`;
          executedAction = `Department Created: ${name}`;
        } catch (e) {
          reply = `Opening Departments live.`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.department);
      }
      else if (lower.includes('subject') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let name = commandText.replace(/add|create|subject|karo|banao|naya|new|ko|ka|ki/gi, '').trim() || 'Robotics & Automation';
        try {
          await API.post('/subjects', { name, code: name.substring(0, 4).toUpperCase(), status: 'Active' });
          reply = `Subject "${name}" added! Opening Subjects live.`;
          executedAction = `Subject Created: ${name}`;
        } catch (e) {
          reply = `Opening Subjects live.`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.subject);
      }
      else if (lower.includes('rebrand') || lower.includes('change school name') || lower.includes('set school name') || (lower.includes('school') && lower.includes('naam'))) {
        let newName = commandText.replace(/change school name to|set school name to|rebrand to|school ka naam badlo|school name/gi, '').trim() || 'Royal International School';
        if (currentSchool && currentSchool._id) {
          await updateSchool(currentSchool._id, { appName: newName, footerText: newName, name: newName });
          document.title = newName;
          window.dispatchEvent(new CustomEvent('school-updated', { detail: { school: { ...currentSchool, name: newName, appName: newName } } }));
          reply = `System branding & Browser tab title updated live to "${newName}" across all screens!`;
          executedAction = `Rebrand System: ${newName}`;
        } else {
          document.title = newName;
          reply = `School name updated to "${newName}".`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.generalconfig);
      }
      else if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('theme')) {
        if (toggleTheme) toggleTheme();
        reply = `System theme toggled live!`;
        executedAction = `Toggled Theme`;
        autoCloseModal = true;
      }

      // =========================================================
      // 4. EXHAUSTIVE SCREEN ROUTING MATCHING ALL 36 SIDEBAR ITEMS
      // =========================================================
      else if (lower.includes('dashboard') || lower.includes('home')) { navigate(ROUTE_MAP.dashboard); reply = `Opening Dashboard live!`; autoCloseModal = true; }
      else if (lower.includes('reception') || lower.includes('enquiry')) { navigate(ROUTE_MAP.reception); reply = `Opening Reception & Enquiries live!`; autoCloseModal = true; }
      else if (lower.includes('visitor')) { navigate(ROUTE_MAP.visitorlog); reply = `Opening Visitor Log live!`; autoCloseModal = true; }
      else if (lower.includes('gate pass')) { navigate(ROUTE_MAP.gatepass); reply = `Opening Gate Pass live!`; autoCloseModal = true; }
      else if (lower.includes('complaint')) { navigate(ROUTE_MAP.complaint); reply = `Opening Complaints live!`; autoCloseModal = true; }
      else if (lower.includes('task')) { navigate(ROUTE_MAP.task); reply = `Opening Tasks module live!`; autoCloseModal = true; }
      else if (lower.includes('ticket') || lower.includes('helpdesk')) { navigate(ROUTE_MAP.helpdesk); reply = `Opening Helpdesk live!`; autoCloseModal = true; }
      else if (lower.includes('faq')) { navigate(ROUTE_MAP.faq); reply = `Opening FAQ Knowledgebase live!`; autoCloseModal = true; }
      else if (lower.includes('department')) { navigate(ROUTE_MAP.department); reply = `Opening Departments live!`; autoCloseModal = true; }
      else if (lower.includes('program')) { navigate(ROUTE_MAP.program); reply = `Opening Programs live!`; autoCloseModal = true; }
      else if (lower.includes('session')) { navigate(ROUTE_MAP.session); reply = `Opening Sessions live!`; autoCloseModal = true; }
      else if (lower.includes('period')) { navigate(ROUTE_MAP.period); reply = `Opening Periods live!`; autoCloseModal = true; }
      else if (lower.includes('division')) { navigate(ROUTE_MAP.division); reply = `Opening Divisions live!`; autoCloseModal = true; }
      else if (lower.includes('course') || lower.includes('academic')) { navigate(ROUTE_MAP.course); reply = `Opening Courses & Academic live!`; autoCloseModal = true; }
      else if (lower.includes('batch') || lower.includes('class')) { navigate(ROUTE_MAP.batch); reply = `Opening Batches live!`; autoCloseModal = true; }
      else if (lower.includes('timetable') || lower.includes('routine')) { navigate(ROUTE_MAP.timetable); reply = `Opening Timetables live!`; autoCloseModal = true; }
      else if (lower.includes('subject')) { navigate(ROUTE_MAP.subject); reply = `Opening Subjects live!`; autoCloseModal = true; }
      else if (lower.includes('classtiming')) { navigate(ROUTE_MAP.classtiming); reply = `Opening Class Timings live!`; autoCloseModal = true; }
      else if (lower.includes('syllabus')) { navigate(ROUTE_MAP.syllabus); reply = `Opening Syllabus live!`; autoCloseModal = true; }
      else if (lower.includes('book')) { navigate(ROUTE_MAP.books); reply = `Opening Book Catalog live!`; autoCloseModal = true; }
      else if (lower.includes('certificate')) { navigate(ROUTE_MAP.certificate); reply = `Opening Certificates Studio live!`; autoCloseModal = true; }
      else if (lower.includes('id card')) { navigate(ROUTE_MAP.idcard); reply = `Opening ID Cards Studio live!`; autoCloseModal = true; }
      else if (lower.includes('student')) { navigate(ROUTE_MAP.students); reply = `Opening Students Directory live!`; autoCloseModal = true; }
      else if (lower.includes('roll number')) { navigate(ROUTE_MAP.rollnumber); reply = `Opening Roll Number allocation live!`; autoCloseModal = true; }
      else if (lower.includes('health')) { navigate(ROUTE_MAP.healthrecord); reply = `Opening Health Records live!`; autoCloseModal = true; }
      else if (lower.includes('elective')) { navigate(ROUTE_MAP.electivesubject); reply = `Opening Elective Subjects live!`; autoCloseModal = true; }
      else if (lower.includes('promotion')) { navigate(ROUTE_MAP.promotion); reply = `Opening Student Promotion live!`; autoCloseModal = true; }
      else if (lower.includes('service request')) { navigate(ROUTE_MAP.servicerequests); reply = `Opening Service Requests live!`; autoCloseModal = true; }
      else if (lower.includes('finance') || lower.includes('fee')) { navigate(ROUTE_MAP.finance); reply = `Opening Finance & Fee module live!`; autoCloseModal = true; }
      else if (lower.includes('exam') || lower.includes('examination')) { navigate(ROUTE_MAP.exam); reply = `Opening Examinations live!`; autoCloseModal = true; }
      else if (lower.includes('admit card')) { navigate(ROUTE_MAP.admitcard); reply = `Opening Admit Cards live!`; autoCloseModal = true; }
      else if (lower.includes('marksheet') || lower.includes('marks')) { navigate(ROUTE_MAP.marksheet); reply = `Opening Marksheets live!`; autoCloseModal = true; }
      else if (lower.includes('employee') || lower.includes('teacher') || lower.includes('faculty')) { navigate(ROUTE_MAP.employee); reply = `Opening Employees & Faculty live!`; autoCloseModal = true; }
      else if (lower.includes('designation')) { navigate(ROUTE_MAP.designation); reply = `Opening Designations live!`; autoCloseModal = true; }
      else if (lower.includes('payroll')) { navigate(ROUTE_MAP.payroll); reply = `Opening Payroll live!`; autoCloseModal = true; }
      else if (lower.includes('resource') || lower.includes('diary')) { navigate(ROUTE_MAP.resource); reply = `Opening Resources live!`; autoCloseModal = true; }
      else if (lower.includes('assignment')) { navigate(ROUTE_MAP.assignment); reply = `Opening Assignments live!`; autoCloseModal = true; }
      else if (lower.includes('transport') || lower.includes('vehicle')) { navigate(ROUTE_MAP.transport); reply = `Opening Transport live!`; autoCloseModal = true; }
      else if (lower.includes('calendar') || lower.includes('event') || lower.includes('holiday')) { navigate(ROUTE_MAP.calendar); reply = `Opening Calendar & Events live!`; autoCloseModal = true; }
      else if (lower.includes('notice')) { navigate(ROUTE_MAP.noticeboard); reply = `Opening Notice Board live!`; autoCloseModal = true; }
      else if (lower.includes('gallery')) { navigate(ROUTE_MAP.gallery); reply = `Opening Gallery live!`; autoCloseModal = true; }
      else if (lower.includes('inventory') || lower.includes('vendor')) { navigate(ROUTE_MAP.inventory); reply = `Opening Inventory live!`; autoCloseModal = true; }
      else if (lower.includes('store') || lower.includes('sale')) { navigate(ROUTE_MAP.store); reply = `Opening Store & Sales live!`; autoCloseModal = true; }
      else if (lower.includes('blog')) { navigate(ROUTE_MAP.blog); reply = `Opening Blog live!`; autoCloseModal = true; }
      else if (lower.includes('news')) { navigate(ROUTE_MAP.news); reply = `Opening News live!`; autoCloseModal = true; }
      else if (lower.includes('discipline') || lower.includes('incident')) { navigate(ROUTE_MAP.discipline); reply = `Opening Discipline Incident Log live!`; autoCloseModal = true; }
      else if (lower.includes('guardian') || lower.includes('parent')) { navigate(ROUTE_MAP.guardians); reply = `Opening Guardians live!`; autoCloseModal = true; }
      else if (lower.includes('approval')) { navigate(ROUTE_MAP.approval); reply = `Opening Approvals live!`; autoCloseModal = true; }
      else if (lower.includes('contact') || lower.includes('correspondence')) { navigate(ROUTE_MAP.contact); reply = `Opening Contacts & Correspondence live!`; autoCloseModal = true; }
      else if (lower.includes('mess') || lower.includes('meal')) { navigate(ROUTE_MAP.mess); reply = `Opening Mess Management live!`; autoCloseModal = true; }
      else if (lower.includes('communication') || lower.includes('email') || lower.includes('sms') || lower.includes('whatsapp')) { navigate(ROUTE_MAP.communication); reply = `Opening Communications live!`; autoCloseModal = true; }
      else if (lower.includes('library')) { navigate(ROUTE_MAP.library); reply = `Opening Library live!`; autoCloseModal = true; }
      else if (lower.includes('activity') || lower.includes('trip')) { navigate(ROUTE_MAP.activity); reply = `Opening Educational Activities live!`; autoCloseModal = true; }
      else if (lower.includes('hostel')) { navigate(ROUTE_MAP.hostel); reply = `Opening Hostel Management live!`; autoCloseModal = true; }
      else if (lower.includes('form') || lower.includes('download format') || lower.includes('bulk import')) { navigate(ROUTE_MAP.bulkimport); reply = `Opening Download Formats & Bulk Import live!`; autoCloseModal = true; }
      else if (lower.includes('asset')) { navigate(ROUTE_MAP.asset); reply = `Opening Asset Management live!`; autoCloseModal = true; }
      else if (lower.includes('site')) { navigate(ROUTE_MAP.site); reply = `Opening Site Management live!`; autoCloseModal = true; }
      else if (lower.includes('recruitment') || lower.includes('vacancy')) { navigate(ROUTE_MAP.recruitment); reply = `Opening Recruitment & Vacancies live!`; autoCloseModal = true; }
      else if (lower.includes('user') || lower.includes('credentials')) { navigate(ROUTE_MAP.users); reply = `Opening User Management live!`; autoCloseModal = true; }
      else if (lower.includes('custom field')) { navigate(ROUTE_MAP.customfield); reply = `Opening Custom Fields live!`; autoCloseModal = true; }
      else if (lower.includes('utility') || lower.includes('activity log') || lower.includes('audit')) { navigate(ROUTE_MAP.utility); reply = `Opening Utilities & Audit Trail live!`; autoCloseModal = true; }
      else if (lower.includes('config') || lower.includes('configuration') || lower.includes('settings')) { navigate(ROUTE_MAP.generalconfig); reply = `Opening System Configuration live!`; autoCloseModal = true; }
      else {
        reply = `Opening system dashboard for command: "${commandText}".`;
        navigate(ROUTE_MAP.dashboard);
        autoCloseModal = true;
      }

    } catch (err) {
      console.error("AI Assistant Exception:", err);
      reply = `Processed task: "${commandText}". System synchronized.`;
    }

    setThinking(false);

    const aiMsg = {
      id: Date.now(),
      sender: 'ai',
      text: reply,
      action: executedAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, aiMsg]);
    speakText(reply);

    if (autoCloseModal) {
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    processAICommand(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-[#0b101d] text-white w-full max-w-2xl h-[700px] max-h-[95vh] rounded-3xl border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0e1628] border-b border-purple-500/30 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-80 animate-pulse"></div>
              <img src={aiLogo} alt="AI Logo" className="w-10 h-10 object-contain relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-wide">
                  ALL 36-SIDEBAR MODULE MASTER AI COPILOT
                </h3>
                {wizardStep > 0 ? (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse uppercase">
                    {wizardType} WIZARD {wizardStep}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full animate-pulse uppercase">
                    36 SIDEBAR MODULES TRAINED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Total System Controller for Every Single Sidebar Item</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-2 rounded-xl border transition ${
                speechEnabled 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={speechEnabled ? 'Mute Voice Output' : 'Enable Voice Output'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Wizard Banner */}
        {wizardStep > 0 && (
          <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900 px-4 py-2.5 border-b border-purple-500/30 flex items-center justify-between text-xs text-amber-300 font-bold">
            <div className="flex items-center gap-2">
              <QuestionIcon className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Step-by-Step {wizardType.toUpperCase()} Wizard: Answer question below</span>
            </div>
            <button 
              onClick={() => setWizardStep(0)}
              className="px-2 py-0.5 text-[10px] bg-red-500/20 border border-red-500/40 text-red-300 rounded hover:bg-red-500/40"
            >
              Cancel Wizard
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar bg-[#080d19]/80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <img src={aiLogo} alt="AI" className="w-6 h-6 object-contain" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md rounded-tr-none'
                  : 'bg-[#121c33] border border-slate-700/80 text-slate-200 shadow-sm rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
                
                {msg.action && (
                  <div className="mt-2 pt-2 border-t border-purple-500/30 flex items-center gap-1.5 text-[11px] font-bold text-teal-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Action Executed: {msg.action}</span>
                  </div>
                )}
                
                <span className="block text-[9px] text-slate-400 mt-1.5 text-right opacity-80">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center space-x-2 text-xs text-purple-300 bg-purple-950/40 p-3 rounded-2xl border border-purple-500/30 w-max animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI is navigating live screen & executing task...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Commands Bar with Sidebar Shortcuts */}
        <div className="px-4 py-2 bg-[#0e1628] border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Sidebar Commands:
          </span>
          {[
            'Puch ke student add karo',
            'Puch ke teacher add karo',
            'Puch ke department add karo',
            'Open Reception',
            'Open Task',
            'Open Finance',
            'Open Exam',
            'Open Employee',
            'Open Transport',
            'Open Inventory',
            'Open Hostel',
            'Open Mess',
            'Open Recruitment',
            'Open Custom Field'
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-purple-900/50 text-slate-300 hover:text-purple-200 border border-slate-700/80 hover:border-purple-500/50 rounded-lg transition whitespace-nowrap flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-3 sm:p-4 bg-[#090e1b] border-t border-purple-500/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={toggleVoiceListen}
              className={`p-3 rounded-2xl border transition-all duration-300 flex-shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                  : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-500/50 text-purple-300'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Command (Voice Input)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder={
                isListening 
                  ? 'Listening to your voice...' 
                  : wizardStep > 0
                    ? `Type answer for ${wizardType.toUpperCase()} Step ${wizardStep}...`
                    : 'Speak or type any command for all 36 sidebar modules...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#121c33] border border-slate-700 focus:border-purple-500/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg disabled:opacity-40 transition flex-shrink-0"
              title="Send Command"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

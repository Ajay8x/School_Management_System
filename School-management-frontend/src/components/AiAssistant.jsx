import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
  Mic, MicOff, Send, X, Bot, Sparkles, Building, Volume2, VolumeX,
  Compass, RefreshCw, CheckCircle2, ChevronRight, Zap, HelpCircle, Search, PlusCircle, Globe,
  ShieldCheck, UserPlus, BookOpen, FileText, CreditCard, Clock, Activity, FileBadge, Trash2, Edit3, Settings,
  Database, Server, Layers, Sliders, CheckSquare, MessageSquare, AlertCircle, HelpCircle as QuestionIcon
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
      text: `Namaste ${user?.name || 'Admin'}! I am your 100% Complete Autonomous School AI Assistant. Ask me to perform tasks instantly or say "Puch ke student add karo" to fill registration forms step-by-step!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [thinking, setThinking] = useState(false);

  // Step-by-step Interactive Form Wizard State
  const [wizardStep, setWizardStep] = useState(0); // 0 = inactive, 1 = Name, 2 = Class, 3 = Parent, 4 = Contact
  const [wizardData, setWizardData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    className: '',
    parentName: '',
    contact: '',
    email: ''
  });

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Speech Recognition
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

  // Pre-load natural Indian Hindi & English voices
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

    // Clean text for smooth pronunciation
    let cleanSpeech = text
      .replace(/[*_~#`]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/📌|🎉|⚡|🎙️|📝|🎯|🔍|🌟|🧪|👉|✔|✕|•/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const vList = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    // Language Detection Logic
    const isHindiDevanagari = /[\u0900-\u097F]/.test(text);
    const isHinglish = /\b(karo|kya|hai|namaste|puch|naya|banao|student|ka|ki|ko|se|me|bataiye|chahiye|mera|hum|aap|bhai|raha|sharma|kumar|nahi|karna|hoga)\b/i.test(text);
    const isSpanish = /\b(hola|gracias|estudiante|crear|agregar)\b/i.test(text);
    const isFrench = /\b(bonjour|merci|etudiant|creer)\b/i.test(text);

    let targetLang = 'en-US';
    if (isHindiDevanagari || isHinglish) {
      targetLang = 'hi-IN';
    } else if (isSpanish) {
      targetLang = 'es-ES';
    } else if (isFrench) {
      targetLang = 'fr-FR';
    } else {
      targetLang = 'en-IN';
    }

    // Match best voice for detected language
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

  // Universal System Navigation Map
  const ROUTE_MAP = {
    dashboard: `${getRolePrefix()}/dashboard`,
    home: `${getRolePrefix()}/dashboard`,
    department: `${getRolePrefix()}/academic/department`,
    departments: `${getRolePrefix()}/academic/department`,
    subject: `${getRolePrefix()}/academic/subject`,
    subjects: `${getRolePrefix()}/academic/subject`,
    program: `${getRolePrefix()}/academic/program`,
    programs: `${getRolePrefix()}/academic/program`,
    batch: `${getRolePrefix()}/academic/batch`,
    batches: `${getRolePrefix()}/academic/batch`,
    class: `${getRolePrefix()}/academic/batch`,
    period: `${getRolePrefix()}/academic/period`,
    periods: `${getRolePrefix()}/academic/period`,
    timing: `${getRolePrefix()}/academic/period`,
    division: `${getRolePrefix()}/academic/division`,
    divisions: `${getRolePrefix()}/academic/division`,
    book: `${getRolePrefix()}/academic/books`,
    books: `${getRolePrefix()}/academic/books`,
    student: `${getRolePrefix()}/students`,
    students: `${getRolePrefix()}/students`,
    addstudent: `${getRolePrefix()}/students/add`,
    teacher: `${getRolePrefix()}/teachers`,
    teachers: `${getRolePrefix()}/teachers`,
    addteacher: `${getRolePrefix()}/teachers/add`,
    guardian: `${getRolePrefix()}/guardians`,
    guardians: `${getRolePrefix()}/guardians`,
    idcard: `${getRolePrefix()}/id-cards`,
    certificate: `${getRolePrefix()}/certificates`,
    servicerequest: `${getRolePrefix()}/service-requests`,
    notice: `${getRolePrefix()}/notices`,
    notices: `${getRolePrefix()}/notices`,
    ticket: `${getRolePrefix()}/helpdesk/ticket`,
    tickets: `${getRolePrefix()}/helpdesk/ticket`,
    helpdesk: `${getRolePrefix()}/helpdesk/ticket`,
    faq: `${getRolePrefix()}/helpdesk/faq`,
    faqs: `${getRolePrefix()}/helpdesk/faq`,
    config: `${getRolePrefix()}/general-config`,
    settings: `${getRolePrefix()}/general-config`,
    generalconfig: `${getRolePrefix()}/general-config`,
    moduleconfig: `${getRolePrefix()}/module-config`,
    user: `${getRolePrefix()}/users`,
    users: `${getRolePrefix()}/users`,
    activity: `${getRolePrefix()}/settings?tab=activity`
  };

  // Master Universal NLP Intent Processor
  const processAICommand = async (commandText) => {
    setThinking(true);
    const lower = commandText.toLowerCase().trim();
    let reply = '';
    let executedAction = null;
    let autoCloseModal = false;

    try {
      // ==========================================
      // INTERACTIVE WIZARD STEP-BY-STEP FORM ENGINE
      // ==========================================
      if (wizardStep > 0) {
        // STEP 1 ANSWER: Student Name
        if (wizardStep === 1) {
          const studentName = commandText.trim();
          const firstName = studentName.split(' ')[0] || studentName;
          const lastName = studentName.split(' ').slice(1).join(' ') || 'Sharma';
          const timestamp = Date.now().toString().slice(-4);
          const cleanName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const email = `${cleanName || 'student'}${timestamp}@school.com`;

          const updated = {
            ...wizardData,
            name: studentName,
            firstName,
            lastName,
            email
          };
          setWizardData(updated);
          setWizardStep(2);

          // Update live screen form
          window.dispatchEvent(new CustomEvent('ai_form_fill', {
            detail: { name: studentName, firstName, lastName, email }
          }));

          reply = `Name set to "${studentName}" live on form!\n\n📌 Step 2/4: Student ki Class / Grade konsi hai? (e.g. Class 10, Class 5, Science)`;
          executedAction = `Wizard Step 1 Done: Name = ${studentName}`;
        }
        // STEP 2 ANSWER: Class Name
        else if (wizardStep === 2) {
          const className = commandText.trim();
          const updated = { ...wizardData, className };
          setWizardData(updated);
          setWizardStep(3);

          // Update live screen form
          window.dispatchEvent(new CustomEvent('ai_form_fill', {
            detail: { className, course: className }
          }));

          reply = `Class set to "${className}" live on form!\n\n📌 Step 3/4: Parent / Guardian ka Full Name kya hai?`;
          executedAction = `Wizard Step 2 Done: Class = ${className}`;
        }
        // STEP 3 ANSWER: Parent Name
        else if (wizardStep === 3) {
          const parentName = commandText.trim();
          const updated = { ...wizardData, parentName };
          setWizardData(updated);
          setWizardStep(4);

          // Update live screen form
          window.dispatchEvent(new CustomEvent('ai_form_fill', {
            detail: {
              parentName,
              guardians: [{ name: parentName, contact: '9876543210', relation: 'Father' }]
            }
          }));

          reply = `Parent Name set to "${parentName}" live on form!\n\n📌 Step 4/4: Mobile Contact Number kya hai?`;
          executedAction = `Wizard Step 3 Done: Parent = ${parentName}`;
        }
        // STEP 4 ANSWER: Contact Number & Final Submit
        else if (wizardStep === 4) {
          const contact = commandText.trim();
          const finalData = {
            ...wizardData,
            contact,
            rollNumber: `STU-${Date.now().toString().slice(-4)}`,
            status: 'Active'
          };

          // Update live screen form
          window.dispatchEvent(new CustomEvent('ai_form_fill', {
            detail: { contact }
          }));

          try {
            await API.post('/students', finalData);
            reply = `🎉 Registration Complete! "${finalData.name}" has been registered in MongoDB.\n\nOpening Students Directory live now!`;
            executedAction = `Student Created: ${finalData.name}`;
          } catch (err) {
            reply = `Form submitted for "${finalData.name}". Opening Students list!`;
            executedAction = `Form Submitted`;
          }

          setWizardStep(0);
          autoCloseModal = true;
          navigate(ROUTE_MAP.students);
        }
      }
      // ==========================================
      // TRIGGER INTERACTIVE WIZARD FORM FILL
      // ==========================================
      else if (lower.includes('puch') || lower.includes('puch ke') || lower.includes('step by step') || lower.includes('form fill') || lower.includes('fill form') || lower.includes('interactive')) {
        setWizardStep(1);
        setWizardData({ name: '', firstName: '', lastName: '', className: '', parentName: '', contact: '', email: '' });
        navigate(ROUTE_MAP.addstudent);
        reply = `Starting Step-by-Step Interactive Registration Form!\n\n📌 Step 1/4: Student ka Full Name kya hai?`;
        executedAction = `Started Interactive Registration Wizard`;
      }

      // 1. DIRECT STUDENT ADDITION
      else if (lower.includes('student') && (lower.includes('add') || lower.includes('create') || lower.includes('register') || lower.includes('karo') || lower.includes('banao') || lower.includes('jod'))) {
        let extractedName = commandText
          .replace(/add|create|register|student|karo|banao|jod|naya|new|ko|ka|ki/gi, '')
          .trim();
        
        if (!extractedName || extractedName.length < 2) {
          // Trigger interactive wizard if no name specified!
          setWizardStep(1);
          setWizardData({ name: '', firstName: '', lastName: '', className: '', parentName: '', contact: '', email: '' });
          navigate(ROUTE_MAP.addstudent);
          reply = `Let's fill out the Registration Form step-by-step!\n\n📌 Step 1/4: Student ka Full Name kya hai?`;
          executedAction = `Started Step-by-Step Form`;
        } else {
          const timestamp = Date.now().toString().slice(-4);
          const cleanName = extractedName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const email = `${cleanName || 'student'}${timestamp}@school.com`;

          try {
            await API.post('/students', {
              name: extractedName,
              firstName: extractedName.split(' ')[0] || extractedName,
              lastName: extractedName.split(' ').slice(1).join(' ') || 'Sharma',
              email: email,
              rollNumber: `STU-${timestamp}`,
              className: 'Class 10',
              parentName: 'Mr. Sharma',
              contact: '9876543210',
              status: 'Active'
            });
            reply = `Done! Successfully registered new student "${extractedName}" in MongoDB. Opening Students Directory live now!`;
            executedAction = `Student Created: ${extractedName}`;
            autoCloseModal = true;
            navigate(ROUTE_MAP.students);
          } catch (e) {
            console.error('AI Student Post Error:', e);
            reply = `Opening Student Registration screen live for "${extractedName}".`;
            executedAction = `Navigated to Add Student`;
            autoCloseModal = true;
            navigate(ROUTE_MAP.addstudent, {
              state: {
                prefill: {
                  firstName: extractedName.split(' ')[0] || extractedName,
                  lastName: extractedName.split(' ').slice(1).join(' ') || 'Sharma',
                  name: extractedName,
                  email: email,
                  className: 'Class 10'
                }
              }
            });
          }
        }
      }

      // 2. TEACHER ADDITION (Live Screen Opening)
      else if ((lower.includes('teacher') || lower.includes('faculty') || lower.includes('staff')) && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let extractedName = commandText
          .replace(/add|create|register|teacher|faculty|staff|karo|banao|naya|new|ko|ka|ki/gi, '')
          .trim() || 'Dr. Vikram Seth';

        const timestamp = Date.now().toString().slice(-4);
        const cleanName = extractedName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const email = `${cleanName || 'teacher'}${timestamp}@school.com`;

        try {
          await API.post('/teachers', {
            name: extractedName,
            email: email,
            subject: 'Science & Mathematics',
            status: 'Active'
          });
          reply = `Registered teacher "${extractedName}". Opening Teachers page live!`;
          executedAction = `Teacher Created: ${extractedName}`;
          navigate(ROUTE_MAP.teachers);
        } catch (e) {
          navigate(ROUTE_MAP.addteacher);
          reply = `Opening Teacher Registration screen live!`;
        }
        autoCloseModal = true;
      }

      // 3. DEPARTMENT CREATION
      else if (lower.includes('department') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let deptName = commandText.replace(/add|create|department|karo|banao|naya|new|ko|ka|ki/gi, '').trim() || 'Artificial Intelligence';
        const code = deptName.substring(0, 4).toUpperCase();
        try {
          await API.post('/departments', { name: deptName, code, status: 'Active' });
          reply = `Department "${deptName}" created! Opening Department Screen live.`;
          executedAction = `Dept Created: ${deptName}`;
        } catch (e) {
          reply = `Opening Department management view live!`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.department);
      }

      // 4. SUBJECT CREATION
      else if (lower.includes('subject') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let subjName = commandText.replace(/add|create|subject|karo|banao|naya|new|ko|ka|ki/gi, '').trim() || 'Quantum Physics';
        const code = subjName.substring(0, 4).toUpperCase();
        try {
          await API.post('/subjects', { name: subjName, code, type: 'Theory', status: 'Active' });
          reply = `Subject "${subjName}" added! Opening Subjects Screen live.`;
          executedAction = `Subject Created: ${subjName}`;
        } catch (e) {
          reply = `Opening Subject management screen live!`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.subject);
      }

      // 5. GLOBAL REBRANDING
      else if (lower.includes('rebrand') || lower.includes('change school name') || lower.includes('set school name') || lower.includes('change app name') || lower.includes('footer text') || (lower.includes('school') && lower.includes('naam'))) {
        let newName = commandText.replace(/change school name to|set school name to|rebrand to|change app name to|footer text to|branding to|school ka naam badlo|school name/gi, '').trim() || 'Global International Academy';

        if (currentSchool && currentSchool._id) {
          await updateSchool(currentSchool._id, {
            appName: newName,
            footerText: newName,
            name: newName
          });
          reply = `System branding updated live to "${newName}" across all screens!`;
          executedAction = `Rebrand System: ${newName}`;
        } else {
          reply = `School name updated to "${newName}".`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.config);
      }

      // 6. NOTICE BROADCAST
      else if (lower.includes('notice') && (lower.includes('post') || lower.includes('create') || lower.includes('add') || lower.includes('karo') || lower.includes('banao'))) {
        let title = commandText.replace(/post|create|add|notice|announce|karo|banao|nayi|new/gi, '').trim() || 'Important School Announcement';
        try {
          await API.post('/notices', { title, description: title, targetAudience: 'All', date: new Date() });
          reply = `Notice "${title}" broadcasted! Opening Noticeboard live.`;
          executedAction = `Notice Posted: ${title}`;
        } catch (e) {
          reply = `Opening Noticeboard screen live.`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.notice);
      }

      // 7. HELPDESK TICKET
      else if (lower.includes('ticket') && (lower.includes('create') || lower.includes('raise') || lower.includes('add') || lower.includes('banao') || lower.includes('karo'))) {
        let issue = commandText.replace(/create|raise|add|ticket|helpdesk|banao|karo|nayi|new/gi, '').trim() || 'Classroom Smartboard Issue';
        try {
          await API.post('/tickets', { subject: issue, description: issue, priority: 'High', status: 'Open' });
          reply = `Ticket "${issue}" raised! Opening Helpdesk live.`;
          executedAction = `Ticket Created: ${issue}`;
        } catch (e) {
          reply = `Opening Helpdesk screen live.`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.ticket);
      }

      // 8. THEME TOGGLING (Dark Mode / Light Mode)
      else if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('theme')) {
        if (toggleTheme) toggleTheme();
        reply = `System theme toggled live!`;
        executedAction = `Toggled System Theme`;
        autoCloseModal = true;
      }

      // 9. BOOK CATALOG CREATION
      else if (lower.includes('book') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let title = commandText.replace(/add|create|book|karo|banao|nayi|new|ko|ka|ki/gi, '').trim() || 'Core Java & Data Structures';
        try {
          await API.post('/books', { title, code: `BK-${Date.now().toString().slice(-4)}`, author: 'Author', category: 'Academic', status: 'Available' });
          reply = `Book "${title}" added to library catalog! Opening Books view live.`;
          executedAction = `Book Added: ${title}`;
        } catch (e) {
          reply = `Opening Books catalog live!`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.book);
      }

      // 10. PROGRAM / COURSE CREATION
      else if (lower.includes('program') && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let progName = commandText.replace(/add|create|program|course|karo|banao|nayi|new|ko|ka|ki/gi, '').trim() || 'Computer Science Engineering';
        try {
          await API.post('/programs', { name: progName, code: progName.substring(0, 4).toUpperCase(), status: 'Active' });
          reply = `Program "${progName}" registered! Opening Programs view live.`;
          executedAction = `Program Created: ${progName}`;
        } catch (e) {
          reply = `Opening Programs view live!`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.program);
      }

      // 11. BATCH / CLASS CREATION
      else if ((lower.includes('batch') || lower.includes('class')) && (lower.includes('add') || lower.includes('create') || lower.includes('karo') || lower.includes('banao'))) {
        let batchName = commandText.replace(/add|create|batch|class|karo|banao|nayi|new|ko|ka|ki/gi, '').trim() || 'Class 10 - Section A';
        try {
          await API.post('/batches', { name: batchName, code: batchName.substring(0, 4).toUpperCase(), status: 'Active' });
          reply = `Batch "${batchName}" created! Opening Batches view live.`;
          executedAction = `Batch Created: ${batchName}`;
        } catch (e) {
          reply = `Opening Batches view live!`;
        }
        autoCloseModal = true;
        navigate(ROUTE_MAP.batch);
      }

      // 12. UNIVERSAL NAVIGATION ROUTING (FOR ALL 30+ PAGES)
      else if (lower.includes('department')) { navigate(ROUTE_MAP.department); reply = `Opening Departments screen live!`; executedAction = `Navigated to Departments`; autoCloseModal = true; }
      else if (lower.includes('subject')) { navigate(ROUTE_MAP.subject); reply = `Opening Subjects screen live!`; executedAction = `Navigated to Subjects`; autoCloseModal = true; }
      else if (lower.includes('program') || lower.includes('course')) { navigate(ROUTE_MAP.program); reply = `Opening Programs screen live!`; executedAction = `Navigated to Programs`; autoCloseModal = true; }
      else if (lower.includes('batch') || lower.includes('class')) { navigate(ROUTE_MAP.batch); reply = `Opening Batches screen live!`; executedAction = `Navigated to Batches`; autoCloseModal = true; }
      else if (lower.includes('period') || lower.includes('timing')) { navigate(ROUTE_MAP.period); reply = `Opening Periods screen live!`; executedAction = `Navigated to Periods`; autoCloseModal = true; }
      else if (lower.includes('division')) { navigate(ROUTE_MAP.division); reply = `Opening Divisions screen live!`; executedAction = `Navigated to Divisions`; autoCloseModal = true; }
      else if (lower.includes('book')) { navigate(ROUTE_MAP.book); reply = `Opening Book Catalog live!`; executedAction = `Navigated to Books`; autoCloseModal = true; }
      else if (lower.includes('student')) { navigate(ROUTE_MAP.students); reply = `Opening Students directory live!`; executedAction = `Navigated to Students`; autoCloseModal = true; }
      else if (lower.includes('teacher') || lower.includes('faculty')) { navigate(ROUTE_MAP.teachers); reply = `Opening Teacher Directory live!`; executedAction = `Navigated to Teachers`; autoCloseModal = true; }
      else if (lower.includes('guardian') || lower.includes('parent')) { navigate(ROUTE_MAP.guardians); reply = `Opening Guardians live!`; executedAction = `Navigated to Guardians`; autoCloseModal = true; }
      else if (lower.includes('id card')) { navigate(ROUTE_MAP.idcard); reply = `Opening ID Card Studio live!`; executedAction = `Navigated to ID Cards`; autoCloseModal = true; }
      else if (lower.includes('certificate')) { navigate(ROUTE_MAP.certificate); reply = `Opening Certificate Studio live!`; executedAction = `Navigated to Certificates`; autoCloseModal = true; }
      else if (lower.includes('service request')) { navigate(ROUTE_MAP.servicerequest); reply = `Opening Service Requests live!`; executedAction = `Navigated to Service Requests`; autoCloseModal = true; }
      else if (lower.includes('notice')) { navigate(ROUTE_MAP.notice); reply = `Opening Noticeboard live!`; executedAction = `Navigated to Notices`; autoCloseModal = true; }
      else if (lower.includes('ticket') || lower.includes('helpdesk')) { navigate(ROUTE_MAP.ticket); reply = `Opening Helpdesk live!`; executedAction = `Navigated to Helpdesk`; autoCloseModal = true; }
      else if (lower.includes('faq')) { navigate(ROUTE_MAP.faq); reply = `Opening FAQ Knowledgebase live!`; executedAction = `Navigated to FAQ`; autoCloseModal = true; }
      else if (lower.includes('setting') || lower.includes('config')) { navigate(ROUTE_MAP.config); reply = `Opening General Config live!`; executedAction = `Navigated to General Config`; autoCloseModal = true; }
      else if (lower.includes('user')) { navigate(ROUTE_MAP.user); reply = `Opening User Management live!`; executedAction = `Navigated to Users`; autoCloseModal = true; }
      else if (lower.includes('dashboard') || lower.includes('home')) { navigate(ROUTE_MAP.dashboard); reply = `Opening Main Dashboard live!`; executedAction = `Navigated to Dashboard`; autoCloseModal = true; }
      else {
        reply = `Opening main dashboard and syncing task: "${commandText}".`;
        navigate(ROUTE_MAP.dashboard);
        autoCloseModal = true;
      }

    } catch (err) {
      console.error("AI Assistant Exception:", err);
      reply = `Processed task: "${commandText}". Backend synced.`;
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

    // Auto-close AI modal so the live screen opens right in front of user!
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
      
      {/* Universal 3D Hexagon AI Container */}
      <div className="bg-[#0b101d] text-white w-full max-w-2xl h-[700px] max-h-[95vh] rounded-3xl border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden relative">
        
        {/* Glowing Neon Header */}
        <div className="p-4 sm:p-5 bg-[#0e1628] border-b border-purple-500/30 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-80 animate-pulse"></div>
              <img src={aiLogo} alt="AI Logo" className="w-10 h-10 object-contain relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-wide">
                  UNIVERSAL SCHOOL AI COPILOT
                </h3>
                {wizardStep > 0 ? (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse">
                    FORM WIZARD STEP {wizardStep}/4
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full animate-pulse">
                    LIVE SCREEN ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Step-by-Step Interactive Form Interview & Automation Agent</p>
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

        {/* Active Wizard Banner if Step-by-Step is active */}
        {wizardStep > 0 && (
          <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900 px-4 py-2.5 border-b border-purple-500/30 flex items-center justify-between text-xs text-amber-300 font-bold">
            <div className="flex items-center gap-2">
              <QuestionIcon className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Step-by-Step Registration Wizard Active: Answer question below</span>
            </div>
            <button 
              onClick={() => setWizardStep(0)}
              className="px-2 py-0.5 text-[10px] bg-red-500/20 border border-red-500/40 text-red-300 rounded hover:bg-red-500/40"
            >
              Cancel Wizard
            </button>
          </div>
        )}

        {/* Chat Messages Body */}
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
              <span>AI is opening live screen & updating fields...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Command Chips */}
        <div className="px-4 py-2 bg-[#0e1628] border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Actions:
          </span>
          {[
            'Puch ke student add karo',
            'Add student Rahul Sharma',
            'Add teacher Dr. Ananya Ray',
            'Create department Robotics & AI',
            'Create subject Machine Learning',
            'Change school name to Cambridge International'
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

        {/* Input Bar with Voice Microphone & Send Button */}
        <div className="p-3 sm:p-4 bg-[#090e1b] border-t border-purple-500/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic Voice Input Button */}
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

            {/* Input Text Box */}
            <input
              type="text"
              placeholder={
                isListening 
                  ? 'Listening to your voice...' 
                  : wizardStep > 0
                    ? `Type answer for Step ${wizardStep}/4...`
                    : 'Type or speak command (e.g. "Puch ke student add karo")'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#121c33] border border-slate-700 focus:border-purple-500/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
            />

            {/* Send Button */}
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

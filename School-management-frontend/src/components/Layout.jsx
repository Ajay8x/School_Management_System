import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SchoolContext } from '../context/SchoolContext';
import API from '../api/axios';
import Footer from './Footer';
import AiAssistant from './AiAssistant';
import aiLogo from '../assets/ai-logo.png';
import { 
  LayoutDashboard, Menu, Search, Sun, Moon, Bell, Settings,
  ChevronDown, ChevronRight, CheckCircle, GraduationCap, Users, UserCheck, 
  BookOpen, FileText, CreditCard, Clock, UserPlus, FileBadge, Library, 
  Wallet, Briefcase, ClipboardList, Calendar, MessageSquare, ShieldCheck, LogOut, Key, X,
  Home, Check, Building, Sliders, ChevronUp, Wrench, Activity, Boxes, Image as ImageIcon,
  CheckSquare, HelpCircle, Folder, Truck, Package, ShoppingBag, FileEdit, Newspaper,
  ShieldAlert, PhoneCall, Utensils, FileCode, Globe, LogIn, Mail, List, MessageCircle, Share2, Languages,
  QrCode, Download, RefreshCw
} from 'lucide-react';



// Custom Sidebar Item Component
const SidebarItem = ({ item, isActive, onToggle, isExpanded }) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  if (hasSubmenu) {
    return (
      <li className="px-4 mb-1">
        <button
          onClick={() => onToggle(item.name)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
            isActive || isExpanded
              ? 'bg-teal-500 text-white shadow-sm' 
              : 'text-[#5c5c5c] dark:text-slate-300 hover:bg-[#f0f5fb] dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <item.icon className={`w-5 h-5 ${isActive || isExpanded ? 'text-white' : 'text-[#8a98ac] dark:text-slate-400'}`} strokeWidth={1.5} />}
            <span className="font-medium text-[15px]">{item.name}</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4 opacity-80" /> : <ChevronRight className="w-4 h-4 opacity-80" />}
        </button>
        
        {/* Submenu Accordion */}
        <div className={`accordion-content pl-11 pr-4 ${isExpanded ? 'open mt-1 mb-2' : 'closed'}`}>
          <ul className="space-y-1 relative before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-[1px] before:bg-gray-200 dark:before:bg-slate-600">
            {item.submenu.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <li key={sub.name} className="relative">
                  <Link
                    to={sub.href}
                    className="flex items-center space-x-2.5 px-3 py-1.5 text-[14px] text-gray-500 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-700/50"
                  >
                    {SubIcon ? (
                      <SubIcon className="w-4 h-4 text-gray-400 dark:text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-500 flex-shrink-0 ml-1"></span>
                    )}
                    <span className="truncate">{sub.name}</span>
                  </Link>
                </li>
              );
            })}

          </ul>
        </div>
      </li>
    );
  }

  return (
    <li className="px-4 mb-1">
      <Link
        to={item.href}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-teal-500 text-white shadow-sm' 
            : 'text-[#5c5c5c] dark:text-slate-300 hover:bg-[#f0f5fb] dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400'
        }`}
      >
        {item.icon && <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8a98ac] dark:text-slate-400'}`} strokeWidth={1.5} />}
        <span className="font-medium text-[15px]">{item.name}</span>
      </Link>
    </li>
  );
};

export default function Layout() {
  const { user, loading, logout } = useContext(AuthContext);
  const { schools, currentSchool, switchSchool, isModuleEnabled, sessionsList, currentSession, switchSession } = useContext(SchoolContext);
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolDropdownRef = useRef(null);

  // Session Dropdown State
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const sessionDropdownRef = useRef(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], teachers: [], guardians: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  // AI Copilot Assistant State
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Notifications State
  const [notices, setNotices] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setShowSchoolDropdown(false);
      }
      if (sessionDropdownRef.current && !sessionDropdownRef.current.contains(e.target)) {
        setShowSessionDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await API.get('/notices');
        const sorted = res.data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setNotices(sorted);
        const lastRead = localStorage.getItem('last_read_notices') || 0;
        const unread = sorted.filter(n => new Date(n.date || n.createdAt).getTime() > Number(lastRead)).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notices for notifications", err);
      }
    };
    if (user) {
      fetchNotices();
    }
  }, [user]);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      localStorage.setItem('last_read_notices', Date.now());
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (currentSchool) {
      const siteTitle = currentSchool.appName || currentSchool.name || 'Campus Pilot';
      document.title = siteTitle;
    }
  }, [currentSchool]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await API.get(`/search?q=${searchQuery}`);
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search failed", error);
        }
        setIsSearching(false);
      } else {
        setShowSearchDropdown(false);
        setSearchResults({ students: [], teachers: [], guardians: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: 'New password must be at least 6 characters', success: '' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New passwords do not match', success: '' });
      return;
    }

    try {
      const payload = { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword };
      const res = await API.put('/auth/change-password', payload);
      setPasswordStatus({ loading: false, error: '', success: res.data.message || 'Password changed successfully' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.response?.data?.message || 'Failed to change password', success: '' });
    }
  };

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setShowSearchDropdown(false);
    setShowSchoolDropdown(false);
    setShowProfileDropdown(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setIsDark(!isDark);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  if (!user) return <Navigate to="/login" />;

  const toggleMenu = (name) => {
    setExpandedMenu(expandedMenu === name ? '' : name);
  };

  const isSuperAdmin = user.role === 'super-admin';

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'], moduleKey: 'dashboard' },
    { 
      name: 'Reception', icon: UserPlus, roles: ['admin', 'super-admin'], moduleKey: 'reception',
      submenu: [
        { name: 'Enquiry', href: '/reception/enquiry', subKey: 'enquiry' },
        { name: 'Visitor Log', href: '/reception/visitor-log', subKey: 'visitorLog' },
        { name: 'Gate Pass', href: '/reception/gate-pass', subKey: 'gatePass' },
        { name: 'Complaint', href: '/reception/complaint', subKey: 'complaint' },
        { name: 'Correspondence', href: '/reception/correspondence', subKey: 'correspondence' },
        { name: 'Query', href: '/reception/query', subKey: 'query' }
      ] 
    },
    { name: 'Task', href: '/task', icon: CheckSquare, roles: ['admin', 'super-admin', 'teacher'], moduleKey: 'task' },
    { 
      name: 'Helpdesk', icon: HelpCircle, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'helpdesk',
      submenu: [
        { name: 'FAQ', href: '/helpdesk/faq' },
        { name: 'Ticket', href: '/helpdesk/ticket' }
      ]
    },

    { 
      name: 'Academic', icon: BookOpen, roles: ['admin', 'super-admin', 'teacher', 'student'], moduleKey: 'academic',
      submenu: [
        { name: 'Department', href: '/academic/department' },
        { name: 'Program', href: '/academic/program' },
        { name: 'Session', href: '/academic/session' },
        { name: 'Period', href: '/academic/period' },
        { name: 'Division', href: '/academic/division' },
        { name: 'Course', href: '/academic/course' },
        { name: 'Batch', href: '/academic/batch' },
        { name: 'Subject', href: '/academic/subject' },
        { name: 'Class Timing', href: '/academic/class-timing' },
        { name: 'Timetable', href: '/academic/routine' },
        { name: 'Book list', href: '/academic/book-list' },
        { name: 'Certificate', href: '/academic/certificates' },
        { name: 'ID Card Template', href: '/academic/id-card-templates' },
        { name: 'ID Card', href: '/academic/id-cards' }
      ]
    },

    { 
      name: 'Student', icon: GraduationCap, roles: ['admin', 'super-admin', 'teacher'], moduleKey: 'student',
      submenu: [
        { name: 'Students', href: '/students' },
        { name: 'Registration', href: '/students/registration', subKey: 'registration' },
        { name: 'Roll Number', href: '/students/roll-number', subKey: 'rollNumber' },
        { name: 'Photo', href: '/students/photo', subKey: 'photo' },
        { name: 'Health Record', href: '/students/health-record', subKey: 'healthRecord' },
        { name: 'Elective Subject', href: '/students/elective-subject', subKey: 'electiveSubject' },
        { name: 'Attendance', href: '/students/attendance', subKey: 'attendance' },
        { name: 'Fee Allocation', href: '/students/fee-allocation', subKey: 'feeAllocation' },
        { name: 'Service Allocation', href: '/students/service-allocation', subKey: 'serviceAllocation' },
        { name: 'Promotion', href: '/students/promotion', subKey: 'promotion' },
        { name: 'Edit Request', href: '/students/edit-request', subKey: 'editRequest' },
        { name: 'Service Request', href: '/students/service-request', subKey: 'serviceRequest' },
        { name: 'Leave Request', href: '/students/leave-request', subKey: 'leaveRequest' },
        { name: 'Transfer Request', href: '/students/transfer-request', subKey: 'transferRequest' },
        { name: 'Transfer', href: '/students/transfer', subKey: 'transfer' },
        { name: 'Alumni', href: '/students/alumni', subKey: 'alumni' },
        { name: 'Report', href: '/students/report', subKey: 'report' },
        { name: 'Config', href: '/students/config', subKey: 'config' }
      ] 
    },
    { 
      name: 'Finance', icon: CreditCard, roles: ['admin', 'super-admin', 'accountant', 'parent'], moduleKey: 'finance',
      submenu: [
        { name: 'Payment Method', href: '/finance/payment-method' },
        { name: 'Fee Group', href: '/finance/fee-group' },
        { name: 'Fee Head', href: '/finance/fee-head' },
        { name: 'Fee Component', href: '/finance/fee-component' },
        { name: 'Fee Concession', href: '/finance/fee-concession' },
        { name: 'Fee Structure', href: '/fees' },
        { name: 'Ledger Type', href: '/finance/ledger-type' },
        { name: 'Ledger', href: '/finance/ledger' },
        { name: 'Tax', href: '/finance/tax' },
        { name: 'Transaction', href: '/accounts' },
        { name: 'Receipt', href: '/finance/receipt' },
        { name: 'Report', href: '/finance/report' }
      ]
    },

    { 
      name: 'Exam', icon: FileText, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'exam',
      submenu: [
        { name: 'Exams', href: '/examinations' },
        { name: 'Exam Term', href: '/exam/term' },
        { name: 'Exam Grade', href: '/exam/grade-scale' },
        { name: 'Exam Assessment', href: '/exam/assessment' },
        { name: 'Observation Parameter', href: '/exam/observation-parameter' },
        { name: 'Competency Parameter', href: '/exam/competency-parameter' },
        { name: 'Exam Schedule', href: '/exam/schedule' },
        { name: 'Online Exam', href: '/exam/online-exam' },
        { name: 'Exam Form', href: '/exam/form' },
        { name: 'Exam', href: '/examinations' },
        { name: 'Admit Card', href: '/exam/admit-card' },
        { name: 'Exam Mark', href: '/exam/marks' },
        { name: 'Marksheet', href: '/exam/marksheet' },
        { name: 'Report', href: '/exam/report' }
      ]
    },

    { 
      name: 'Employee', icon: Briefcase, roles: ['admin', 'super-admin'], moduleKey: 'employee',
      submenu: [
        { name: 'Employees', href: '/teachers' },
        { name: 'Department', href: '/employee/department' },
        { name: 'Designation', href: '/employee/designation' },
        { name: 'Attendance', href: '/attendance' },
        { name: 'Leave', href: '/leaves' },
        { name: 'Payroll', href: '/employee/payroll' },
        { name: 'Edit Request', href: '/employee/edit-request' }
      ] 
    },

    { 
      name: 'Resource', icon: Folder, roles: ['admin', 'super-admin', 'teacher', 'student'], moduleKey: 'resource',
      submenu: [
        { name: 'Book Lists', href: '/library' },
        { name: 'Student Diary', href: '/resource/student-diary' },
        { name: 'Syllabus', href: '/resource/syllabus' },
        { name: 'Lesson Plan', href: '/resource/lesson-plan' },
        { name: 'Assignment', href: '/resource/assignment' },
        { name: 'Online Class', href: '/resource/online-class' },
        { name: 'Learning Material', href: '/resource/learning-material' },
        { name: 'Download', href: '/resource/download' },
        { name: 'Report', href: '/resource/report' }
      ]
    },

    { 
      name: 'Transport', icon: Truck, roles: ['admin', 'super-admin', 'student', 'parent'], moduleKey: 'transport',
      submenu: [
        { name: 'Transport Route', href: '/transport/route' },
        { name: 'Transport Circle', href: '/transport/circle' },
        { name: 'Transport Fee', href: '/transport/fee' },
        { name: 'Vehicle', href: '/transport/vehicle' },
        { name: 'Report', href: '/transport/report' }
      ]
    },

    { 
      name: 'Calendar', icon: Calendar, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'calendar',
      submenu: [
        { name: 'Holiday', href: '/calendar/holiday' },
        { name: 'Celebration', href: '/calendar/celebration' },
        { name: 'Event', href: '/calendar/event' }
      ]
    },
    { name: 'Notice Board', href: '/notice-board', icon: Bell, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'communication' },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'gallery' },
    { 
      name: 'Inventory', icon: Package, roles: ['admin', 'super-admin', 'accountant'], moduleKey: 'inventory',
      submenu: [
        { name: 'Vendor', href: '/inventory/vendor' },
        { name: 'Category', href: '/inventory/category' },
        { name: 'Item', href: '/inventory/item' },
        { name: 'Bundle', href: '/inventory/bundle' },
        { name: 'Requisition', href: '/inventory/requisition' },
        { name: 'Purchase', href: '/inventory/purchase' },
        { name: 'Return', href: '/inventory/return' },
        { name: 'Transfer', href: '/inventory/transfer' },
        { name: 'Adjustment', href: '/inventory/adjustment' },
        { name: 'Report', href: '/inventory/report' }
      ]
    },
    { 
      name: 'Store', icon: ShoppingBag, roles: ['admin', 'super-admin', 'accountant'], moduleKey: 'store',
      submenu: [
        { name: 'Sale', href: '/store/sale' }
      ]
    },
    { name: 'Blog', href: '/blog', icon: FileEdit, roles: ['admin', 'super-admin', 'teacher', 'student'], moduleKey: 'blog' },
    { name: 'News', href: '/news', icon: Newspaper, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'news' },
    { 
      name: 'Discipline', icon: ShieldAlert, roles: ['admin', 'super-admin', 'teacher'], moduleKey: 'discipline',
      submenu: [
        { name: 'Incident', href: '/discipline/incident' }
      ]
    },
    { name: 'Guardian', href: '/guardians', icon: UserCheck, roles: ['admin', 'super-admin'], moduleKey: 'guardian' },
    { 
      name: 'Approval', icon: CheckCircle, roles: ['admin', 'super-admin', 'teacher'], moduleKey: 'approval',
      submenu: [
        { name: 'Type', href: '/approval/type' },
        { name: 'Request', href: '/approval/request' },
        { name: 'Pending Requests', href: '/approval/pending' },
        { name: 'Processed Requests', href: '/approval/processed' }
      ]
    },

    { name: 'Contact', href: '/contact', icon: PhoneCall, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'contact' },
    { 
      name: 'Mess', icon: Utensils, roles: ['admin', 'super-admin', 'student', 'parent'], moduleKey: 'mess',
      submenu: [
        { name: 'Item', href: '/mess/item' },
        { name: 'Meal', href: '/mess/meal' },
        { name: 'Meal Log', href: '/mess/meal-log' }
      ]
    },

    { 
      name: 'Communication', icon: MessageSquare, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent'], moduleKey: 'communication',
      submenu: [
        { name: 'Announcement', href: '/notice-board' },
        { name: 'Email', href: '/communication/email' },
        { name: 'SMS', href: '/communication/sms' },
        { name: 'WhatsApp', href: '/communication/whatsapp' },
        { name: 'Push Message', href: '/communication/push-message' }
      ] 
    },

    { 
      name: 'Library', icon: Library, roles: ['admin', 'super-admin', 'student', 'teacher', 'librarian'], moduleKey: 'library',
      submenu: [
        { name: 'Book', href: '/library' },
        { name: 'Book Addition', href: '/library/add-book' },
        { name: 'Issue & Return', href: '/library/issue-return' },
        { name: 'Report', href: '/library/report' }
      ]
    },

    { 
      name: 'Activity', icon: Activity, roles: ['admin', 'super-admin', 'teacher', 'student'], moduleKey: 'activity',
      submenu: [
        { name: 'Trip', href: '/activity/trip' }
      ]
    },

    { 
      name: 'Hostel', icon: Building, roles: ['admin', 'super-admin', 'student', 'parent'], moduleKey: 'hostel',
      submenu: [
        { name: 'Hostel', href: '/hostel/list' },
        { name: 'Room Allocation', href: '/hostel/allocation' }
      ]
    },

    { name: 'Form', href: '/form', icon: FileCode, roles: ['admin', 'super-admin', 'teacher', 'student'], moduleKey: 'form' },
    { 
      name: 'Asset', icon: Boxes, roles: ['admin', 'super-admin'], moduleKey: 'asset',
      submenu: [
        { name: 'Building', href: '/asset/building' }
      ]
    },

    { 
      name: 'Site', icon: Globe, roles: ['admin', 'super-admin'], moduleKey: 'site',
      submenu: [
        { name: 'Page', href: '/site/page' },
        { name: 'Menu', href: '/site/menu' },
        { name: 'Block', href: '/site/block' }
      ]
    },

    { 
      name: 'Recruitment', icon: UserPlus, roles: ['admin', 'super-admin'], moduleKey: 'recruitment',
      submenu: [
        { name: 'Job', href: '/recruitment/job' },
        { name: 'Candidate', href: '/recruitment/candidate' },
        { name: 'Interview', href: '/recruitment/interview' }
      ]
    },

    { 
      name: 'Configuration', icon: Settings, roles: ['admin', 'super-admin'], moduleKey: 'generalConfig',
      submenu: [
        { name: 'General', href: '/admin/general-config' },
        { name: 'Roles', href: '/admin/general-config?tab=role' },
        { name: 'Modules', href: '/admin/module-config' }
      ]
    },
    { name: 'User', href: '/users', icon: Users, roles: ['admin', 'super-admin'], moduleKey: 'user' },
    { name: 'Custom Field', href: '/custom-field', icon: Sliders, roles: ['admin', 'super-admin'], moduleKey: 'customField' },
    { 
      name: 'Utility', icon: Wrench, roles: ['admin', 'super-admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'], moduleKey: 'utility',
      submenu: [
        { name: 'Activity Log', href: '/settings?tab=activity' },
        { name: 'Config', href: '/utility/config' }
      ] 
    },
    { 
      name: 'Config', icon: Settings, roles: ['admin', 'super-admin'],
      submenu: [
        { name: 'General Config', href: '/settings?tab=general', icon: Building },
        { name: 'Asset Config', href: '/settings?tab=asset', icon: ImageIcon },
        { name: 'System Config', href: '/settings?tab=system', icon: Settings },
        { name: 'Authentication', href: '/settings?tab=auth', icon: LogIn },
        { name: 'Notification', href: '/settings?tab=notification', icon: Bell },
        { name: 'Mail Config', href: '/settings?tab=mail', icon: Mail },
        { name: 'SMS Config', href: '/settings?tab=sms', icon: MessageSquare },
        { name: 'WhatsApp Config', href: '/settings?tab=whatsapp', icon: MessageSquare },
        { name: 'Mail Template', href: '/settings?tab=mail-template', icon: FileText },
        { name: 'SMS Template', href: '/settings?tab=sms-template', icon: FileText },
        { name: 'WhatsApp Template', href: '/settings?tab=whatsapp-template', icon: FileText },
        { name: 'Push Notification Template', href: '/settings?tab=push-template', icon: FileText },
        { name: 'Feature', href: '/settings?tab=feature', icon: List },
        { name: 'Chat', href: '/settings?tab=chat', icon: MessageCircle },
        { name: 'Module', href: '/settings?tab=module', roles: ['super-admin'], icon: Boxes },
        { name: 'Social Network', href: '/settings?tab=social', icon: Share2 },
        { name: 'Terminology', href: '/settings?tab=terminology', icon: Languages },
        { name: 'Locale', href: '/settings?tab=locale', icon: Globe },
        { name: 'User Credentials', href: '/settings?tab=credentials', roles: ['super-admin'], icon: Key },
        { name: 'Role & Access', href: '/settings?tab=roles', icon: ShieldCheck },
        { name: 'Activity Log', href: '/settings?tab=activity', icon: Activity }
      ] 
    },


  ];



  const navigation = allNavigation
    .filter(item => {
      // Role check
      const hasRole = isSuperAdmin || item.roles.includes(user.role);
      if (!hasRole) return false;

      // Module enabled check (hides menu item if module is disabled for the school)
      // Super admin bypasses this check to always see everything
      if (!isSuperAdmin && item.moduleKey) {
        return isModuleEnabled(item.moduleKey, null, user.role);
      }
      return true;
    })
    .map(item => {
      const routePrefix = (isSuperAdmin || user.role === 'admin') ? '/admin' : `/${user.role}`;
      const itemHref = item.name === 'Dashboard' ? `/${user.role}/dashboard` : `${routePrefix}${item.href}`;

      // Filter submenus based on role permissions and subKeys
      let filteredSubmenu = item.submenu;
      if (item.submenu) {
        filteredSubmenu = item.submenu.filter(sub => {
          if (sub.roles && !isSuperAdmin && !sub.roles.includes(user.role)) return false;
          if (!isSuperAdmin && item.moduleKey && sub.subKey) {
            return isModuleEnabled(item.moduleKey, sub.subKey, user.role);
          }
          return true;
        });
      }


      return {
        ...item,
        href: itemHref,
        submenu: filteredSubmenu ? filteredSubmenu.map(sub => ({ ...sub, href: `${routePrefix}${sub.href}` })) : undefined
      };
    });


  return (
    <div className="min-h-screen bg-[#F0F5FB] dark:bg-slate-900 flex font-sans transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col h-screen w-[270px] bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.03)] flex-shrink-0 transition-transform duration-300`}>
        
        {/* Logo Area */}
        <div className="h-[74px] flex items-center px-5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 transition-colors duration-300">
          <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-2">
            {currentSchool?.assets?.logo || currentSchool?.assets?.icon || currentSchool?.logoUrl ? (
              <img 
                src={currentSchool?.assets?.logo || currentSchool?.assets?.icon || currentSchool?.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="text-teal-500 flex-shrink-0">
                <CheckCircle className="w-8 h-8 fill-teal-50 dark:fill-slate-700 text-teal-500" strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold text-gray-800 dark:text-white tracking-tight truncate max-w-[170px]" title={currentSchool?.appName || currentSchool?.name || 'Campus Pilot'}>
                {currentSchool?.appName || currentSchool?.name || 'Campus Pilot'}
              </h1>
              {currentSchool?.code && (
                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tracking-wider truncate">
                  CODE: {currentSchool.code}
                </p>
              )}
            </div>
          </Link>
        </div>
        
        {/* User Profile Summary */}
        <div className="p-3.5 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-3 bg-[#f8f9fa] dark:bg-slate-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-600 transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <div className="w-9 h-9 rounded-full bg-[#fbd4a3] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fbd4a3&color=a05400`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 dark:text-white text-[13.5px] leading-tight truncate">{user.name}</p>
              <p className="text-[11.5px] text-gray-500 dark:text-slate-400 capitalize leading-tight mt-0.5 truncate">{user.role}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-1">
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const isExpanded = expandedMenu === item.name;
              return (
                <SidebarItem 
                  key={item.name} 
                  item={item} 
                  isActive={isActive} 
                  onToggle={toggleMenu} 
                  isExpanded={isExpanded} 
                />
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3.5 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 transition-colors duration-300">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium text-[14.5px]"
          >
            <LogOut className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
            <span>Log Out</span>
          </button>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-[76px] bg-[#0d1527] dark:bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-300 z-30">
          <div className="flex items-center space-x-4">
            <button 
              className="text-slate-400 hover:text-teal-400 transition p-2 bg-slate-800/80 rounded-lg md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Bar & AI Copilot Logo */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 w-64 xl:w-72 focus-within:ring-1 focus-within:ring-teal-500 transition-all relative">
                <Search className="w-[18px] h-[18px] text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search database..." 
                  className="bg-transparent border-none outline-none w-full text-[13px] text-slate-200 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {if(searchQuery.length >= 2) setShowSearchDropdown(true)}}
                />
                
                {/* Search Dropdown Results */}
                {showSearchDropdown && (
                  <div className="absolute top-12 left-0 w-full lg:w-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-h-[400px] overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">Searching...</div>
                    ) : (
                      <div className="p-2">
                        {searchResults.students.length === 0 && searchResults.teachers.length === 0 && searchResults.guardians.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">No results found for "{searchQuery}"</div>
                        )}
                        
                        {searchResults.students.length > 0 && (
                          <div className="mb-2">
                            <h4 className="px-3 py-1 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Students</h4>
                            {searchResults.students.map(s => (
                              <Link key={s._id} to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/students`} className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{s.name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{s.email || 'No email'}</p>
                              </Link>
                            ))}
                          </div>
                        )}
                        
                        {searchResults.teachers.length > 0 && (
                          <div className="mb-2">
                            <h4 className="px-3 py-1 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Teachers</h4>
                            {searchResults.teachers.map(t => (
                              <Link key={t._id} to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/teachers`} className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{t.name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{t.subject}</p>
                              </Link>
                            ))}
                          </div>
                        )}
                        
                        {searchResults.guardians.length > 0 && (
                          <div>
                            <h4 className="px-3 py-1 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Guardians</h4>
                            {searchResults.guardians.map(g => (
                              <Link key={g._id} to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/guardians/${g._id}`} className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{g.name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{g.relationship}</p>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Copilot Button with Neon Hexagon Logo */}
              <button
                type="button"
                onClick={() => setIsAiAssistantOpen(true)}
                className="relative group px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-purple-500/50 hover:border-pink-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_22px_rgba(236,72,153,0.5)] hover:scale-105 flex items-center gap-2 cursor-pointer"
                title="Open AI School Copilot (Voice & Chat Control)"
              >
                <div className="relative w-7 h-7 flex-shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur-xs opacity-80 animate-pulse"></div>
                  <img src={aiLogo} alt="AI Copilot" className="w-6 h-6 object-contain relative z-10" />
                </div>
                <span className="hidden xl:inline text-xs font-extrabold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-wider">
                  AI COPILOT
                </span>
              </button>
            </div>
          </div>
          
          {/* Topbar Right Area matching Screenshot 1 */}
          <div className="flex items-center space-x-3 md:space-x-4">
            
            {/* Session Switcher Selector matching user screenshot */}
            <div className="relative" ref={sessionDropdownRef}>
              <button
                type="button"
                onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-teal-300 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 transition-all font-semibold text-[13.5px] sm:text-[14.5px] tracking-tight group shadow-sm"
              >
                <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="hidden sm:flex items-center gap-1 truncate">
                  <span>Session {currentSession?.name || '2025-2026'}</span>
                  {(currentSession?.code || currentSession?.shortCode) && (
                    <span className="text-slate-300 font-normal">
                      ({currentSession.code || currentSession.shortCode})
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${showSessionDropdown ? 'rotate-180 text-teal-400' : ''}`} />
              </button>

              {/* Sleek Dark Session Dropdown */}
              {showSessionDropdown && (
                <div className="absolute right-0 mt-2.5 w-64 bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-[#080d19]">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Switch Session
                    </span>
                    <Link
                      to="/admin/academic/session"
                      onClick={() => setShowSessionDropdown(false)}
                      className="text-[11px] font-semibold text-teal-400 hover:text-teal-300"
                    >
                      Manage
                    </Link>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar py-1">
                    {sessionsList && sessionsList.length > 0 ? (
                      sessionsList.map((sess) => {
                        const isSelected = sess._id === currentSession?._id || sess.name === currentSession?.name;
                        return (
                          <button
                            key={sess._id || sess.name}
                            type="button"
                            onClick={() => {
                              switchSession(sess);
                              setShowSessionDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-blue-950/40 text-blue-300 font-semibold border-l-4 border-blue-500'
                                : 'text-slate-300 hover:bg-[#131c31] hover:text-white'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs sm:text-sm font-semibold truncate leading-tight flex items-center gap-1.5">
                                <span className={isSelected ? 'text-blue-200' : ''}>{sess.name}</span>
                                {sess.code && (
                                  <span className="text-xs text-slate-400 font-normal">({sess.code})</span>
                                )}
                              </p>
                              {sess.period && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5 opacity-80">
                                  {sess.period}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No sessions available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* School Switcher Selector (Screenshot 1 Match) */}
            {(isSuperAdmin || user?.role === 'admin') ? (
              <div className="relative" ref={schoolDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-teal-300 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 transition-all font-semibold text-[15px] tracking-tight group shadow-sm"
                >
                  <Building className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span className="hidden md:flex max-w-[180px] sm:max-w-[240px] md:max-w-[320px] truncate items-center gap-1.5">
                    <span className="truncate">{currentSchool?.appName || currentSchool?.name || 'Campus Pilot'}</span>
                    {currentSchool?.code && (
                      <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-teal-500/20 text-teal-300 rounded border border-teal-500/40 flex-shrink-0">
                        {currentSchool.code}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${showSchoolDropdown ? 'rotate-180 text-teal-400' : ''}`} />
                </button>

                {/* Sleek Dark School Dropdown */}
                {showSchoolDropdown && (
                  <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-[#080d19]">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-teal-400" /> Switch School
                      </span>
                      {isSuperAdmin && (
                        <Link
                          to="/admin/general-config"
                          onClick={() => setShowSchoolDropdown(false)}
                          className="text-[11px] font-semibold text-teal-400 hover:text-teal-300"
                        >
                          General Config
                        </Link>
                      )}
                    </div>

                    <div className="max-h-[340px] overflow-y-auto custom-scrollbar py-1">
                      {schools.map((school) => {
                        const isSelected = school._id === currentSchool?._id;
                        return (
                          <button
                            key={school._id}
                            type="button"
                            onClick={() => {
                              switchSchool(school);
                              setShowSchoolDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-[#16233d] text-white'
                                : 'text-slate-300 hover:bg-[#131c31] hover:text-white'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold truncate leading-tight">
                                  {school.name || school.appName}
                                </p>
                                {school.code && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-slate-800 text-teal-400 rounded border border-slate-700 flex-shrink-0">
                                    {school.code}
                                  </span>
                                )}
                              </div>
                              {school.tagline && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5 opacity-80">
                                  {school.tagline}
                                </p>
                              )}
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center flex-shrink-0 text-teal-400">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isSuperAdmin && (
                      <div className="p-2 border-t border-slate-800 bg-[#080d19]">
                        <Link
                          to="/admin/general-config"
                          onClick={() => setShowSchoolDropdown(false)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/30 transition"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Configure School Settings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 text-white px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 font-semibold text-[15px] tracking-tight cursor-default">
                <Building className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="max-w-[180px] sm:max-w-[240px] md:max-w-[320px] truncate flex items-center gap-1.5">
                  <span className="truncate">{currentSchool?.appName || currentSchool?.name || 'Campus Pilot'}</span>
                  {currentSchool?.code && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-teal-500/20 text-teal-300 rounded border border-teal-500/40 flex-shrink-0">
                      {currentSchool.code}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Home Icon */}
            <Link
              to={`/${user.role}/dashboard`}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Home Dashboard"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* Settings Icon */}
            <Link
              to={isSuperAdmin ? '/admin/general-config' : '/admin/settings'}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="General Configuration & Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Clock / Notifications Icon */}
            <div className="relative">
              <button 
                onClick={handleOpenNotifications}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
                title="Notifications"
              >
                <Clock className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Backdrop to close notifications */}
              {showNotifications && (
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              )}

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
                    <span className="text-xs text-teal-500 hover:text-teal-600 cursor-pointer font-bold">
                      <Link to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/notice-board`} onClick={() => setShowNotifications(false)}>
                        View All
                      </Link>
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notices.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-600 opacity-60" />
                        No new notifications
                      </div>
                    ) : (
                      notices.slice(0, 8).map((notice) => (
                        <Link 
                          key={notice._id}
                          to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/notice-board`}
                          onClick={() => setShowNotifications(false)}
                          className="block px-4 py-3 hover:bg-[#f8f9fa] dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700/50 last:border-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-slate-900/50 flex items-center justify-center text-teal-500 mt-0.5 flex-shrink-0">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{notice.title}</p>
                                {notice.category && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-500 uppercase">
                                    {notice.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">{notice.content}</p>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1">{new Date(notice.date || notice.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile Avatar & Full Options Dropdown */}
            <div className="pl-1 border-l border-slate-700/60 flex items-center relative" ref={profileDropdownRef}>
              <button 
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-10 h-10 rounded-full bg-amber-200/80 border-2 border-amber-300/80 shadow-sm overflow-hidden hover:scale-105 transition-transform flex items-center justify-center focus:outline-none"
                title="My Profile Options"
              >
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fbd4a3&color=a05400`} alt="avatar" className="w-full h-full object-cover" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-12 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  
                  {/* Top Header Card */}
                  <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80">
                    <h3 className="font-bold text-gray-800 dark:text-white text-[15px] leading-snug">
                      Welcome {user.name}!
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                      {user.email}
                    </p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate mt-0.5">
                      {currentSchool?.appName || currentSchool?.name || 'Campus Pilot'}
                    </p>
                  </div>

                  {/* Option Items List */}
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar py-1.5 text-sm text-gray-700 dark:text-slate-200">
                    
                    {/* Choose Dark Mode */}
                    <div 
                      onClick={toggleTheme}
                      className="w-full px-5 py-2.5 flex items-center justify-between hover:bg-teal-50/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-[14px]">Choose Dark Mode</span>
                      <div className="flex items-center">
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                      </div>
                    </div>

                    {/* Organization */}
                    <Link 
                      to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/organization`}
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Organization
                    </Link>

                    {/* School */}
                    <Link 
                      to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/school`}
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      School
                    </Link>

                    {/* Role & Permission */}
                    <Link 
                      to={isSuperAdmin || user.role === 'admin' ? '/admin/general-config?tab=role' : '/settings?tab=roles'}
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Role & Permission
                    </Link>

                    {/* Report */}
                    <Link 
                      to={`${(isSuperAdmin || user.role === 'admin') ? '/admin' : `/${user.role}`}/reports`}
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Report
                    </Link>

                    {/* Device */}
                    <Link 
                      to="/settings?tab=system"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Device
                    </Link>

                    {/* Attendance QR Code */}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowQrModal(true);
                      }}
                      className="w-full text-left px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Attendance QR Code
                    </button>

                    {/* Profile */}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full text-left px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Profile
                    </button>

                    {/* User Preference */}
                    <Link 
                      to="/settings?tab=system"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      User Preference
                    </Link>

                    {/* Change Password */}
                    {user?.role !== 'super-admin' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setPasswordStatus({ loading: false, error: '', success: '' });
                          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors pb-3 border-b border-gray-100 dark:border-slate-700/80"
                      >
                        Change Password
                      </button>
                    )}

                    {/* Failed Login Attempt */}
                    <Link 
                      to="/settings?tab=activity"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors pt-3"
                    >
                      Failed Login Attempt
                    </Link>

                    {/* Clear Cache */}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        localStorage.removeItem('cached_search_results');
                        setToastMessage('System cache cleared successfully!');
                        setTimeout(() => setToastMessage(''), 3000);
                      }}
                      className="w-full text-left px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Clear Cache
                    </button>

                    {/* Download Format */}
                    <Link 
                      to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/download-format`}
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Download Format
                    </Link>

                    {/* Support */}
                    <Link 
                      to="/helpdesk/ticket"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-5 py-2.5 font-medium text-[14px] hover:bg-teal-50/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      Support
                    </Link>

                    {/* Logout */}
                    <button 
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-5 py-2.5 font-medium text-[14px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      Logout
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content scrolling area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 bg-[#F0F5FB] dark:bg-slate-900 transition-colors duration-300 flex flex-col justify-between" onClick={() => setShowSearchDropdown(false)}>
          <div className="max-w-7xl mx-auto w-full flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-slate-700 mx-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Change Password</h2>
            
            {passwordStatus.error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                {passwordStatus.error}
              </div>
            )}
            
            {passwordStatus.success && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-4">
                {passwordStatus.success}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {passwordStatus.loading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-slate-700 mx-4 overflow-hidden relative animate-in zoom-in duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center pt-4 pb-2">
              {/* Large Avatar */}
              <div className="w-24 h-24 rounded-full bg-[#fbd4a3] border-4 border-white dark:border-slate-700 shadow-md overflow-hidden mb-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fbd4a3&color=a05400&size=128`} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* User Name */}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{user.name}</h2>
              
              {/* Role Badge */}
              <span className="inline-block mt-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.role}
              </span>

              {/* Info Rows */}
              <div className="w-full mt-6 space-y-3.5 border-t border-gray-100 dark:border-slate-700 pt-5 text-left">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Login Username / Email</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-0.5 break-all">{user.email}</p>
                </div>
                {user.studentId && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Student Link ID</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-0.5 font-mono">{user.studentId}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-8 flex gap-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setPasswordStatus({ loading: false, error: '', success: '' });
                    setPasswordForm({ oldPassword: '', newPassword: '' });
                    setShowPasswordModal(true);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-650 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-gray-100 dark:border-slate-600 transition flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Change Password
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-slate-700 mx-4 relative animate-in zoom-in duration-200 text-center">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Attendance QR Code</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">Scan this QR code for instant check-in/check-out</p>

            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 inline-block mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(user.email || user._id)}`} 
                alt="Attendance QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* AI Copilot Voice & Text Assistant Modal */}
      <AiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />
    </div>
  );
}

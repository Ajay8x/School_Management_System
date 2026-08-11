import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SchoolContext } from '../context/SchoolContext';
import API from '../api/axios';
import { 
  LayoutDashboard, Menu, Search, Sun, Moon, Bell, Settings,
  ChevronDown, ChevronRight, CheckCircle, GraduationCap, Users, UserCheck, 
  BookOpen, FileText, CreditCard, Clock, UserPlus, FileBadge, Library, 
  Wallet, Briefcase, ClipboardList, Calendar, MessageSquare, ShieldCheck, LogOut, Key, X,
  Home, Check, Building, Sliders, ChevronUp
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
            {item.submenu.map((sub) => (
              <li key={sub.name} className="relative">
                <span className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-3 h-[1px] bg-gray-200 dark:bg-slate-600"></span>
                <Link
                  to={sub.href}
                  className="block px-4 py-2 text-[14px] text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
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
  const { schools, currentSchool, switchSchool, isModuleEnabled } = useContext(SchoolContext);
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolDropdownRef = useRef(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], teachers: [], guardians: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Notifications State
  const [notices, setNotices] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close school dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setShowSchoolDropdown(false);
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

    try {
      const res = await API.put('/auth/change-password', passwordForm);
      setPasswordStatus({ loading: false, error: '', success: res.data.message || 'Password changed successfully' });
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordStatus({ loading: false, error: err.response?.data?.message || 'Failed to change password', success: '' });
    }
  };

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setShowSearchDropdown(false);
    setShowSchoolDropdown(false);
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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
    { 
      name: 'Reception', icon: UserPlus, roles: ['admin'], moduleKey: 'reception',
      submenu: [
        { name: 'Enquiry', href: '/reception/enquiry', subKey: 'enquiry' },
        { name: 'Visitor Log', href: '/reception/visitor-log', subKey: 'visitorLog' },
        { name: 'Gate Pass', href: '/reception/gate-pass', subKey: 'gatePass' },
        { name: 'Complaint', href: '/reception/complaint', subKey: 'complaint' },
        { name: 'Correspondence', href: '/reception/correspondence', subKey: 'correspondence' },
        { name: 'Query', href: '/reception/query', subKey: 'query' }
      ] 
    },
    { 
      name: 'Student', icon: GraduationCap, roles: ['admin'], moduleKey: 'student',
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
        { name: 'Report', href: '/students/report', subKey: 'report' }
      ] 
    },
    { 
      name: 'Teachers', icon: Users, roles: ['admin'], moduleKey: 'teachers',
      submenu: [
        { name: 'Teacher List', href: '/teachers', subKey: 'teacherList' },
        { name: 'Add Teacher', href: '/teachers/add', subKey: 'addTeacher' }
      ] 
    },
    { 
      name: 'Guardians', icon: UserCheck, roles: ['admin'], moduleKey: 'guardians',
      submenu: [
        { name: 'Guardian List', href: '/guardians', subKey: 'guardianList' },
        { name: 'Add Guardian', href: '/guardians/add', subKey: 'addGuardian' }
      ]
    },
    { name: 'Classes', href: '/classes', icon: BookOpen, roles: ['admin', 'teacher', 'student'], moduleKey: 'academic' },
    { name: 'Examinations', href: '/examinations', icon: FileText, roles: ['admin', 'teacher', 'student', 'parent'], moduleKey: 'exam' },
    { name: 'Fees Collection', href: '/fees', icon: CreditCard, roles: ['admin', 'parent', 'accountant'], moduleKey: 'finance' },
    { name: 'Attendance', href: '/attendance', icon: Clock, roles: ['admin', 'teacher', 'student', 'parent'], moduleKey: 'attendance' },
    { name: 'Leaves', href: '/leaves', icon: UserPlus, roles: ['admin', 'teacher'], moduleKey: 'leaves' },
    { name: 'Certificate', href: '/certificate', icon: FileBadge, roles: ['admin'], moduleKey: 'certificate' },
    { name: 'Library', href: '/library', icon: Library, roles: ['admin', 'student', 'teacher', 'librarian'], moduleKey: 'library' },
    { name: 'Accounts', href: '/accounts', icon: Wallet, roles: ['admin', 'accountant'], moduleKey: 'accounts' },
    { name: 'HRM', href: '/hrm', icon: Briefcase, roles: ['admin'], moduleKey: 'employee' },
    { name: 'Notice Board', href: '/notice-board', icon: ClipboardList, roles: ['admin', 'teacher', 'student', 'parent'], moduleKey: 'communication' },
    { name: 'Event', href: '/event', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'], moduleKey: 'communication' },
    { name: 'Message', href: '/message', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'], moduleKey: 'communication' },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Module Configuration', href: '/module-config', icon: Sliders, roles: ['super-admin'] },
    { name: 'User Credentials', href: '/credentials', icon: Key, roles: ['super-admin'] },
    { name: 'Role & Access', href: '/roles', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const navigation = allNavigation
    .filter(item => {
      // Role check
      const hasRole = isSuperAdmin || item.roles.includes(user.role);
      if (!hasRole) return false;

      // Module enabled check for non-super-admin
      if (!isSuperAdmin && item.moduleKey) {
        return isModuleEnabled(item.moduleKey);
      }
      return true;
    })
    .map(item => {
      const routePrefix = (isSuperAdmin || user.role === 'admin') ? '/admin' : `/${user.role}`;
      const itemHref = item.name === 'Dashboard' ? `/${user.role}/dashboard` : `${routePrefix}${item.href}`;

      // Filter submenus if subKey is set and not super admin
      let filteredSubmenu = item.submenu;
      if (!isSuperAdmin && item.moduleKey && item.submenu) {
        filteredSubmenu = item.submenu.filter(sub => {
          if (!sub.subKey) return true;
          return isModuleEnabled(item.moduleKey, sub.subKey);
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
      <div className={`fixed inset-y-0 left-0 z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col w-[270px] bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.03)] overflow-y-auto custom-scrollbar flex-shrink-0 transition-transform duration-300`}>
        
        {/* Logo Area */}
        <div className="h-[76px] flex items-center px-6 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 transition-colors duration-300">
          <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-2">
            <div className="text-teal-500">
              <CheckCircle className="w-8 h-8 fill-teal-50 dark:fill-slate-700 text-teal-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-[22px] font-bold text-gray-800 dark:text-white tracking-tight">CampusPilot<span className="font-light">|</span></h1>
          </Link>
        </div>
        
        {/* User Profile Summary */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <div 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-3 bg-[#f8f9fa] dark:bg-slate-700/50 p-3 rounded-xl border border-gray-100 dark:border-slate-600 transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <div className="w-10 h-10 rounded-full bg-[#fbd4a3] flex items-center justify-center overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fbd4a3&color=a05400`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-[14px] leading-tight">{user.name}</p>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 capitalize leading-tight mt-0.5">{user.role}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400 dark:text-slate-500" />
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 py-4 pb-4">
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
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 z-10 transition-colors duration-300">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium text-[15px]"
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
            
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 w-64 xl:w-72 focus-within:ring-1 focus-within:ring-teal-500 transition-all relative">
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
          </div>
          
          {/* Topbar Right Area matching Screenshot 1 */}
          <div className="flex items-center space-x-3 md:space-x-4">
            
            {/* School Switcher Selector (Screenshot 1 Match) */}
            <div className="relative" ref={schoolDropdownRef}>
              <button
                type="button"
                onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                className="flex items-center space-x-2 text-white hover:text-teal-300 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 transition-all font-semibold text-[15px] tracking-tight group shadow-sm"
              >
                <Building className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="max-w-[150px] sm:max-w-[220px] md:max-w-[280px] truncate">
                  {currentSchool?.name || 'Demo International School'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${showSchoolDropdown ? 'rotate-180 text-teal-400' : ''}`} />
              </button>

              {/* Sleek Dark School Dropdown (Exact match to Screenshot 1) */}
              {showSchoolDropdown && (
                <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-[#0c1324] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-[#080d19]">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <SchoolIcon className="w-3.5 h-3.5 text-teal-400" /> Switch School
                    </span>
                    {isSuperAdmin && (
                      <Link
                        to="/admin/module-config"
                        onClick={() => setShowSchoolDropdown(false)}
                        className="text-[11px] font-semibold text-teal-400 hover:text-teal-300"
                      >
                        Manage
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
                            <p className="text-sm font-semibold truncate leading-tight">
                              {school.name}
                            </p>
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
                        to="/admin/module-config"
                        onClick={() => setShowSchoolDropdown(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/30 transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Configure School Modules
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Home Icon */}
            <Link
              to={`/${user.role}/dashboard`}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Home Dashboard"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* Settings Icon */}
            <Link
              to={isSuperAdmin ? '/admin/module-config' : '/admin/settings'}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={isSuperAdmin ? 'Module & School Configuration' : 'Settings'}
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
                      notices.slice(0, 4).map((notice) => (
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
                              <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{notice.title}</p>
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
            
            {/* User Profile Avatar Icon (Screenshot 1 match) */}
            <div className="pl-1 border-l border-slate-700/60 flex items-center">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full bg-amber-200/80 border-2 border-amber-300/80 shadow-sm overflow-hidden hover:scale-105 transition-transform"
                title="My Profile"
              >
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fbd4a3&color=a05400`} alt="avatar" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content scrolling area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 bg-[#F0F5FB] dark:bg-slate-900 transition-colors duration-300" onClick={() => setShowSearchDropdown(false)}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
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
    </div>
  );
}

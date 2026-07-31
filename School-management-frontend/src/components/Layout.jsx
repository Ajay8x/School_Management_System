import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
  LayoutDashboard, Menu, Search, Sun, Moon, Bell, Settings,
  ChevronDown, ChevronRight, CheckCircle, GraduationCap, Users, UserCheck, 
  BookOpen, FileText, CreditCard, Clock, UserPlus, FileBadge, Library, 
  Wallet, Briefcase, ClipboardList, Calendar, MessageSquare, ShieldCheck, LogOut, Key
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
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setIsDark(!isDark);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div></div>;
  if (!user) return <Navigate to="/login" />;

  const toggleMenu = (name) => {
    setExpandedMenu(expandedMenu === name ? '' : name);
  };

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
    { 
      name: 'Reception', icon: UserPlus, roles: ['admin'],
      submenu: [
        { name: 'Enquiry', href: '/reception/enquiry' },
        { name: 'Visitor Log', href: '/reception/visitor-log' },
        { name: 'Gate Pass', href: '/reception/gate-pass' },
        { name: 'Complaint', href: '/reception/complaint' },
        { name: 'Correspondence', href: '/reception/correspondence' },
        { name: 'Query', href: '/reception/query' }
      ] 
    },
    { 
      name: 'Student', icon: GraduationCap, roles: ['admin'],
      submenu: [
        { name: 'Students', href: '/students' },
        { name: 'Registration', href: '/students/registration' },
        { name: 'Roll Number', href: '/students/roll-number' },
        { name: 'Photo', href: '/students/photo' },
        { name: 'Health Record', href: '/students/health-record' },
        { name: 'Elective Subject', href: '/students/elective-subject' },
        { name: 'Attendance', href: '/students/attendance' },
        { name: 'Fee Allocation', href: '/students/fee-allocation' },
        { name: 'Service Allocation', href: '/students/service-allocation' },
        { name: 'Promotion', href: '/students/promotion' },
        { name: 'Edit Request', href: '/students/edit-request' },
        { name: 'Service Request', href: '/students/service-request' },
        { name: 'Leave Request', href: '/students/leave-request' },
        { name: 'Transfer Request', href: '/students/transfer-request' },
        { name: 'Transfer', href: '/students/transfer' },
        { name: 'Alumni', href: '/students/alumni' },
        { name: 'Report', href: '/students/report' }
      ] 
    },
    { 
      name: 'Teachers', icon: Users, roles: ['admin'],
      submenu: [{ name: 'Teacher List', href: '/teachers' }, { name: 'Add Teacher', href: '/teachers/add' }] 
    },
    { 
      name: 'Guardians', icon: UserCheck, roles: ['admin'],
      submenu: [{ name: 'Guardian List', href: '/guardians' }, { name: 'Add Guardian', href: '/guardians/add' }]
    },
    { name: 'Classes', href: '/classes', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
    { name: 'Examinations', href: '/examinations', icon: FileText, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Fees Collection', href: '/fees', icon: CreditCard, roles: ['admin', 'parent', 'accountant'] },
    { name: 'Attendance', href: '/attendance', icon: Clock, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Leaves', href: '/leaves', icon: UserPlus, roles: ['admin', 'teacher'] },
    { name: 'Certificate', href: '/certificate', icon: FileBadge, roles: ['admin'] },
    { name: 'Library', href: '/library', icon: Library, roles: ['admin', 'student', 'teacher', 'librarian'] },
    { name: 'Accounts', href: '/accounts', icon: Wallet, roles: ['admin', 'accountant'] },
    { name: 'HRM', href: '/hrm', icon: Briefcase, roles: ['admin'] },
    { name: 'Notice Board', href: '/notice-board', icon: ClipboardList, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Event', href: '/event', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Message', href: '/message', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'User Credentials', href: '/credentials', icon: Key, roles: ['super-admin'] },
    { name: 'Role & Access', href: '/roles', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const navigation = allNavigation
    .filter(item => user.role === 'super-admin' || item.roles.includes(user.role))
    .map(item => {
      // For both admin and super-admin, use the /admin prefix for most modules
      // This ensures super-admins can reuse the existing admin routes
      const routePrefix = (user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`;
      
      // The Dashboard should still point to their specific dashboard
      const itemHref = item.name === 'Dashboard' ? `/${user.role}/dashboard` : `${routePrefix}${item.href}`;

      return {
        ...item,
        href: itemHref,
        submenu: item.submenu ? item.submenu.map(sub => ({ ...sub, href: `${routePrefix}${sub.href}` })) : undefined
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
          <div className="flex items-center space-x-3 bg-[#f8f9fa] dark:bg-slate-700/50 p-3 rounded-xl border border-gray-100 dark:border-slate-600 transition-colors duration-300">
            <div className="w-10 h-10 rounded-full bg-[#fbd4a3] flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Jone+Copper&background=fbd4a3&color=a05400" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-[14px] leading-tight">{user.name}</p>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 capitalize leading-tight mt-0.5">{user.role}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400 dark:text-slate-500" />
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex-1 py-4 pb-20">
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-[76px] bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center">
            <button 
              className="text-[#8a98ac] hover:text-teal-600 dark:hover:text-teal-400 transition p-2 bg-[#F0F5FB] dark:bg-slate-700 rounded-md mr-4 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-[#F0F5FB] dark:bg-slate-700 rounded-md px-3 py-2 w-72 focus-within:ring-1 focus-within:ring-teal-500 transition-all relative">
              <Search className="w-[18px] h-[18px] text-[#8a98ac] dark:text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-transparent border-none outline-none w-full text-[14px] text-gray-700 dark:text-slate-200 placeholder-[#8a98ac] dark:placeholder-slate-400"
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
          
          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full text-[#8a98ac] hover:bg-[#F0F5FB] dark:hover:bg-slate-700 dark:text-slate-300 transition">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F0F5FB] dark:hover:bg-slate-700 transition">
              <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto rounded-sm shadow-sm" />
            </button>

            <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#8a98ac] hover:bg-[#F0F5FB] dark:hover:bg-slate-700 dark:text-slate-300 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
            </button>
            
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-slate-700 flex items-center">
               <button className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden ml-2 mr-2">
                 <img src="https://ui-avatars.com/api/?name=Jone+Copper&background=fbd4a3&color=a05400" alt="avatar" className="w-full h-full object-cover" />
               </button>
               <button 
                 onClick={() => {
                   setPasswordStatus({ loading: false, error: '', success: '' });
                   setPasswordForm({ oldPassword: '', newPassword: '' });
                   setShowPasswordModal(true);
                 }}
                 className="w-10 h-10 flex items-center justify-center rounded-full text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10 transition"
                 title="Change Password"
               >
                 <Key className="w-5 h-5" />
               </button>
               <button 
                 onClick={logout}
                 className="w-10 h-10 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                 title="Logout"
               >
                 <LogOut className="w-5 h-5" />
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
    </div>
  );
}

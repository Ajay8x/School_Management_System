import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SchoolContext } from '../context/SchoolContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Building, ChevronRight, Home, Key, Tag, Save, RotateCcw, 
  X, Check, AlertCircle, Sparkles, Plus, Globe, Phone, Mail,
  ShieldCheck, Users, UserCheck, GraduationCap, Wallet, Library,
  Search, Lock, Edit3, Trash2, ArrowUpDown, Filter, MoreVertical,
  ChevronDown, ChevronLeft, Eye
} from 'lucide-react';

const INITIAL_ROLES_LIST = [
  { id: '1', name: 'Principal', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '2', name: 'Vice Principal', createdAt: 'February 1, 2025 8:09 PM' },
  { id: '3', name: 'Manager', createdAt: 'January 28, 2025 9:33 AM' },
  { id: '4', name: 'Accountant', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '5', name: 'Staff', createdAt: 'January 28, 2025 9:33 AM' },
  { id: '6', name: 'Attendance Assistant', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '7', name: 'Exam Incharge', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '8', name: 'Guardian', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '9', name: 'Hostel Incharge', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '10', name: 'Inventory Incharge', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '11', name: 'Librarian', createdAt: 'January 28, 2025 9:33 AM' },
  { id: '12', name: 'Mess Incharge', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '13', name: 'Observer', createdAt: 'November 15, 2025 1:28 PM' },
  { id: '14', name: 'Receptionist', createdAt: 'January 28, 2025 9:33 AM' },
  { id: '15', name: 'Student', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '16', name: 'Transport Incharge', createdAt: 'January 29, 2025 9:33 AM' },
  { id: '17', name: 'User', createdAt: 'January 29, 2025 9:33 AM' }
];

const MODULE_PERMISSIONS_SCHEMA = [
  { key: 'reception', name: 'Reception & Visitors', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'academic', name: 'Academic & Courses', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'student', name: 'Student Records', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'finance', name: 'Finance & Fee Collection', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { key: 'exam', name: 'Examinations & Marks', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { key: 'employee', name: 'Employee & HRMS', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'resource', name: 'Resource & Assignments', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'transport', name: 'Transport & Vehicles', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'inventory', name: 'Inventory & Store', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'config', name: 'System Settings & Config', actions: ['view', 'edit'] },
];

const VIEW_ACCESS_MODULES = [
  { key: 'dashboard', name: 'Dashboard & Overview', category: 'General' },
  { key: 'reception', name: 'Reception & Visitors', category: 'Operations' },
  { key: 'academic', name: 'Academic & Courses', category: 'Academic' },
  { key: 'student', name: 'Student Records & Profile', category: 'Academic' },
  { key: 'attendance', name: 'Student & Staff Attendance', category: 'Operations' },
  { key: 'exam', name: 'Examinations, Marks & Results', category: 'Academic' },
  { key: 'finance', name: 'Finance & Fee Collection', category: 'Finance' },
  { key: 'employee', name: 'Employee & HRMS Directory', category: 'HR' },
  { key: 'resource', name: 'Resource & Assignments', category: 'Academic' },
  { key: 'transport', name: 'Transport & Fleet Management', category: 'Operations' },
  { key: 'inventory', name: 'Inventory & Store Stock', category: 'Operations' },
  { key: 'library', name: 'Library & Book Issues', category: 'Academic' },
  { key: 'hostel', name: 'Hostel & Dormitory Management', category: 'Operations' },
  { key: 'reports', name: 'Analytics & Management Reports', category: 'Management' },
  { key: 'config', name: 'System Settings & Config', category: 'Administration' }
];

const PERMISSION_ROWS = [
  { key: 'login:action', name: 'login:action' },
  { key: 'profile:update', name: 'profile:update' },
  { key: 'password:update', name: 'password:update' },
  { key: 'post:config', name: 'post:config' },
  { key: 'post:read', name: 'post:read' },
  { key: 'post:create', name: 'post:create' },
  { key: 'post:edit', name: 'post:edit' },
  { key: 'post:delete', name: 'post:delete' },
  { key: 'post:comment', name: 'post:comment' },
  { key: 'access:reports', name: 'access:reports' },
  { key: 'academic:view', name: 'academic:view' },
  { key: 'student:manage', name: 'student:manage' },
  { key: 'finance:collect', name: 'finance:collect' },
  { key: 'exam:entry', name: 'exam:entry' }
];

export default function GeneralConfig() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentSchool, schools, updateSchool, createSchool, switchSchool } = useContext(SchoolContext);
  const { user } = useContext(AuthContext);

  const isSuperAdmin = user?.role === 'super-admin';
  const activeSchoolName = currentSchool?.name || currentSchool?.appName || 'Demo International School';

  // Sub-navigation active state ('general' | 'role' | 'permission' | 'view-access')
  const initialSubTab = searchParams.get('tab') || 'general';
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general', 'role', 'permission', 'view-access'].includes(tabParam)) {
      setActiveSubTab(tabParam);
    }
  }, [searchParams]);

  const handleSubTabChange = (tabKey) => {
    setActiveSubTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // General Form State
  const [formData, setFormData] = useState({
    name: 'Campus Pilot International School',
    title1: '',
    title2: '',
    title3: '',
    addressLine1: 'BLW Newada, Sunderpur',
    addressLine2: '',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    zipcode: '21005',
    country: 'India',
    email: 'campuspilot@gmail.com',
    phone: '919935332556',
    fax: '',
    website: 'https://www.campuspilot.in',
    identifiers: [
      { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }
    ],
    inchargeDetails: [
      { title: 'Principal', name: 'AMAN PANDEY', email: 'aman@gmail.com', contactNumber: '' },
      { title: 'Vice Principal', name: 'AJAY SINGH', email: 'ajay@gmail.com', contactNumber: '' },
      { title: 'Co-Ordinator', name: 'PRAVEEN', email: 'praveen@GMAIL.COM', contactNumber: '' },
      { title: '', name: '', email: '', contactNumber: '' },
      { title: '', name: '', email: '', contactNumber: '' }
    ]
  });

  // Roles Table State
  const [rolesList, setRolesList] = useState(INITIAL_ROLES_LIST);
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState(INITIAL_ROLES_LIST[0]);
  const [rolePermissionsState, setRolePermissionsState] = useState({});
  const [viewAccessState, setViewAccessState] = useState({});

  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [perPage, setPerPage] = useState('25');

  const activeRole = selectedRoleForMatrix || rolesList[0] || INITIAL_ROLES_LIST[0];

  // Auto scroll permission / view access table to active clicked role column
  useEffect(() => {
    if ((activeSubTab === 'permission' || activeSubTab === 'view-access') && activeRole?.id) {
      const prefix = activeSubTab === 'view-access' ? 'view-access-role-col-header-' : 'role-col-header-';
      const timer = setTimeout(() => {
        const el = document.getElementById(`${prefix}${activeRole.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab, activeRole]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    appName: '', name: '', code: '', website: '', email: '', phone: '', city: '', country: 'India'
  });
  const [onboarding, setOnboarding] = useState(false);

  // Initialize permissions matrix and view access state for all roles (if not already loaded from localStorage)
  useEffect(() => {
    const permKey = `rolePermissionsConfig_${currentSchool?._id || 'default'}`;
    const viewKey = `viewAccessConfig_${currentSchool?._id || 'default'}`;

    const savedPerms = localStorage.getItem(permKey);
    const savedView = localStorage.getItem(viewKey);

    const initialPerms = {};
    const initialViewAccess = {};
    rolesList.forEach(role => {
      initialPerms[role.id] = {};
      initialViewAccess[role.id] = {};
      PERMISSION_ROWS.forEach(mod => {
        initialPerms[role.id][mod.key] = true;
      });
      VIEW_ACCESS_MODULES.forEach(mod => {
        initialViewAccess[role.id][mod.key] = true;
      });
    });

    setRolePermissionsState(savedPerms ? JSON.parse(savedPerms) : initialPerms);
    setViewAccessState(savedView ? JSON.parse(savedView) : initialViewAccess);
  }, [rolesList, currentSchool]);

  // Populate general form from active school context
  useEffect(() => {
    if (currentSchool) {
      setFormData(prev => ({
        ...prev,
        name: currentSchool.name || 'Campus Pilot International School',
        title1: currentSchool.title1 || '',
        title2: currentSchool.title2 || '',
        title3: currentSchool.title3 || '',
        addressLine1: currentSchool.addressLine1 || currentSchool.address || 'BLW Newada, Sunderpur',
        addressLine2: currentSchool.addressLine2 || '',
        city: currentSchool.city || 'Varanasi',
        state: currentSchool.state || 'Uttar Pradesh',
        zipcode: currentSchool.zipcode || '21005',
        country: currentSchool.country || 'India',
        email: currentSchool.email || 'campuspilot@gmail.com',
        phone: currentSchool.phone || '919935332556',
        fax: currentSchool.fax || '',
        website: currentSchool.website || 'https://www.campuspilot.in',
        identifiers: currentSchool.identifiers && currentSchool.identifiers.length === 5 
          ? currentSchool.identifiers 
          : prev.identifiers,
        inchargeDetails: currentSchool.inchargeDetails && currentSchool.inchargeDetails.length === 5 
          ? currentSchool.inchargeDetails 
          : prev.inchargeDetails
      }));
    }
  }, [currentSchool]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdentifierChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.identifiers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, identifiers: updated };
    });
  };

  const handleInchargeChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.inchargeDetails];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, inchargeDetails: updated };
    });
  };

  const handleReset = () => {
    if (currentSchool) {
      setFormData({
        name: currentSchool.name || 'Campus Pilot International School',
        title1: currentSchool.title1 || '',
        title2: currentSchool.title2 || '',
        title3: currentSchool.title3 || '',
        addressLine1: currentSchool.addressLine1 || 'BLW Newada, Sunderpur',
        addressLine2: currentSchool.addressLine2 || '',
        city: currentSchool.city || 'Varanasi',
        state: currentSchool.state || 'Uttar Pradesh',
        zipcode: currentSchool.zipcode || '21005',
        country: currentSchool.country || 'India',
        email: currentSchool.email || 'campuspilot@gmail.com',
        phone: currentSchool.phone || '919935332556',
        fax: currentSchool.fax || '',
        website: currentSchool.website || 'https://www.campuspilot.in',
        identifiers: [
          { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }
        ],
        inchargeDetails: [
          { title: 'Principal', name: 'AMAN PANDEY', email: 'aman@gmail.com', contactNumber: '' },
          { title: 'Vice Principal', name: 'AJAY SINGH', email: 'ajay@gmail.com', contactNumber: '' },
          { title: 'Co-Ordinator', name: 'PRAVEEN', email: 'praveen@GMAIL.COM', contactNumber: '' },
          { title: '', name: '', email: '', contactNumber: '' },
          { title: '', name: '', email: '', contactNumber: '' }
        ]
      });
      setMessage({ type: 'info', text: 'General configuration reset to initial values.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const updatedPayload = {
        ...currentSchool,
        name: formData.name,
        title1: formData.title1,
        title2: formData.title2,
        title3: formData.title3,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        address: `${formData.addressLine1} ${formData.addressLine2}`.trim(),
        email: formData.email,
        phone: formData.phone,
        fax: formData.fax,
        website: formData.website,
        identifiers: formData.identifiers,
        inchargeDetails: formData.inchargeDetails
      };

      await updateSchool(currentSchool._id, updatedPayload);
      document.title = `${formData.name} | Campus Pilot`;
      setMessage({ type: 'success', text: 'General Configuration saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setMessage({ type: 'error', text: 'Failed to save configuration. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newRoleObj = {
      id: String(Date.now()),
      name: newRoleName.trim(),
      createdAt: dateFormatted
    };

    setRolesList([...rolesList, newRoleObj]);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setMessage({ type: 'success', text: `New role "${newRoleObj.name}" added successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredRoles = [...rolesList]
    .filter(r => r.name.toLowerCase().includes(filterSearchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField].toLowerCase();
      let valB = b[sortField].toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const togglePermission = (roleId, moduleKey, action) => {
    setRolePermissionsState(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleKey]: {
          ...prev[roleId]?.[moduleKey],
          [action]: !prev[roleId]?.[moduleKey]?.[action]
        }
      }
    }));
  };

  const handleSavePermissions = () => {
    const permKey = `rolePermissionsConfig_${currentSchool?._id || 'default'}`;
    localStorage.setItem(permKey, JSON.stringify(rolePermissionsState));
    setMessage({ type: 'success', text: `Permissions for role "${selectedRoleForMatrix.name}" saved successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleResetPermissions = () => {
    const permKey = `rolePermissionsConfig_${currentSchool?._id || 'default'}`;
    const resetPerms = {};
    rolesList.forEach(role => {
      resetPerms[role.id] = {};
      [
        'login:action', 'profile:update', 'password:update', 'post:config',
        'post:read', 'post:create', 'post:edit', 'post:delete', 'post:comment',
        'access:reports', 'academic:view', 'student:manage', 'finance:collect', 'exam:entry'
      ].forEach(key => {
        resetPerms[role.id][key] = false;
      });
    });
    setRolePermissionsState(resetPerms);
    localStorage.setItem(permKey, JSON.stringify(resetPerms));
    setMessage({ type: 'info', text: 'All permissions turned OFF (0 / unchecked).' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handleResetViewAccess = () => {
    const viewKey = `viewAccessConfig_${currentSchool?._id || 'default'}`;
    const resetObj = {};
    rolesList.forEach(r => {
      resetObj[r.id] = {};
      VIEW_ACCESS_MODULES.forEach(m => {
        resetObj[r.id][m.key] = false;
      });
    });
    setViewAccessState(resetObj);
    localStorage.setItem(viewKey, JSON.stringify(resetObj));
    setMessage({ type: 'info', text: 'All view access permissions turned OFF (0 / unchecked).' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handleSaveViewAccess = () => {
    const viewKey = `viewAccessConfig_${currentSchool?._id || 'default'}`;
    localStorage.setItem(viewKey, JSON.stringify(viewAccessState));
    setMessage({ type: 'success', text: `View Access permissions saved successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleOnboardSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolData.appName && !newSchoolData.name) return;

    try {
      setOnboarding(true);
      const created = await createSchool({
        ...newSchoolData,
        name: newSchoolData.name || newSchoolData.appName,
        appName: newSchoolData.appName,
        code: newSchoolData.code || (newSchoolData.name || newSchoolData.appName).split(' ').map(w => w[0]).join('').toUpperCase()
      });

      setShowOnboardModal(false);
      setNewSchoolData({ appName: '', name: '', code: '', website: '', email: '', phone: '', city: '', country: 'India' });

      if (created) {
        switchSchool(created);
        setMessage({ type: 'success', text: `New school "${created.name}" onboarded successfully!` });
      }
    } catch (err) {
      console.error('Onboard error:', err);
      setMessage({ type: 'error', text: 'Failed to onboard school. Please try again.' });
    } finally {
      setOnboarding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
            <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
              <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <a href="/schools" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
              School
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-slate-200 truncate max-w-[150px]">
              {activeSchoolName}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">
              Config
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-teal-600 dark:text-teal-400 capitalize">
              {activeSubTab === 'role' ? 'Role' : activeSubTab === 'view-access' ? 'View Access' : activeSubTab}
            </span>
          </nav>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1 capitalize">
            {activeSubTab === 'role' ? 'Role' : activeSubTab === 'view-access' ? 'View Access' : activeSubTab}
          </h1>
        </div>

        {/* Super Admin School Switcher */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentSchool?._id || ''}
              onChange={(e) => {
                const selected = schools.find(s => s._id === e.target.value);
                if (selected) switchSchool(selected);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-teal-500"
            >
              {schools.map(school => (
                <option key={school._id} value={school._id}>
                  {school.name || school.appName} {school.code ? `(${school.code})` : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Onboard School
            </button>
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : message.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            : 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Layout Grid: Config Sidebar + Config Form */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Config Sidebar Navigation */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="bg-slate-950 dark:bg-slate-900 p-2 rounded-2xl shadow-md flex flex-row overflow-x-auto gap-2 md:flex-col md:space-y-1 md:gap-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => handleSubTabChange('general')}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeSubTab === 'general'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 flex-shrink-0" />
              <span>General</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubTabChange('role')}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeSubTab === 'role'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span>Role</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubTabChange('permission')}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeSubTab === 'permission'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4 flex-shrink-0" />
              <span>Permission</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubTabChange('view-access')}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeSubTab === 'view-access'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>View Access</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
          
          {/* TAB 1: GENERAL CONFIGURATION */}
          {activeSubTab === 'general' && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
              
              <div className="p-6 sm:p-8 space-y-8">
                
                {/* SECTION 1: ABOUT */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">About</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This about will be displayed publicly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Title 1</label>
                      <input
                        type="text"
                        name="title1"
                        value={formData.title1}
                        onChange={handleChange}
                        placeholder="Title 1"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Title 2</label>
                      <input
                        type="text"
                        name="title2"
                        value={formData.title2}
                        onChange={handleChange}
                        placeholder="Title 2"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Title 3</label>
                      <input
                        type="text"
                        name="title3"
                        value={formData.title3}
                        onChange={handleChange}
                        placeholder="Title 3"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ADDRESS */}
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Address</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This address will be displayed publicly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="Address Line 1"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Address Line 2"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Zipcode</label>
                      <input
                        type="text"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                        placeholder="Zipcode"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: CONTACT DETAILS */}
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contact Details</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This contact details will be displayed publicly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Fax</label>
                      <input
                        type="text"
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        placeholder="Fax"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Website"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: IDENTIFIER */}
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Identifier</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This identifier will be used to identify the school in the system.</p>
                  </div>

                  <div className="space-y-4">
                    {formData.identifiers.map((item, idx) => (
                      <fieldset key={idx} className="rounded-xl border border-gray-300 dark:border-slate-700 p-4 relative">
                        <legend className="ml-2 px-2 py-0.5 text-xs font-bold text-gray-800 dark:text-slate-200 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                          {idx + 1}.
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Label</label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleIdentifierChange(idx, 'label', e.target.value)}
                              placeholder="Label"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Value</label>
                            <input
                              type="text"
                              value={item.value}
                              onChange={(e) => handleIdentifierChange(idx, 'value', e.target.value)}
                              placeholder="Value"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: INCHARGE DETAILS */}
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Incharge Details</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This incharge details will be displayed publicly.</p>
                  </div>

                  <div className="space-y-4">
                    {formData.inchargeDetails.map((item, idx) => (
                      <fieldset key={idx} className="rounded-xl border border-gray-300 dark:border-slate-700 p-4 relative">
                        <legend className="ml-2 px-2 py-0.5 text-xs font-bold text-gray-800 dark:text-slate-200 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                          {idx + 1}.
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleInchargeChange(idx, 'title', e.target.value)}
                              placeholder="Title"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleInchargeChange(idx, 'name', e.target.value)}
                              placeholder="Name"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                              type="email"
                              value={item.email}
                              onChange={(e) => handleInchargeChange(idx, 'email', e.target.value)}
                              placeholder="Email"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Contact Number</label>
                            <input
                              type="text"
                              value={item.contactNumber}
                              onChange={(e) => handleInchargeChange(idx, 'contactNumber', e.target.value)}
                              placeholder="Contact Number"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border-b-2 border-gray-300 dark:border-slate-600 bg-transparent text-gray-900 dark:text-slate-100 focus:border-teal-500 outline-none transition"
                            />
                          </div>
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form Action Footer Bar */}
              <div className="bg-gray-50 dark:bg-slate-900/60 px-6 py-4 border-t border-gray-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 2: ROLE MANAGEMENT CONFIGURATION TABLE */}
          {activeSubTab === 'role' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 space-y-6">
              
              {/* Top Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRoleModal(true)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    Add Role
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFilterBar(!showFilterBar)}
                    className={`p-2 rounded-xl border text-gray-600 dark:text-slate-300 transition ${
                      showFilterBar 
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-600' 
                        : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-50'
                    }`}
                    title="Toggle Filter"
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
                    title="Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Search Bar */}
              {showFilterBar && (
                <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200/80 dark:border-slate-700/80 flex items-center gap-3 animate-in fade-in duration-200">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search roles by name..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-800 dark:text-slate-100 outline-none placeholder-gray-400"
                  />
                  {filterSearchQuery && (
                    <button onClick={() => setFilterSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>
              )}

              {/* Table Area */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wider">
                      <th 
                        className="py-3 px-4 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>NAME</span>
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                        </div>
                      </th>

                      <th 
                        className="py-3 px-4 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition"
                        onClick={() => toggleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>CREATED AT</span>
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                        </div>
                      </th>

                      <th className="py-3 px-4 w-12 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs text-gray-800 dark:text-slate-200">
                    {sortedAndFilteredRoles.map((role) => (
                      <tr 
                        key={role.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-slate-700/40 transition group"
                      >
                        <td 
                          className="py-3.5 px-4 font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400"
                          onClick={() => {
                            const found = rolesList.find(r => r.id === role.id);
                            if (found) setSelectedRoleForMatrix(found);
                            handleSubTabChange('permission');
                          }}
                        >
                          {role.name}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium">
                          {role.createdAt}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button 
                            type="button" 
                            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                            title="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination & Summary Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
                <div>
                  Showing 1 to {sortedAndFilteredRoles.length} of {rolesList.length} results
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(e.target.value)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button type="button" className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-slate-900 text-white dark:bg-teal-500 rounded-lg text-xs font-bold">1</span>
                    <button type="button" className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40" disabled>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PERMISSIONS MATRIX CONFIGURATION */}
          {activeSubTab === 'permission' && (
            <div className="bg-white dark:bg-slate-800 sm:rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-200">
              
              {/* Top Action Header Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Permission</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Assign role wise permission across all system modules.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    type="text" 
                    placeholder="Search permission action..." 
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilterBar(!showFilterBar)}
                    className="p-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    title="Filter"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: 'info', text: 'User-wise permission feature is coming soon.' });
                      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    User wise Permission
                  </button>
                </div>
              </div>

              {/* Permissions Matrix Table - Role Columns x Permission Rows */}
              <div className="relative overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-max">
                  <thead className="bg-gray-100 dark:bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                    <tr>
                      <th className="sticky left-0 bg-gray-100 dark:bg-slate-900 px-6 py-4 border-b border-r border-gray-200 dark:border-slate-700 z-20 font-extrabold min-w-[200px] shadow-sm">
                        Permission
                      </th>
                      {rolesList.map(role => {
                        const isTarget = activeRole?.id === role.id;
                        return (
                          <th 
                            key={role.id} 
                            id={`role-col-header-${role.id}`}
                            onClick={() => setSelectedRoleForMatrix(role)}
                            className={`cursor-pointer px-5 py-4 border-b border-r border-gray-200 dark:border-slate-700 text-center font-extrabold whitespace-nowrap min-w-[160px] tracking-wide transition-all ${
                              isTarget
                                ? 'bg-teal-500 text-white shadow-md border-x-2 border-teal-600'
                                : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="pointer-events-none">{role.name}</span>
                              {isTarget && (
                                <span className="px-2 py-0.5 text-[9px] uppercase font-black tracking-widest bg-white/20 text-white rounded-full pointer-events-none">
                                  Selected Role
                                </span>
                              )}
                              <div onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={PERMISSION_ROWS.every(row => rolePermissionsState[role.id]?.[row.key] !== false)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setRolePermissionsState(prev => {
                                      const newState = { ...prev };
                                      newState[role.id] = { ...prev[role.id] };
                                      PERMISSION_ROWS.forEach(row => {
                                        newState[role.id][row.key] = isChecked;
                                      });
                                      return newState;
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-teal-500 cursor-pointer transition-transform hover:scale-110 accent-blue-600"
                                  title="Select All Permissions"
                                />
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-700 dark:text-slate-200">
                    {PERMISSION_ROWS.filter(item => item.name.toLowerCase().includes(filterSearchQuery.toLowerCase()))
                    .map((permRow) => (
                      <tr key={permRow.key} className="hover:bg-teal-50/40 dark:hover:bg-slate-700/40 transition">
                        <td className="sticky left-0 bg-white dark:bg-slate-800 py-3.5 px-6 font-mono text-xs font-bold text-gray-900 dark:text-slate-100 z-10 border-r border-gray-200 dark:border-slate-700 shadow-sm whitespace-nowrap min-w-[200px]">
                          {permRow.name}
                        </td>

                        {rolesList.map(role => {
                          const isTarget = activeRole?.id === role.id;
                          const isChecked = rolePermissionsState[role.id]?.[permRow.key] !== false;
                          return (
                            <td 
                              key={role.id} 
                              className={`py-3.5 px-5 text-center border-r min-w-[160px] transition-colors ${
                                isTarget
                                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-x-2 border-teal-500/40 font-bold'
                                  : 'border-gray-100 dark:border-slate-700/40'
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setRolePermissionsState(prev => ({
                                      ...prev,
                                      [role.id]: {
                                        ...prev[role.id],
                                        [permRow.key]: !isChecked
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-teal-500 cursor-pointer transition-transform hover:scale-110 accent-blue-600"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Buttons */}
              <div className="bg-gray-50 dark:bg-slate-900/60 px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetPermissions}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Permissions
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: VIEW ACCESS CONFIGURATION TABLE */}
          {activeSubTab === 'view-access' && (
            <div className="bg-white dark:bg-slate-800 sm:rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-200">
              
              {/* Top Action Header Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-teal-500" />
                    View Access
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Configure role-wise module visibility and view access permissions.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    type="text" 
                    placeholder="Search module view access..." 
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilterBar(!showFilterBar)}
                    className="p-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    title="Filter"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: 'info', text: 'User-wise view access feature is coming soon.' });
                      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    User wise View Access
                  </button>
                </div>
              </div>

              {/* View Access Matrix Table */}
              <div className="relative overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse min-w-max">
                  <thead className="bg-gray-100 dark:bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                    <tr>
                      <th className="sticky left-0 bg-gray-100 dark:bg-slate-900 px-6 py-4 border-b border-r border-gray-200 dark:border-slate-700 z-20 font-extrabold min-w-[240px] shadow-sm">
                        VIEW ACCESS
                      </th>
                      {rolesList.map(role => {
                        const isTarget = activeRole?.id === role.id;
                        return (
                          <th 
                            key={role.id} 
                            id={`view-access-role-col-header-${role.id}`}
                            onClick={() => setSelectedRoleForMatrix(role)}
                            className={`cursor-pointer px-5 py-4 border-b border-r border-gray-200 dark:border-slate-700 text-center font-extrabold whitespace-nowrap min-w-[160px] tracking-wide transition-all ${
                              isTarget
                                ? 'bg-teal-500 text-white shadow-md border-x-2 border-teal-600'
                                : 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="pointer-events-none">{role.name}</span>
                              {isTarget && (
                                <span className="px-2 py-0.5 text-[9px] uppercase font-black tracking-widest bg-white/20 text-white rounded-full pointer-events-none">
                                  Selected Role
                                </span>
                              )}
                              <div onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={VIEW_ACCESS_MODULES.every(row => viewAccessState[role.id]?.[row.key] !== false)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setViewAccessState(prev => {
                                      const newState = { ...prev };
                                      newState[role.id] = { ...prev[role.id] };
                                      VIEW_ACCESS_MODULES.forEach(row => {
                                        newState[role.id][row.key] = isChecked;
                                      });
                                      return newState;
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-teal-500 cursor-pointer transition-transform hover:scale-110 accent-blue-600"
                                  title="Select All View Access"
                                />
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-700 dark:text-slate-200">
                    {VIEW_ACCESS_MODULES.filter(item => 
                      item.name.toLowerCase().includes(filterSearchQuery.toLowerCase()) || 
                      item.category.toLowerCase().includes(filterSearchQuery.toLowerCase()) ||
                      item.key.toLowerCase().includes(filterSearchQuery.toLowerCase())
                    ).map((modRow) => (
                      <tr key={modRow.key} className="hover:bg-teal-50/40 dark:hover:bg-slate-700/40 transition">
                        <td className="sticky left-0 bg-white dark:bg-slate-800 py-3.5 px-6 z-10 border-r border-gray-200 dark:border-slate-700 shadow-sm whitespace-nowrap min-w-[240px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900 dark:text-slate-100 text-xs">{modRow.name}</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">{modRow.category}</span>
                          </div>
                        </td>

                        {rolesList.map(role => {
                          const isTarget = activeRole?.id === role.id;
                          const isChecked = viewAccessState[role.id]?.[modRow.key] !== false;
                          return (
                            <td 
                              key={role.id} 
                              className={`py-3.5 px-5 text-center border-r min-w-[160px] transition-colors ${
                                isTarget
                                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-x-2 border-teal-500/40 font-bold'
                                  : 'border-gray-100 dark:border-slate-700/40'
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setViewAccessState(prev => ({
                                      ...prev,
                                      [role.id]: {
                                        ...prev[role.id],
                                        [modRow.key]: !isChecked
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-teal-500 cursor-pointer transition-transform hover:scale-110 accent-blue-600"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Buttons */}
              <div className="bg-gray-50 dark:bg-slate-900/60 px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetViewAccess}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleSaveViewAccess}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save View Access
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Add Role</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Define a new system designation role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exam Incharge"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard New School Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Onboard New School</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Configure site name and public details for new school</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Academy"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value, appName: newSchoolData.appName || e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">School Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGA001"
                    value={newSchoolData.code}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">App / System Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Pilot"
                    value={newSchoolData.appName}
                    onChange={(e) => setNewSchoolData({ ...newSchoolData, appName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {onboarding ? 'Onboarding...' : 'Save & Onboard School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

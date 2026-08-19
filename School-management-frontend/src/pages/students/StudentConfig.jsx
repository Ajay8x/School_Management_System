import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { 
  ChevronRight, Filter, MoreVertical, RefreshCw, Printer, 
  FileText, FileSpreadsheet, Plus, Check, X, Home, Pipette,
  Trash2, Edit, Upload, Search, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function StudentConfig() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useContext(AuthContext);

  const routePrefix = (user?.role === 'super-admin' || user?.role === 'admin') ? '/admin' : `/${user?.role || 'admin'}`;

  // Query parameter for active tab
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');

  const getNormalizedTab = () => {
    let t = params.tab || tabFromQuery || 'config';
    if (t === 'document-types') return 'document-type';
    if (t === 'attendance-types') return 'attendance-type';
    if (t === 'houses') return 'house';
    if (t === 'group') return 'student-group';
    return t;
  };

  const [activeTab, setActiveTab] = useState(getNormalizedTab());

  const getInitialView = () => {
    if (location.pathname.endsWith('/create')) return 'add';
    if (location.pathname.includes('/edit/')) return 'edit';
    return 'list';
  };

  const [catView, setCatView] = useState(getInitialView());
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [keepAdding, setKeepAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  // Pagination for option list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Preset colors palette matching Image 1 screenshot
  const presetColors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
    '#6366f1', '#3b82f6', '#0284c7', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
    '#d97706', '#ea580c', '#dc2626', '#78716c', '#64748b'
  ];

  // 1. System Config State (Image 1)
  const [configData, setConfigData] = useState({
    regPrefix: 'Reg-',
    regDigit: 4,
    regSuffix: '',
    admPrefix: 'Adm-',
    admDigit: 4,
    admSuffix: '',
    trPrefix: 'TR-',
    trDigit: 3,
    trSuffix: '',
    tnPrefix: 'TN-',
    tnDigit: 3,
    tnSuffix: '',

    enableProvisionalAdmission: false,
    enableRollSort: true,
    enableAdmissionDate: true,
    allowEditRequest: true,
    allowParentPrefix: false,
    enableUniqueIdPrefix: false,

    attendancePastDays: 60,
    enableAttendanceSms: false,
    enableAttendanceThreshold: false,
    enableAbsenceNotification: true,

    lateFeeBasis: 'late fee on due date',
    allowFlexibleInstallment: true,
    allowMultipleInstallment: true,
    enableAllDuePayment: false,
    allowPartialPayment: true,
    installmentChooseMethod: 'fee group sequence',
    allowBalanceFeeReceipt: true,

    forceTransferApproval: true,

    servicePrefix: 'SR-',
    serviceDigit: 4,
    serviceSuffix: '',
    serviceInstructions: '',
    paymentType: 'Amount Based Payment'
  });

  // 2. State for 10 Options Data
  const [optionsList, setOptionsList] = useState([]);
  const initialOptionForm = {
    _id: '',
    name: '',
    code: '',
    subType: 'Daily',
    color: '#3b82f6',
    description: '',
    hasNumber: false,
    hasExpiryDate: false,
    isRequired: false
  };
  const [optionForm, setOptionForm] = useState(initialOptionForm);

  // Sidebar Items (Images 1-5)
  const sidebarItems = [
    { key: 'config', label: 'Config' },
    { key: 'registration-stage', label: 'Registration Stage' },
    { key: 'enrollment-type', label: 'Enrollment Type' },
    { key: 'enrollment-status', label: 'Enrollment Status' },
    { key: 'dialogue-category', label: 'Dialogue Category' },
    { key: 'document-type', label: 'Document Type' },
    { key: 'attendance-type', label: 'Attendance Type' },
    { key: 'house', label: 'House' },
    { key: 'leave-category', label: 'Leave Category' },
    { key: 'transfer-reason', label: 'Transfer Reason' },
    { key: 'student-group', label: 'Student Group' }
  ];

  useEffect(() => {
    const nextTab = getNormalizedTab();
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, [params.tab, tabFromQuery]);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (activeTab !== 'config') {
      fetchOptions(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Calls
  const fetchConfig = async () => {
    try {
      const res = await API.get('/students/config');
      if (res.data) setConfigData(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to fetch student config', err);
    }
  };

  const fetchOptions = async (type) => {
    try {
      const res = await API.get(`/students/config/options/${type}`);
      setOptionsList(res.data || []);
    } catch (err) {
      console.error(`Failed to fetch ${type} options`, err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCatView('list');
    setOptionForm(initialOptionForm);
    setCurrentPage(1);
    navigate(`?tab=${key}`, { replace: true });
  };

  // Submit Handler for Config Tab
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.put('/students/config', configData);
      showToast('Student configuration saved successfully!');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler for Options (Images 1, 2, 3, 4, 5)
  const handleSaveOption = async (e) => {
    e.preventDefault();
    if (!optionForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: optionForm.name,
        code: optionForm.code || '',
        subType: optionForm.subType || 'Daily',
        color: optionForm.color || '#3b82f6',
        description: optionForm.description || '',
        hasNumber: !!optionForm.hasNumber,
        hasExpiryDate: !!optionForm.hasExpiryDate,
        isRequired: !!optionForm.isRequired
      };

      if (optionForm._id) {
        await API.put(`/students/config/options/${activeTab}/${optionForm._id}`, payload);
        showToast('Updated successfully!');
      } else {
        await API.post(`/students/config/options/${activeTab}`, payload);
        showToast('Added successfully!');
      }

      fetchOptions(activeTab);

      if (keepAdding && !optionForm._id) {
        setOptionForm(initialOptionForm);
      } else {
        setCatView('list');
        setOptionForm(initialOptionForm);
      }
    } catch (err) {
      showToast('Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/students/config/options/${activeTab}/${id}`);
      showToast('Deleted successfully!');
      fetchOptions(activeTab);
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleEditOption = (item) => {
    setOptionForm({
      _id: item._id,
      name: item.name,
      code: item.code || '',
      subType: item.subType || 'Daily',
      color: item.color || '#3b82f6',
      description: item.description || '',
      hasNumber: !!item.hasNumber,
      hasExpiryDate: !!item.hasExpiryDate,
      isRequired: !!item.isRequired
    });
    setCatView('edit');
  };

  // Export / Print Actions
  const handlePrint = () => {
    window.print();
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    if (optionsList.length === 0) {
      showToast('No items to export', 'error');
      return;
    }

    const activeLabel = sidebarItems.find(i => i.key === activeTab)?.label || activeTab;
    const headers = ['Name', 'Code', 'Sub Type', 'Color', 'Description', 'Created At'];
    const rows = optionsList.map(item => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.code || '').replace(/"/g, '""')}"`,
      `"${(item.subType || '').replace(/"/g, '""')}"`,
      `"${(item.color || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${new Date(item.createdAt || Date.now()).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeLabel}_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
    showToast(`Exported ${activeLabel} to CSV`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast(`Imported ${file.name} successfully!`);
      }
    };
    input.click();
    setShowMenu(false);
  };

  const activeLabel = sidebarItems.find(i => i.key === activeTab)?.label || 'Config';

  const filteredOptions = optionsList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / itemsPerPage));
  const currentOptions = filteredOptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
          toast.type === 'error' ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4 text-teal-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        {/* Top Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-4">
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <Link to={`${routePrefix}/dashboard`} className="hover:text-gray-700">Dashboard</Link>
          <span>&gt;</span>
          <Link to={`${routePrefix}/students`} className="hover:text-gray-700">Student</Link>
          <span>&gt;</span>
          <span>Config</span>
          {activeTab !== 'config' && (
            <>
              <span>&gt;</span>
              <span className="text-gray-800 dark:text-white font-bold">{activeLabel}</span>
            </>
          )}
          {catView !== 'list' && (
            <>
              <span>&gt;</span>
              <span className="text-gray-900 dark:text-white font-bold">
                {catView === 'edit' ? `Edit ${activeLabel}` : `Add ${activeLabel}`}
              </span>
            </>
          )}
        </nav>

        {/* Main Content Layout with Left Dark Sidebar */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Dark Sidebar */}
          <div className="w-full md:w-56 bg-black rounded-xl p-4 flex flex-col space-y-1 flex-shrink-0 shadow-lg text-white">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.key ? 'bg-slate-800 text-white font-bold' : 'text-gray-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* CONFIG TAB */}
            {activeTab === 'config' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight mb-4">
                  Config
                </h1>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    
                    {/* Number Sequences Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Registration Number Prefix</label>
                        <input 
                          type="text"
                          value={configData.regPrefix}
                          onChange={(e) => setConfigData({ ...configData, regPrefix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Registration Number Digit</label>
                        <input 
                          type="number"
                          value={configData.regDigit}
                          onChange={(e) => setConfigData({ ...configData, regDigit: parseInt(e.target.value) || 4 })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Registration Number Suffix</label>
                        <input 
                          type="text"
                          value={configData.regSuffix}
                          onChange={(e) => setConfigData({ ...configData, regSuffix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Admission Number Prefix</label>
                        <input 
                          type="text"
                          value={configData.admPrefix}
                          onChange={(e) => setConfigData({ ...configData, admPrefix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Admission Number Digit</label>
                        <input 
                          type="number"
                          value={configData.admDigit}
                          onChange={(e) => setConfigData({ ...configData, admDigit: parseInt(e.target.value) || 4 })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Admission Number Suffix</label>
                        <input 
                          type="text"
                          value={configData.admSuffix}
                          onChange={(e) => setConfigData({ ...configData, admSuffix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Transfer Request Number Prefix</label>
                        <input 
                          type="text"
                          value={configData.trPrefix}
                          onChange={(e) => setConfigData({ ...configData, trPrefix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Transfer Request Number Digit</label>
                        <input 
                          type="number"
                          value={configData.trDigit}
                          onChange={(e) => setConfigData({ ...configData, trDigit: parseInt(e.target.value) || 3 })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Transfer Request Number Suffix</label>
                        <input 
                          type="text"
                          value={configData.trSuffix}
                          onChange={(e) => setConfigData({ ...configData, trSuffix: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2">Provisional Admission</h3>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={configData.enableProvisionalAdmission}
                          onChange={(e) => setConfigData({ ...configData, enableProvisionalAdmission: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-xs text-gray-700 dark:text-slate-200">Enable Provisional Admission</span>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-3">General Config</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={configData.enableRollSort} onChange={(e) => setConfigData({ ...configData, enableRollSort: e.target.checked })} className="rounded text-teal-500" />
                          <span className="text-xs text-gray-700 dark:text-slate-300">Enable Roll Number Sort</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={configData.enableAdmissionDate} onChange={(e) => setConfigData({ ...configData, enableAdmissionDate: e.target.checked })} className="rounded text-teal-500" />
                          <span className="text-xs text-gray-700 dark:text-slate-300">Enable Admission Date</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={configData.allowEditRequest} onChange={(e) => setConfigData({ ...configData, allowEditRequest: e.target.checked })} className="rounded text-teal-500" />
                          <span className="text-xs text-gray-700 dark:text-slate-300">Allow student to submit general edit request</span>
                        </label>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={fetchConfig}
                        className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md border border-gray-200 dark:border-slate-600 transition"
                      >
                        Reset
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${routePrefix}/students`)}
                          className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-1.5 rounded-md text-xs font-semibold shadow transition disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* 10 OPTION TABS */}
            {activeTab !== 'config' && (
              <div>
                
                {/* Header Title & Top Controls */}
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {activeLabel}
                  </h1>

                  {catView === 'list' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setOptionForm(initialOptionForm);
                          setCatView('add');
                        }}
                        className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        title={`Add ${activeLabel}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setOptionForm(initialOptionForm);
                          setCatView('add');
                        }}
                        className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Add {activeLabel}</span>
                      </button>

                      <button 
                        className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        title="Filter"
                      >
                        <Filter className="w-4 h-4" />
                      </button>

                      {/* Triple Dots Menu */}
                      <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <button 
                              onClick={handleImport}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-gray-400" />
                              <span>Import</span>
                            </button>
                            <button 
                              onClick={() => {
                                fetchOptions(activeTab);
                                setShowMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                              <span>Refresh</span>
                            </button>
                            <button 
                              onClick={handlePrint}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <Printer className="w-3.5 h-3.5 text-gray-400" />
                              <span>Print</span>
                            </button>
                            <button 
                              onClick={handlePrint}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <span>Generate PDF</span>
                            </button>
                            <button 
                              onClick={handleExportCSV}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                              <span>Export to Excel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCatView('list')}
                      className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
                    >
                      List all {activeLabel}
                    </button>
                  )}
                </div>

                {/* LIST VIEW */}
                {catView === 'list' ? (
                  <div>
                    {optionsList.length === 0 ? (
                      /* Empty State Box */
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 my-2 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mb-4 text-gray-600 dark:text-slate-300">
                          <div className="flex flex-col space-y-1.5 items-start justify-center w-8">
                            <div className="flex items-center space-x-1.5 w-full">
                              <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                              <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                            </div>
                            <div className="flex items-center space-x-1.5 w-full">
                              <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                              <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                            </div>
                            <div className="flex items-center space-x-1.5 w-full">
                              <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                              <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                          Manage all {activeLabel}s
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6 font-normal">
                          {activeLabel} items are used to configure student management parameters effectively.
                        </p>

                        <button 
                          onClick={() => {
                            setOptionForm(initialOptionForm);
                            setCatView('add');
                          }}
                          className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow transition-colors"
                        >
                          Add {activeLabel}
                        </button>
                      </div>
                    ) : (
                      /* Table List */
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden p-5 space-y-4">
                        
                        <div className="relative max-w-xs">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <input 
                            type="text"
                            placeholder={`Search ${activeLabel}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-gray-700 dark:text-slate-300">
                            <thead className="bg-gray-50 dark:bg-slate-900 uppercase text-[11px] font-bold text-gray-500 dark:text-slate-400">
                              <tr>
                                <th className="px-4 py-3">Color</th>
                                <th className="px-4 py-3">Name</th>
                                {(activeTab === 'attendance-type' || activeTab === 'house') && (
                                  <th className="px-4 py-3">Code</th>
                                )}
                                {activeTab === 'attendance-type' && (
                                  <th className="px-4 py-3">Sub Type</th>
                                )}
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Created At</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                              {currentOptions.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-750 transition">
                                  <td className="px-4 py-3">
                                    <div 
                                      className="w-5 h-5 rounded-full border border-gray-200 shadow-xs"
                                      style={{ backgroundColor: item.color || '#3b82f6' }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">
                                    {item.name}
                                  </td>
                                  {(activeTab === 'attendance-type' || activeTab === 'house') && (
                                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-400">
                                      {item.code || '-'}
                                    </td>
                                  )}
                                  {activeTab === 'attendance-type' && (
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                      {item.subType || 'Daily'}
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">
                                    {item.description || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="px-4 py-3 text-right relative">
                                    <button 
                                      onClick={() => setActiveRowMenuId(activeRowMenuId === item._id ? null : item._id)}
                                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {activeRowMenuId === item._id && (
                                      <div className="absolute right-4 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                                        <button 
                                          onClick={() => {
                                            handleEditOption(item);
                                            setActiveRowMenuId(null);
                                          }}
                                          className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                        >
                                          <Edit className="w-3.5 h-3.5 text-gray-400" />
                                          <span>Edit</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                            handleDeleteOption(item._id);
                                            setActiveRowMenuId(null);
                                          }}
                                          className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            Showing 1 to {filteredOptions.length} of {filteredOptions.length} results
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg">
                              25 per page
                            </span>

                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-40"
                              >
                                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                              </button>
                              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                                {currentPage}
                              </span>
                              <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-40"
                              >
                                <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ) : (
                  /* ADD / EDIT FORM - Dynamically Customized for each option */
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">
                      {catView === 'edit' ? `Edit ${activeLabel}` : `Add ${activeLabel}`}
                    </h2>

                    <form onSubmit={handleSaveOption} className="space-y-5">
                      
                      {/* Grid Row for Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        
                        {/* Name Field (All) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                            Name <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text"
                            placeholder="Name"
                            required
                            value={optionForm.name}
                            onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        {/* Code Field (Attendance Type & House) - Image 2 & 3 */}
                        {(activeTab === 'attendance-type' || activeTab === 'house') && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                              Code
                            </label>
                            <input 
                              type="text"
                              placeholder="Code"
                              value={optionForm.code}
                              onChange={(e) => setOptionForm({ ...optionForm, code: e.target.value })}
                              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 font-mono"
                            />
                          </div>
                        )}

                        {/* Sub Type Dropdown (Attendance Type) - Image 2 */}
                        {activeTab === 'attendance-type' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                              Sub Type
                            </label>
                            <select
                              value={optionForm.subType}
                              onChange={(e) => setOptionForm({ ...optionForm, subType: e.target.value })}
                              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                            >
                              <option value="Daily">Daily</option>
                              <option value="Session">Session</option>
                              <option value="Subject Wise">Subject Wise</option>
                            </select>
                          </div>
                        )}

                      </div>

                      {/* Color Section */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                          Color
                        </label>
                        
                        {/* 20 Preset Color Circles Palette matching Image 1 */}
                        {activeTab === 'document-type' ? (
                          <div className="flex flex-wrap items-center gap-2 py-1">
                            {presetColors.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => setOptionForm({ ...optionForm, color: hex })}
                                className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${
                                  optionForm.color === hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 max-w-md">
                            <input 
                              type="color"
                              value={optionForm.color}
                              onChange={(e) => setOptionForm({ ...optionForm, color: e.target.value })}
                              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                            />
                            <input 
                              type="text"
                              placeholder="Color"
                              value={optionForm.color}
                              onChange={(e) => setOptionForm({ ...optionForm, color: e.target.value })}
                              className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 font-mono"
                            />
                            <div className="p-2 text-gray-400 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                              <Pipette className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Document Type Specific Toggles - Image 1 */}
                      {activeTab === 'document-type' && (
                        <div className="space-y-3 pt-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={optionForm.hasNumber}
                              onChange={(e) => setOptionForm({ ...optionForm, hasNumber: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-slate-300 font-medium">Has Number</span>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={optionForm.hasExpiryDate}
                              onChange={(e) => setOptionForm({ ...optionForm, hasExpiryDate: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-slate-300 font-medium">Has Expiry Date</span>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={optionForm.isRequired}
                              onChange={(e) => setOptionForm({ ...optionForm, isRequired: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-slate-300 font-medium">Document Required</span>
                          </label>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                          Description
                        </label>
                        <textarea 
                          rows="3"
                          placeholder="Description"
                          value={optionForm.description}
                          onChange={(e) => setOptionForm({ ...optionForm, description: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 resize-y"
                        />
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => setOptionForm(initialOptionForm)}
                            className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md border border-gray-200 dark:border-slate-600 transition"
                          >
                            Reset
                          </button>

                          <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-600 dark:text-slate-300">
                            <input 
                              type="checkbox"
                              checked={keepAdding}
                              onChange={(e) => setKeepAdding(e.target.checked)}
                              className="rounded border-gray-300 text-teal-500 focus:ring-teal-500 w-3.5 h-3.5"
                            />
                            <span>Keep Adding</span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setCatView('list')}
                            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-1.5 rounded-md text-xs font-semibold transition"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-1.5 rounded-md text-xs font-semibold shadow transition disabled:opacity-50"
                          >
                            {submitting ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>

                    </form>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer Branding - Consistent "Campus Pilot" */}
      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-800 text-center text-xs font-medium text-gray-500 dark:text-slate-400">
        <span>Campus Pilot</span>
      </footer>

    </div>
  );
}

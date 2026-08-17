import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle, Calendar,
  ChevronLeft, X, Star, Eye, Archive, Lock, Unlock, Copy, ArrowRightCircle
} from 'lucide-react';

export default function Period() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Three Dots Header Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row Three Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Show Details Modal State
  const [selectedPeriodModal, setSelectedPeriodModal] = useState(null);

  // Custom Confirmation Modal State matching Screenshot 1
  const [confirmModal, setConfirmModal] = useState(null); // { isOpen: true, title, message, onConfirm }

  // View mode: 'list' | 'add' | 'edit' | 'duplicate'
  const [viewMode, setViewMode] = useState('list');
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State matching Screenshot 2
  const initialForm = {
    name: '',
    session: '2025-2026',
    code: '',
    shortCode: '',
    alias: '',
    startDate: '',
    endDate: '',
    registration: true,
    isDefault: false,
    isExamLocked: false,
    isArchived: false,
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/periods');
      const fetchedPeriods = Array.isArray(res.data) ? res.data : [];
      setPeriods(fetchedPeriods);
      setError('');
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError('Failed to load academic periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (!event.target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setEditingPeriod(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (periodItem) => {
    setOpenRowMenuId(null);
    if (selectedPeriodModal) setSelectedPeriodModal(null);
    setEditingPeriod(periodItem);
    setFormData({
      name: periodItem.name || '',
      session: periodItem.session || '2025-2026',
      code: periodItem.code || '',
      shortCode: periodItem.shortCode || periodItem.code || '',
      alias: periodItem.alias || '',
      startDate: periodItem.startDate ? new Date(periodItem.startDate).toISOString().split('T')[0] : '',
      endDate: periodItem.endDate ? new Date(periodItem.endDate).toISOString().split('T')[0] : '',
      registration: periodItem.registration !== undefined ? periodItem.registration : true,
      isDefault: periodItem.isDefault || false,
      isExamLocked: periodItem.isExamLocked || false,
      isArchived: periodItem.isArchived || false,
      description: periodItem.description || ''
    });
    setViewMode('edit');
  };

  // Open Duplicate Period view matching Screenshot 2
  const handleOpenDuplicate = (periodItem) => {
    setOpenRowMenuId(null);
    if (selectedPeriodModal) setSelectedPeriodModal(null);
    setEditingPeriod(null); // Creating new period from duplicate
    setFormData({
      name: periodItem.name || '',
      session: periodItem.session || '2025-2026',
      code: periodItem.code || '',
      shortCode: periodItem.shortCode || periodItem.code || '',
      alias: periodItem.alias || '',
      startDate: periodItem.startDate ? new Date(periodItem.startDate).toISOString().split('T')[0] : '',
      endDate: periodItem.endDate ? new Date(periodItem.endDate).toISOString().split('T')[0] : '',
      registration: periodItem.registration !== undefined ? periodItem.registration : true,
      isDefault: false,
      isExamLocked: periodItem.isExamLocked || false,
      isArchived: false,
      description: periodItem.description || ''
    });
    setViewMode('duplicate');
  };

  const handleResetForm = () => {
    if (editingPeriod) {
      handleOpenEdit(editingPeriod);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Period Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    const payload = { ...formData };

    try {
      if (editingPeriod) {
        await API.put(`/periods/${editingPeriod._id}`, payload);
        setSuccessMsg('Academic period updated successfully!');
      } else {
        await API.post('/periods', payload);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated academic period saved successfully!' : 'Academic period added successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save period';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Row Action 1: Show Details
  const handleActionShow = (periodItem) => {
    setOpenRowMenuId(null);
    setSelectedPeriodModal(periodItem);
  };

  // Row Action 2: Archive / Unarchive with Confirmation Modal matching Screenshot 1
  const handleActionArchiveTrigger = (periodItem) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await API.patch(`/periods/${periodItem._id}/toggle-archive`);
          await fetchData();
          const statusText = res.data?.isArchived ? 'archived' : 'unarchived';
          setSuccessMsg(`Academic period "${periodItem.name}" ${statusText} successfully!`);
          setTimeout(() => setSuccessMsg(''), 3500);
        } catch (err) {
          console.error('Archive error:', err);
          setError('Failed to update archive status');
        }
      }
    });
  };

  // Row Action 3: Lock / Unlock Exam
  const handleActionLockExamTrigger = (periodItem) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await API.patch(`/periods/${periodItem._id}/toggle-lock-exam`);
          await fetchData();
          const lockText = res.data?.isExamLocked ? 'locked' : 'unlocked';
          setSuccessMsg(`Exams ${lockText} for period "${periodItem.name}"!`);
          setTimeout(() => setSuccessMsg(''), 3500);
        } catch (err) {
          console.error('Lock exam error:', err);
          setError('Failed to toggle exam lock status');
        }
      }
    });
  };

  // Row Action 6: Delete Period with Confirmation Modal matching Screenshot 1
  const handleActionDeleteTrigger = (id) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/periods/${id}`);
          setPeriods(periods.filter(p => p._id !== id));
          setSuccessMsg('Academic period deleted successfully!');
          if (selectedPeriodModal && selectedPeriodModal._id === id) {
            setSelectedPeriodModal(null);
          }
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete period');
        }
      }
    });
  };

  const handleToggleDefault = async (id) => {
    try {
      await API.patch(`/periods/${id}/toggle-default`);
      await fetchData();
      setSuccessMsg('Default academic period updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Toggle default error:', err);
      setError('Failed to set default period');
    }
  };

  // Header Three Dots Menu Actions
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Period list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (periods.length === 0) {
      setError('No period data available to export');
      return;
    }

    try {
      const exportData = filteredPeriods.map((p, index) => ({
        '#': index + 1,
        'Period': p.name || '',
        'Is Default': p.isDefault ? 'Yes' : 'No',
        'Registration Open': p.registration ? 'Yes' : 'No',
        'Exam Locked': p.isExamLocked ? 'Yes' : 'No',
        'Status': p.isArchived ? 'Archived' : 'Active',
        'Session': p.session || '',
        'Code': p.code || '',
        'Start Date': p.startDate ? new Date(p.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        'End Date': p.endDate ? new Date(p.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        'Created At': new Date(p.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Periods');
      
      XLSX.writeFile(workbook, `Campus_Pilot_Periods_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported periods to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
  };

  // Format Display Helpers
  const formatDisplayDate = (d) => {
    if (!d) return '-';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatCreatedAt = (d) => {
    if (!d) return '-';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '-';
    const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day}, ${year} ${timeStr}`;
  };

  // Sorting Handler
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtering & Sorting
  const filteredPeriods = periods
    .filter(p => {
      const matchesSearch = 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.session && p.session.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'startDate' || sortField === 'endDate' || sortField === 'createdAt') {
        valA = new Date(a[sortField] || 0).getTime();
        valB = new Date(b[sortField] || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalResults = filteredPeriods.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedPeriods = filteredPeriods.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-period-table, #printable-period-table * {
            visibility: visible;
          }
          #printable-period-table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshot 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">Period</button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Period' : viewMode === 'edit' ? 'Edit Period' : 'Duplicate Period'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Period' : viewMode === 'add' ? 'Add Period' : viewMode === 'edit' ? 'Edit Period' : 'Duplicate Period'}
            </h1>
          </div>

          {/* Top Right Header Actions Toolbar matching Screenshot */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Period
                </button>

                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                <button 
                  title="Settings"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* HEADER THREE DOTS BUTTON & DROPDOWN MENU */}
                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isHeaderMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
                        <button
                          onClick={handleRefreshAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <RotateCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Refresh</span>
                        </button>

                        <button
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Print</span>
                        </button>

                        <button
                          onClick={handleExportExcelAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Export to Excel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </>
            ) : (
              <button 
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Period
              </button>
            )}
          </div>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-medium flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm font-medium flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* Optional Search / Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs flex items-center gap-4 no-print animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search period by name, session, code..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline whitespace-nowrap"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST (Screenshot Exact Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-period-table">
            
            {/* Table Header Search / Refresh Controls */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search period..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <button 
                onClick={fetchData} 
                className="p-2 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-4 text-center">
              <h2 className="text-xl font-bold">Campus Pilot - Period List</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshot columns */}
            <div className="overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th 
                      onClick={() => toggleSort('name')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      PERIOD
                    </th>
                    <th className="px-6 py-3.5 text-center">
                      REGISTRATION
                    </th>
                    <th 
                      onClick={() => toggleSort('session')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      SESSION
                    </th>
                    <th 
                      onClick={() => toggleSort('code')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      CODE
                    </th>
                    <th 
                      onClick={() => toggleSort('startDate')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>START DATE</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('endDate')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>END DATE</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('createdAt')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>CREATED AT</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th className="px-6 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {paginatedPeriods.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No periods found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Period</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedPeriods.map((periodItem) => (
                      <tr key={periodItem._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        {/* PERIOD Column with Badges */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                            <span>{periodItem.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            {periodItem.isDefault && (
                              <span className="px-2 py-0.5 bg-[#1e293b] text-white text-[10px] font-bold rounded-md tracking-wider">
                                Default
                              </span>
                            )}
                            {periodItem.isExamLocked && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold rounded-md tracking-wider flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Exam Locked
                              </span>
                            )}
                            {periodItem.isArchived && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold rounded-md tracking-wider">
                                Archived
                              </span>
                            )}
                          </div>
                        </td>

                        {/* REGISTRATION Checkmark Icon */}
                        <td className="px-6 py-4 text-center">
                          {periodItem.registration ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-slate-500">-</span>
                          )}
                        </td>

                        {/* SESSION */}
                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-medium">
                          {periodItem.session || '-'}
                        </td>

                        {/* CODE */}
                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-mono text-xs">
                          {periodItem.code || '-'}
                        </td>

                        {/* START DATE */}
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDisplayDate(periodItem.startDate)}
                        </td>

                        {/* END DATE */}
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDisplayDate(periodItem.endDate)}
                        </td>

                        {/* CREATED AT */}
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {formatCreatedAt(periodItem.createdAt)}
                        </td>

                        {/* ROW ACTIONS THREE-DOT MENU matching Screenshot 2 */}
                        <td className="px-6 py-4 text-right no-print relative">
                          <div className="relative inline-block text-left row-menu-container">
                            <button 
                              onClick={() => setOpenRowMenuId(openRowMenuId === periodItem._id ? null : periodItem._id)}
                              className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ${openRowMenuId === periodItem._id ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 ring-2 ring-teal-500/20' : ''}`}
                              title="Actions Menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* ROW ACTION DROPDOWN MENU - 6 ITEMS */}
                            {openRowMenuId === periodItem._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  
                                  {/* 1. Show */}
                                  <button
                                    onClick={() => handleActionShow(periodItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <ArrowRightCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Show</span>
                                  </button>

                                  {/* 2. Archive */}
                                  <button
                                    onClick={() => handleActionArchiveTrigger(periodItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Archive className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>{periodItem.isArchived ? 'Unarchive' : 'Archive'}</span>
                                  </button>

                                  {/* 3. Lock Exam */}
                                  <button
                                    onClick={() => handleActionLockExamTrigger(periodItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    {periodItem.isExamLocked ? (
                                      <Unlock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    )}
                                    <span>{periodItem.isExamLocked ? 'Unlock Exam' : 'Lock Exam'}</span>
                                  </button>

                                  {/* 4. Edit */}
                                  <button
                                    onClick={() => handleOpenEdit(periodItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 5. Duplicate */}
                                  <button
                                    onClick={() => handleOpenDuplicate(periodItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>

                                  {/* 6. Delete */}
                                  <button
                                    onClick={() => handleActionDeleteTrigger(periodItem._id)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition flex items-center gap-2.5 border-t border-gray-100 dark:border-slate-700/60 mt-1 pt-1.5"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                    <span>Delete</span>
                                  </button>

                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                Showing {totalResults === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalResults)} of {totalResults} results
              </span>

              <div className="flex items-center space-x-4">
                {/* Per page selector */}
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>

                {/* Page Navigation */}
                <div className="flex items-center space-x-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 bg-[#1e293b] text-white text-xs font-bold rounded-md">
                    {currentPage}
                  </span>

                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT / DUPLICATE PERIOD FORM (Screenshot 2 Exact Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Row 1: Session, Name, Code matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Session
                  </label>
                  <input 
                    type="text"
                    placeholder="2025-2026"
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 leading-snug">
                    Session is optional. Create a session only if your session contains multiple periods/semesters/terms.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Session 2025-2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Code
                  </label>
                  <input 
                    type="text"
                    placeholder="Code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Row 2: Short Code, Alias, Start Date matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Short Code
                  </label>
                  <input 
                    type="text"
                    placeholder="2526"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Alias
                  </label>
                  <input 
                    type="text"
                    placeholder="Alias"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Row 3: End Date, Enable Registration Switch matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Enable Registration
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registration: !formData.registration })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-200 ${formData.registration ? 'bg-[#1e293b] justify-end' : 'bg-gray-300 dark:bg-slate-700 justify-start'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                  </button>
                </div>

                <div className="flex flex-col justify-center space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600"
                    />
                    <span>Set as Default Period</span>
                  </label>
                </div>
              </div>

              {/* Row 4: Description matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Session 2024-2025"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition resize-y"
                />
              </div>

              {/* Bottom Buttons matching Screenshot 2 */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
                  >
                    Reset
                  </button>
                  {viewMode !== 'edit' && (
                    <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600"
                      />
                      <span>Keep Adding</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-6 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-semibold rounded-xl shadow-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* ========================================================
          CONFIRMATION MODAL DIALOG matching Screenshot 1 EXACTLY
         ======================================================== */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200/80 dark:border-slate-700 text-center space-y-6 animate-in zoom-in-95 duration-150">
            
            {/* Orange Exclamation Circle Icon matching Screenshot 1 */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-300 dark:border-amber-900/50 flex items-center justify-center text-amber-500 text-4xl font-light">
              !
            </div>

            {/* Title & Message matching Screenshot 1 */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {confirmModal.title || 'Are you sure?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed px-4">
                {confirmModal.message || 'You might not be able to reverse this action. Confirm to proceed?'}
              </p>
            </div>

            {/* Buttons: Blue OK, Red Cancel matching Screenshot 1 */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={confirmModal.onConfirm}
                className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-xl shadow-sm transition min-w-[80px]"
              >
                OK
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold rounded-xl shadow-sm transition min-w-[80px]"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          SHOW DETAILS MODAL DIALOG
         ======================================================== */}
      {selectedPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Period Details</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{selectedPeriodModal.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPeriodModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Period Name</span>
                <p className="font-bold text-gray-900 dark:text-slate-100">{selectedPeriodModal.name}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Session</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{selectedPeriodModal.session || '-'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Code</span>
                <p className="font-mono font-semibold text-gray-900 dark:text-slate-100">{selectedPeriodModal.code || '-'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Registration</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">
                  {selectedPeriodModal.registration ? 'Open (Active)' : 'Closed'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Start Date</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{formatDisplayDate(selectedPeriodModal.startDate)}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">End Date</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{formatDisplayDate(selectedPeriodModal.endDate)}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Exam Status</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">
                  {selectedPeriodModal.isExamLocked ? 'Locked' : 'Unlocked (Open)'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Period Status</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">
                  {selectedPeriodModal.isArchived ? 'Archived' : 'Active'}
                </p>
              </div>
            </div>

            {selectedPeriodModal.description && (
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Description</span>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{selectedPeriodModal.description}</p>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedPeriodModal(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenEdit(selectedPeriodModal)}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Period
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer Branding Text matching Screenshot */}
      <div className="mt-8 text-center text-xs font-medium text-gray-400 dark:text-slate-500 no-print">
        Campus Pilot
      </div>

    </div>
  );
}

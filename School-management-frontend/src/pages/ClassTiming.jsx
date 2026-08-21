import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  Eye, Copy, ChevronDown, Clock, X, FileText
} from 'lucide-react';

export default function ClassTiming({ initialView = 'list' }) {
  const [classTimings, setClassTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSessionName, setFilterSessionName] = useState('');
  const [appliedFilterSession, setAppliedFilterSession] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Header 3-Dots Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row 3-Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Detail Modal State
  const [selectedTimingModal, setSelectedTimingModal] = useState(null);

  // Custom Delete Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null);

  // View mode: 'list' | 'add' | 'edit' | 'duplicate'
  const [viewMode, setViewMode] = useState(initialView);
  const [editingTiming, setEditingTiming] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Initial Form State matching Screenshot 5
  const initialForm = {
    sessionName: '',
    description: '',
    sessions: [
      { session: '', code: '', isBreak: false, startTime: '08:00 AM', endTime: '08:40 AM' }
    ]
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/class-timings');
      const fetched = Array.isArray(res.data) ? res.data : [];
      setClassTimings(fetched);
      setError('');
    } catch (err) {
      console.error('Error fetching class timings:', err);
      setError('Failed to load class timings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close dropdown menus on outside click
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

  // Form actions
  const handleOpenAdd = () => {
    setEditingTiming(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (item) => {
    setOpenRowMenuId(null);
    setSelectedTimingModal(null);
    setEditingTiming(item);
    setFormData({
      sessionName: item.sessionName || '',
      description: item.description || '',
      sessions: Array.isArray(item.sessions) && item.sessions.length > 0
        ? item.sessions.map(s => ({
            session: s.session || '',
            code: s.code || '',
            isBreak: s.isBreak || false,
            startTime: s.startTime || '08:00 AM',
            endTime: s.endTime || '08:40 AM'
          }))
        : initialForm.sessions
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (item) => {
    setOpenRowMenuId(null);
    setSelectedTimingModal(null);
    setEditingTiming(null); // Create new
    setFormData({
      sessionName: item.sessionName ? `${item.sessionName} (Copy)` : '',
      description: item.description || '',
      sessions: Array.isArray(item.sessions) && item.sessions.length > 0
        ? item.sessions.map(s => ({
            session: s.session || '',
            code: s.code || '',
            isBreak: s.isBreak || false,
            startTime: s.startTime || '08:00 AM',
            endTime: s.endTime || '08:40 AM'
          }))
        : initialForm.sessions
    });
    setViewMode('duplicate');
  };

  const handleResetForm = () => {
    if (editingTiming) {
      handleOpenEdit(editingTiming);
    } else {
      setFormData(initialForm);
    }
  };

  // Session array item controls
  const handleAddSessionItem = () => {
    const lastSession = formData.sessions[formData.sessions.length - 1];
    let nextStart = '08:40 AM';
    let nextEnd = '09:20 AM';

    if (lastSession && lastSession.endTime) {
      nextStart = lastSession.endTime;
      // Auto-increment 40 mins
      const [time, period] = lastSession.endTime.split(' ');
      if (time && period) {
        const [h, m] = time.split(':').map(Number);
        let totalM = (h % 12) * 60 + m + (period === 'PM' ? 720 : 0) + 40;
        let newH = Math.floor(totalM / 60) % 24;
        let newM = totalM % 60;
        let newP = newH >= 12 ? 'PM' : 'AM';
        if (newH === 0) newH = 12;
        else if (newH > 12) newH -= 12;
        nextEnd = `${newH}:${newM < 10 ? '0' + newM : newM} ${newP}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          session: `Session ${prev.sessions.length + 1}`,
          code: `P${prev.sessions.length + 1}`,
          isBreak: false,
          startTime: nextStart,
          endTime: nextEnd
        }
      ]
    }));
  };

  const handleRemoveSessionItem = (index) => {
    if (formData.sessions.length <= 1) {
      setError('At least one session entry is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const handleSessionChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.sessions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sessions: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sessionName.trim()) {
      setError('Session Name is required');
      return;
    }

    if (!formData.sessions || formData.sessions.length === 0) {
      setError('Please add at least one session period');
      return;
    }

    for (let i = 0; i < formData.sessions.length; i++) {
      if (!formData.sessions[i].session.trim()) {
        setError(`Session name is required for row #${i + 1}`);
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingTiming) {
        await API.put(`/class-timings/${editingTiming._id}`, formData);
        setSuccessMsg('Class timing updated successfully!');
      } else {
        await API.post('/class-timings', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated class timing saved successfully!' : 'Class timing added successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save class timing';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Trigger
  const handleActionDeleteTrigger = (id) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/class-timings/${id}`);
          setClassTimings(prev => prev.filter(item => item._id !== id));
          setSuccessMsg('Class timing deleted successfully!');
          if (selectedTimingModal && selectedTimingModal._id === id) {
            setSelectedTimingModal(null);
          }
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete class timing');
        }
      }
    });
  };

  // Header Dropdown Actions
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Class timing list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (classTimings.length === 0) {
      setError('No class timing data available to export');
      return;
    }

    try {
      const exportData = filteredClassTimings.map((item, index) => ({
        '#': index + 1,
        'Class Timing': item.sessionName || '',
        'Duration': item.totalDurationText || '',
        'Time Range': item.timeRangeText || '',
        'Sessions': item.sessionCount ? `${item.sessionCount} Session` : '0 Session',
        'Breaks': item.breakCount ? `${item.breakCount} Break` : '0 Break',
        'Created At': new Date(item.createdAt || Date.now()).toLocaleString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Timings');
      
      XLSX.writeFile(workbook, `Campus_Pilot_Class_Timings_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported class timings to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
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

  // Filter & Sort Logic
  const filteredClassTimings = classTimings
    .filter(item => {
      const matchesSearch = 
        !searchTerm || 
        (item.sessionName && item.sessionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilterSession = 
        !appliedFilterSession ||
        (item.sessionName && item.sessionName.toLowerCase().includes(appliedFilterSession.toLowerCase()));

      return matchesSearch && matchesFilterSession;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalResults = filteredClassTimings.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedClassTimings = filteredClassTimings.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-timing-table, #printable-timing-table * {
            visibility: visible;
          }
          #printable-timing-table {
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
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots 1 & 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/admin/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Timetable</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">
                Class Timing
              </button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Class Timing' : viewMode === 'edit' ? 'Edit Class Timing' : 'Duplicate Class Timing'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Class Timing' : viewMode === 'add' ? 'Add Class Timing' : viewMode === 'edit' ? 'Edit Class Timing' : 'Duplicate Class Timing'}
            </h1>
          </div>

          {/* Top Right Header Toolbar matching Screenshots 1, 3, 5 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Class Timing
                </button>

                {/* Filter Icon Toggle Button */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* HEADER 3-DOTS BUTTON & DROPDOWN MENU matching Screenshot 3 */}
                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isHeaderMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu matching Screenshot 3 */}
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
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Generate PDF</span>
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
                List all Timetable
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

        {/* FILTER CARD PANEL matching Screenshot 4 */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm no-print animate-in fade-in duration-150 space-y-4">
            <div className="max-w-xs space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Session Name
              </label>
              <input 
                type="text"
                placeholder="Session Name"
                value={filterSessionName}
                onChange={(e) => setFilterSessionName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button 
                onClick={() => {
                  setFilterSessionName('');
                  setAppliedFilterSession('');
                  setShowFilterBar(false);
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAppliedFilterSession(filterSessionName);
                  setCurrentPage(1);
                }}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Filter</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST (Screenshot 1 & 2 Exact Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-timing-table">
            
            {/* Table Header Search / Refresh Controls */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search class timing..."
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
              <h2 className="text-xl font-bold">Campus Pilot - Class Timings</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshot 1 & 2 columns */}
            <div className="overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th 
                      onClick={() => toggleSort('sessionName')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      CLASS TIMING
                    </th>
                    <th className="px-6 py-3.5">
                      DURATION
                    </th>
                    <th className="px-6 py-3.5">
                      SESSION
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
                  {paginatedClassTimings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No class timings found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Class Timing</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedClassTimings.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        
                        {/* CLASS TIMING Column */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-slate-100">
                            {item.sessionName}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </td>

                        {/* DURATION Column matching Screenshot 1 */}
                        <td className="px-6 py-4">
                          <div className="font-normal text-gray-800 dark:text-slate-200 text-sm">
                            {item.totalDurationText || '4 hour(s) 40 minute(s)'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                            {item.timeRangeText || '8:00 AM - 12:40 PM'}
                          </div>
                        </td>

                        {/* SESSION Column matching Screenshot 1 */}
                        <td className="px-6 py-4">
                          <div className="font-normal text-gray-800 dark:text-slate-200 text-sm">
                            {item.sessionCount !== undefined ? `${item.sessionCount} Session` : '8 Session'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                            {item.breakCount !== undefined ? `${item.breakCount} Break` : '2 Break'}
                          </div>
                        </td>

                        {/* CREATED AT Column */}
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatCreatedAt(item.createdAt)}
                        </td>

                        {/* ROW ACTIONS 3-DOT MENU matching Screenshot 2 */}
                        <td className="px-6 py-4 text-right no-print relative">
                          <div className="relative inline-block text-left row-menu-container">
                            <button 
                              onClick={() => setOpenRowMenuId(openRowMenuId === item._id ? null : item._id)}
                              className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ${openRowMenuId === item._id ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 ring-2 ring-teal-500/20' : ''}`}
                              title="Actions Menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* ROW ACTION DROPDOWN MENU - 4 ITEMS matching Screenshot 2 */}
                            {openRowMenuId === item._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  
                                  {/* 1. Show */}
                                  <button
                                    onClick={() => {
                                      setOpenRowMenuId(null);
                                      setSelectedTimingModal(item);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Show</span>
                                  </button>

                                  {/* 2. Edit */}
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 3. Duplicate */}
                                  <button
                                    onClick={() => handleOpenDuplicate(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>

                                  {/* 4. Delete */}
                                  <button
                                    onClick={() => handleActionDeleteTrigger(item._id)}
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

            {/* Table Footer Pagination matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-slate-700/80 no-print text-xs text-gray-500 dark:text-slate-400">
              <div>
                Showing {totalResults === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-3">
                <select 
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 transition"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <div className="flex items-center space-x-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-[#1e293b] text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-300'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Branding as requested */}
            <div className="text-center pt-8 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT / DUPLICATE (Screenshot 5 Exact Match)
           ======================================================== */}
        {viewMode !== 'list' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Top Form Input Card matching Screenshot 5 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Session Name Input */}
              <div className="max-w-md space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Session Name
                </label>
                <input 
                  type="text"
                  placeholder="Session Name"
                  value={formData.sessionName}
                  onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Description
                </label>
                <textarea 
                  rows={3}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Dynamic Sessions List Card matching Screenshot 5 */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 space-y-6 bg-white dark:bg-slate-800/60">
                {formData.sessions.map((sessItem, index) => (
                  <div key={index} className="space-y-4 pb-6 border-b last:border-b-0 border-gray-100 dark:border-slate-700">
                    
                    {/* Row Header with Badge Number and Delete Icon Button */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {index + 1}.
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSessionItem(index)}
                        className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                        title="Remove Session"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    {/* Input Grid in Row matching Screenshot 5 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
                      
                      {/* Session Title */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Session
                        </label>
                        <input 
                          type="text"
                          placeholder="Session"
                          value={sessItem.session}
                          onChange={(e) => handleSessionChange(index, 'session', e.target.value)}
                          required
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                      </div>

                      {/* Code */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Code
                        </label>
                        <input 
                          type="text"
                          placeholder="Code"
                          value={sessItem.code}
                          onChange={(e) => handleSessionChange(index, 'code', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                      </div>

                      {/* Is Break Switch Toggle */}
                      <div className="flex items-center space-x-3 pt-4 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleSessionChange(index, 'isBreak', !sessItem.isBreak)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sessItem.isBreak ? 'bg-teal-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sessItem.isBreak ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Is Break
                        </span>
                      </div>

                      {/* Start Time */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                          Start Time
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            placeholder="Start Time"
                            value={sessItem.startTime}
                            onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                          />
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="space-y-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                          End Time
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            placeholder="End Time"
                            value={sessItem.endTime}
                            onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Add Session Button matching Screenshot 5 */}
                <button
                  type="button"
                  onClick={handleAddSessionItem}
                  className="px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Session
                </button>
              </div>

            </div>

            {/* Bottom Form Control Toolbar matching Screenshot 5 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 font-semibold text-xs rounded-xl transition"
                >
                  Reset
                </button>

                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={keepAdding}
                    onChange={(e) => setKeepAdding(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Keep Adding</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Bottom Footer Branding */}
            <div className="text-center pt-4 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </form>
        )}

      </div>

      {/* ========================================================
          SHOW DETAILS MODAL (When clicking "Show" in row menu)
         ======================================================== */}
      {selectedTimingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTimingModal.sessionName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {selectedTimingModal.totalDurationText} ({selectedTimingModal.timeRangeText})
                </p>
              </div>
              <button 
                onClick={() => setSelectedTimingModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTimingModal.description && (
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs text-gray-600 dark:text-slate-300">
                <span className="font-semibold">Description: </span>{selectedTimingModal.description}
              </div>
            )}

            {/* Sessions Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Sessions & Breaks Schedule
              </h4>
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-900 font-bold text-gray-500 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">SESSION</th>
                      <th className="px-4 py-2.5">CODE</th>
                      <th className="px-4 py-2.5">TYPE</th>
                      <th className="px-4 py-2.5">TIMING</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {selectedTimingModal.sessions?.map((s, idx) => (
                      <tr key={idx} className={s.isBreak ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}>
                        <td className="px-4 py-2.5 font-bold">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-slate-100">{s.session}</td>
                        <td className="px-4 py-2.5 font-mono text-gray-500">{s.code || '-'}</td>
                        <td className="px-4 py-2.5">
                          {s.isBreak ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-md text-[10px]">
                              Break
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 font-bold rounded-md text-[10px]">
                              Session
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 dark:text-slate-300">
                          {s.startTime} - {s.endTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedTimingModal(null)}
                className="px-5 py-2 bg-[#1e293b] text-white font-semibold text-xs rounded-xl hover:bg-[#0f172a] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL (Delete trigger)
         ======================================================== */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

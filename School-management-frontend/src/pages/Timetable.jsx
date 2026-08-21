import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  Eye, Copy, ChevronDown, Clock, X, FileText, UserCheck, Calendar, BookOpen, CheckCircle
} from 'lucide-react';

export default function Timetable({ initialView = 'list' }) {
  const [timetables, setTimetables] = useState([]);
  const [classTimings, setClassTimings] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [appliedFilterBatch, setAppliedFilterBatch] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Header 3-Dots Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row 3-Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Modals & View Modes
  // View modes: 'list' | 'add' | 'edit' | 'duplicate' | 'teacher' | 'allocation'
  const [viewMode, setViewMode] = useState(initialView);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [allocationTimetable, setAllocationTimetable] = useState(null);
  const [selectedTimingModal, setSelectedTimingModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Teacher Timetable View Filters (Screenshot 5)
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('');
  const [teacherDateFilter, setTeacherDateFilter] = useState('');
  const [teacherLayoutFilter, setTeacherLayoutFilter] = useState('Default');
  const [teacherScheduleResults, setTeacherScheduleResults] = useState([]);

  // Initial Add/Edit Form State (Screenshot 4)
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const initialForm = {
    batch: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    room: '',
    description: '',
    daySchedules: daysList.map(day => ({
      day,
      isHoliday: day === 'Sunday',
      classTiming: '',
      classTimingName: ''
    }))
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ttRes, ctRes, tRes, sRes, bRes] = await Promise.allSettled([
        API.get('/timetables'),
        API.get('/class-timings'),
        API.get('/teachers'),
        API.get('/subjects'),
        API.get('/batches')
      ]);

      if (ttRes.status === 'fulfilled') setTimetables(Array.isArray(ttRes.value.data) ? ttRes.value.data : []);
      if (ctRes.status === 'fulfilled') setClassTimings(Array.isArray(ctRes.value.data) ? ctRes.value.data : []);
      if (tRes.status === 'fulfilled') setTeachersList(Array.isArray(tRes.value.data) ? tRes.value.data : []);
      if (sRes.status === 'fulfilled') setSubjectsList(Array.isArray(sRes.value.data) ? sRes.value.data : []);
      if (bRes.status === 'fulfilled') setBatchesList(Array.isArray(bRes.value.data) ? bRes.value.data : []);

      setError('');
    } catch (err) {
      console.error('Error loading timetable data:', err);
      setError('Failed to load timetable data');
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

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingTimetable(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  // Open Edit Form
  const handleOpenEdit = (item) => {
    setOpenRowMenuId(null);
    setEditingTimetable(item);
    setFormData({
      batch: item.batch || '',
      effectiveDate: item.effectiveDate ? item.effectiveDate.split('T')[0] : new Date().toISOString().split('T')[0],
      room: item.room || '',
      description: item.description || '',
      daySchedules: daysList.map(day => {
        const existingDay = (item.daySchedules || []).find(ds => ds.day === day);
        return {
          day,
          isHoliday: existingDay ? !!existingDay.isHoliday : day === 'Sunday',
          classTiming: existingDay && existingDay.classTiming ? existingDay.classTiming._id || existingDay.classTiming : '',
          classTimingName: existingDay ? existingDay.classTimingName || '' : ''
        };
      })
    });
    setViewMode('edit');
  };

  // Open Duplicate Form
  const handleOpenDuplicate = (item) => {
    setOpenRowMenuId(null);
    setEditingTimetable(null);
    setFormData({
      batch: item.batch ? `${item.batch} (Copy)` : '',
      effectiveDate: new Date().toISOString().split('T')[0],
      room: item.room || '',
      description: item.description || '',
      daySchedules: daysList.map(day => {
        const existingDay = (item.daySchedules || []).find(ds => ds.day === day);
        return {
          day,
          isHoliday: existingDay ? !!existingDay.isHoliday : day === 'Sunday',
          classTiming: existingDay && existingDay.classTiming ? existingDay.classTiming._id || existingDay.classTiming : '',
          classTimingName: existingDay ? existingDay.classTimingName || '' : ''
        };
      })
    });
    setViewMode('duplicate');
  };

  // Open Allocation View/Modal
  const handleOpenAllocation = (item) => {
    setOpenRowMenuId(null);
    setAllocationTimetable(JSON.parse(JSON.stringify(item)));
    setViewMode('allocation');
  };

  // Handle Form Input Change for Add/Edit
  const handleDayScheduleChange = (dayIndex, field, value) => {
    setFormData(prev => {
      const updatedSchedules = [...prev.daySchedules];
      updatedSchedules[dayIndex] = {
        ...updatedSchedules[dayIndex],
        [field]: value
      };
      return { ...prev, daySchedules: updatedSchedules };
    });
  };

  // Form Submit (Add / Edit / Duplicate)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batch.trim()) {
      setError('Batch is required');
      return;
    }
    if (!formData.effectiveDate) {
      setError('Effective Date is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingTimetable) {
        await API.put(`/timetables/${editingTimetable._id}`, formData);
        setSuccessMsg('Timetable updated successfully!');
      } else {
        await API.post('/timetables', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated timetable saved successfully!' : 'Timetable created successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Allocation Updates
  const handleSaveAllocations = async () => {
    if (!allocationTimetable) return;
    setSubmitting(true);
    setError('');
    try {
      await API.put(`/timetables/${allocationTimetable._id}/allocations`, {
        daySchedules: allocationTimetable.daySchedules
      });
      setSuccessMsg('Period allocations updated successfully!');
      await fetchData();
      setViewMode('list');
    } catch (err) {
      console.error('Save allocations error:', err);
      setError('Failed to update period allocations');
    } finally {
      setSubmitting(false);
    }
  };

  // Allocation Field Change Handler
  const handleAllocationChange = (dayIndex, allocIndex, field, value) => {
    setAllocationTimetable(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy.daySchedules && copy.daySchedules[dayIndex] && copy.daySchedules[dayIndex].allocations[allocIndex]) {
        copy.daySchedules[dayIndex].allocations[allocIndex][field] = value;
      }
      return copy;
    });
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
          await API.delete(`/timetables/${id}`);
          setTimetables(prev => prev.filter(item => item._id !== id));
          setSuccessMsg('Timetable deleted successfully!');
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete timetable');
        }
      }
    });
  };

  // Header Dropdown Actions
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Timetable list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (timetables.length === 0) {
      setError('No timetable data available to export');
      return;
    }

    try {
      const exportData = filteredTimetables.map((item, index) => ({
        '#': index + 1,
        'Batch': item.batch || '',
        'Room': item.room || '',
        'Effective Date': item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetables');
      
      XLSX.writeFile(workbook, `Campus_Pilot_Timetables_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported timetables to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
  };

  // Teacher Timetable Filter Action (Screenshot 5)
  const handleFilterTeacherTimetable = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/timetables/teacher?teacherName=${encodeURIComponent(selectedTeacherFilter)}`);
      setTeacherScheduleResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching teacher timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateShort = (d) => {
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

  // Filter & Sort Logic
  const filteredTimetables = timetables
    .filter(item => {
      const matchesSearch = 
        !searchTerm || 
        (item.batch && item.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.room && item.room.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilterBatch = 
        !appliedFilterBatch ||
        (item.batch && item.batch.toLowerCase().includes(appliedFilterBatch.toLowerCase()));

      return matchesSearch && matchesFilterBatch;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'effectiveDate') {
        valA = new Date(a.effectiveDate || 0).getTime();
        valB = new Date(b.effectiveDate || 0).getTime();
      } else if (sortField === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalResults = filteredTimetables.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTimetables = filteredTimetables.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-timetable-area, #printable-timetable-area * {
            visibility: visible;
          }
          #printable-timetable-area {
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
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots 1, 4, 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/admin/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">
                Timetable
              </button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Timetable' : viewMode === 'edit' ? 'Edit Timetable' : viewMode === 'duplicate' ? 'Duplicate Timetable' : viewMode === 'teacher' ? 'Teacher Timetable' : 'Allocation'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Timetable' : viewMode === 'add' ? 'Add Timetable' : viewMode === 'edit' ? 'Edit Timetable' : viewMode === 'duplicate' ? 'Duplicate Timetable' : viewMode === 'teacher' ? 'Teacher Timetable' : 'Period Allocation'}
            </h1>
          </div>

          {/* Top Right Header Toolbar matching Screenshots 1 & 5 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                {/* Print Teacher Timetable Button (Screenshot 1) */}
                <button 
                  onClick={() => setViewMode('teacher')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs"
                >
                  Print Teacher Timetable
                </button>

                {/* Add Timetable Button (Screenshot 1) */}
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Timetable
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
                {viewMode === 'teacher' ? 'Timetable' : 'List all Timetable'}
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

        {/* FILTER CARD PANEL */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm no-print animate-in fade-in duration-150 space-y-4">
            <div className="max-w-xs space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Batch
              </label>
              <input 
                type="text"
                placeholder="Batch Name"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button 
                onClick={() => {
                  setFilterBatch('');
                  setAppliedFilterBatch('');
                  setShowFilterBar(false);
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAppliedFilterBatch(filterBatch);
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-timetable-area">
            
            {/* Search / Refresh Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search timetable..."
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
              <h2 className="text-xl font-bold">Campus Pilot - Timetable Overview</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshots 1 & 2 columns */}
            <div className="overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </th>
                    <th 
                      onClick={() => toggleSort('batch')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      BATCH
                    </th>
                    <th 
                      onClick={() => toggleSort('effectiveDate')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>EFFECTIVE DATE</span>
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
                  {paginatedTimetables.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No timetables found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Timetable</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedTimetables.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                        </td>

                        {/* BATCH Column matching Screenshot 1 */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-slate-100">
                            {item.batch}
                          </div>
                          {item.room && (
                            <div className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                              {item.room}
                            </div>
                          )}
                        </td>

                        {/* EFFECTIVE DATE Column */}
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                          {formatDateShort(item.effectiveDate)}
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

                            {/* ROW ACTION DROPDOWN MENU - 6 ITEMS matching Screenshot 2 */}
                            {openRowMenuId === item._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  
                                  {/* 1. Print */}
                                  <button
                                    onClick={() => {
                                      setOpenRowMenuId(null);
                                      window.print();
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Print</span>
                                  </button>

                                  {/* 2. Allocation */}
                                  <button
                                    onClick={() => handleOpenAllocation(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <CheckCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Allocation</span>
                                  </button>

                                  {/* 3. Show */}
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

                                  {/* 4. Edit */}
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 5. Duplicate */}
                                  <button
                                    onClick={() => handleOpenDuplicate(item)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>

                                  {/* 6. Delete */}
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

            {/* Pagination Controls matching Screenshot 1 */}
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

            {/* Bottom Branding */}
            <div className="text-center pt-8 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT / DUPLICATE (Screenshot 4 Exact Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Top Card Form Inputs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Batch, Effective Date & Room Inputs (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Batch Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Batch
                  </label>
                  {batchesList.length > 0 ? (
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    >
                      <option value="">Select Batch</option>
                      {batchesList.map(b => (
                        <option key={b._id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Batch (e.g. I (I) Section A)"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  )}
                </div>

                {/* Effective Date Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Effective Date
                  </label>
                  <input 
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Room Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Room
                  </label>
                  <input 
                    type="text"
                    placeholder="Room (e.g. Room 101 Block A Floor 1)"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Description
                </label>
                <textarea 
                  rows={2}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Days Schedule Section matching Screenshot 4 */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                  Weekly Class Timing Schedule
                </h3>

                <div className="space-y-3">
                  {formData.daySchedules.map((dayObj, index) => (
                    <div key={dayObj.day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-gray-50/70 dark:bg-slate-900/60 rounded-xl border border-gray-200/80 dark:border-slate-700">
                      
                      {/* Day Label */}
                      <div className="w-28 font-bold text-sm text-gray-800 dark:text-slate-200">
                        {dayObj.day}
                      </div>

                      {/* Holiday Toggle */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDayScheduleChange(index, 'isHoliday', !dayObj.isHoliday)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dayObj.isHoliday ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dayObj.isHoliday ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                          Holiday
                        </span>
                      </div>

                      {/* Class Timing Select Dropdown */}
                      <div className="flex-1 max-w-md">
                        <select
                          disabled={dayObj.isHoliday}
                          value={dayObj.classTiming}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const found = classTimings.find(ct => ct._id === selectedId);
                            handleDayScheduleChange(index, 'classTiming', selectedId);
                            handleDayScheduleChange(index, 'classTimingName', found ? found.sessionName : '');
                          }}
                          className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition"
                        >
                          <option value="">Select Class Timing</option>
                          {classTimings.map(ct => (
                            <option key={ct._id} value={ct._id}>
                              {ct.sessionName} ({ct.timeRangeText || 'Standard'})
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Toolbar matching Screenshot 4 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialForm)}
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

            {/* Bottom Branding */}
            <div className="text-center pt-4 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </form>
        )}

        {/* ========================================================
            VIEW MODE: TEACHER TIMETABLE (Screenshot 5 Exact Match)
           ======================================================== */}
        {viewMode === 'teacher' && (
          <div className="space-y-6">
            
            {/* Filter Card matching Screenshot 5 */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Select Employee */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Select Employee
                  </label>
                  <select
                    value={selectedTeacherFilter}
                    onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  >
                    <option value="">Select Employee</option>
                    {teachersList.length > 0 ? (
                      teachersList.map(t => (
                        <option key={t._id} value={t.name}>{t.name} ({t.subject || 'Teacher'})</option>
                      ))
                    ) : (
                      <>
                        <option value="Rajesh Sharma">Rajesh Sharma</option>
                        <option value="Priya Verma">Priya Verma</option>
                        <option value="Amit Kumar">Amit Kumar</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Date
                  </label>
                  <input 
                    type="date"
                    value={teacherDateFilter}
                    onChange={(e) => setTeacherDateFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Select Layout */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Select Layout
                  </label>
                  <select
                    value={teacherLayoutFilter}
                    onChange={(e) => setTeacherLayoutFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                  >
                    <option value="Default">Default</option>
                    <option value="Compact">Compact</option>
                    <option value="Grid">Grid</option>
                  </select>
                </div>

              </div>

              {/* Filter Card Actions matching Screenshot 5 */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button 
                  onClick={() => {
                    setSelectedTeacherFilter('');
                    setTeacherDateFilter('');
                    setTeacherScheduleResults([]);
                  }}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Cancel
                </button>

                <button 
                  onClick={handleFilterTeacherTimetable}
                  className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Filter</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Results Grid / Schedule Display */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Teacher Schedule {selectedTeacherFilter ? `for ${selectedTeacherFilter}` : ''}
              </h3>

              {teacherScheduleResults.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-slate-500 text-xs">
                  {selectedTeacherFilter ? 'No assigned classes found for this teacher.' : 'Select an employee and click Filter to view assigned class schedule.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-900 font-bold text-gray-500 border-b border-gray-200 dark:border-slate-700">
                        <th className="px-4 py-3">DAY</th>
                        <th className="px-4 py-3">PERIOD</th>
                        <th className="px-4 py-3">TIME</th>
                        <th className="px-4 py-3">BATCH / CLASS</th>
                        <th className="px-4 py-3">SUBJECT</th>
                        <th className="px-4 py-3">ROOM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {teacherScheduleResults.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                          <td className="px-4 py-3 font-bold text-teal-600 dark:text-teal-400">{item.day}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">{item.periodName} ({item.code})</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.startTime} - {item.endTime}</td>
                          <td className="px-4 py-3 font-semibold">{item.batch}</td>
                          <td className="px-4 py-3 text-teal-700 dark:text-teal-300 font-medium">{item.subject}</td>
                          <td className="px-4 py-3 text-gray-500">{item.room || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Branding */}
            <div className="text-center pt-4 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ALLOCATION (Assign Subjects & Teachers to Periods)
           ======================================================== */}
        {viewMode === 'allocation' && allocationTimetable && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Subject & Teacher Allocation: <span className="text-teal-600">{allocationTimetable.batch}</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Assign subject and faculty teacher for each period across all days.
                  </p>
                </div>
                <button
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-gray-200 transition"
                >
                  Back to List
                </button>
              </div>

              {/* Day Allocations Matrix */}
              <div className="space-y-8">
                {allocationTimetable.daySchedules?.map((dayObj, dayIdx) => (
                  <div key={dayObj.day} className="space-y-3 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 bg-gray-50/40 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{dayObj.day}</span>
                        {dayObj.isHoliday ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">Holiday</span>
                        ) : (
                          <span className="text-xs text-gray-400">({dayObj.classTimingName || 'Standard'})</span>
                        )}
                      </div>
                    </div>

                    {!dayObj.isHoliday && dayObj.allocations && dayObj.allocations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dayObj.allocations.map((alloc, allocIdx) => (
                          <div 
                            key={allocIdx} 
                            className={`p-3.5 rounded-xl border ${alloc.isBreak ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'} space-y-2`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-800 dark:text-slate-200">{alloc.periodName} ({alloc.code})</span>
                              <span className="text-[10px] text-gray-400">{alloc.startTime} - {alloc.endTime}</span>
                            </div>

                            {alloc.isBreak ? (
                              <div className="text-center py-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                BREAK
                              </div>
                            ) : (
                              <>
                                {/* Subject Selector */}
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-gray-500">Subject</label>
                                  <input 
                                    type="text"
                                    placeholder="Subject Name"
                                    value={alloc.subject || ''}
                                    onChange={(e) => handleAllocationChange(dayIdx, allocIdx, 'subject', e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>

                                {/* Teacher Selector */}
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-gray-500">Teacher</label>
                                  <input 
                                    type="text"
                                    placeholder="Teacher Name"
                                    value={alloc.teacher || ''}
                                    onChange={(e) => handleAllocationChange(dayIdx, allocIdx, 'teacher', e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No periods defined or holiday.</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Allocation Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSaveAllocations}
                  className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save Allocation'}
                </button>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="text-center pt-4 text-xs font-medium text-gray-400 dark:text-slate-500">
              Campus Pilot
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          SHOW DETAILS MODAL (When clicking "Show" in row menu)
         ======================================================== */}
      {selectedTimingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Timetable Details: {selectedTimingModal.batch}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Effective Date: {formatDateShort(selectedTimingModal.effectiveDate)} {selectedTimingModal.room ? `| ${selectedTimingModal.room}` : ''}
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

            {/* Timetable Schedule Grid */}
            <div className="space-y-4">
              {selectedTimingModal.daySchedules?.map(ds => (
                <div key={ds.day} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-teal-600 dark:text-teal-400">{ds.day}</span>
                    {ds.isHoliday ? (
                      <span className="text-amber-500">HOLIDAY</span>
                    ) : (
                      <span className="text-gray-400">{ds.classTimingName || 'Standard Schedule'}</span>
                    )}
                  </div>

                  {!ds.isHoliday && ds.allocations && ds.allocations.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {ds.allocations.map((alloc, idx) => (
                        <div key={idx} className={`p-2 rounded-lg text-[11px] border ${alloc.isBreak ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700'}`}>
                          <div className="font-bold text-gray-800 dark:text-slate-200">{alloc.periodName} ({alloc.startTime} - {alloc.endTime})</div>
                          {alloc.isBreak ? (
                            <div className="text-amber-600 font-bold">Break</div>
                          ) : (
                            <>
                              <div className="text-teal-700 dark:text-teal-300 font-medium truncate">{alloc.subject || 'No Subject'}</div>
                              <div className="text-gray-500 truncate">{alloc.teacher || 'No Teacher'}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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

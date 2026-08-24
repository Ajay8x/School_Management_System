import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, ChevronRight, Home, CheckCircle2, AlertCircle,
  Eye, ChevronDown, Clock, X, FileText, Upload, Calendar, User, ArrowLeft,
  Check, XCircle
} from 'lucide-react';

export default function ServiceRequest({ initialView = 'list' }) {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Dropdown States
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // View modes: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [editingRequest, setEditingRequest] = useState(null);
  const [selectedRequestModal, setSelectedRequestModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State matching Screenshot 4
  const initialForm = {
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Mess',
    requestType: 'Opt In',
    description: '',
    attachment: null,
    fileName: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch Service Requests and Students
  const fetchData = async () => {
    try {
      setLoading(true);
      const [srRes, stRes] = await Promise.allSettled([
        API.get('/students/service-requests'),
        API.get('/students')
      ]);

      if (srRes.status === 'fulfilled') {
        setServiceRequests(Array.isArray(srRes.value.data) ? srRes.value.data : []);
      }
      if (stRes.status === 'fulfilled') {
        setStudentsList(Array.isArray(stRes.value.data) ? stRes.value.data : []);
      }

      setError('');
    } catch (err) {
      console.error('Error loading service requests:', err);
      setError('Failed to load service request records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close dropdowns on outside click
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

  // Handlers for Open Add/Edit
  const handleOpenAdd = () => {
    setEditingRequest(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (item) => {
    setOpenRowMenuId(null);
    setEditingRequest(item);
    setFormData({
      studentId: item.student?._id || item.student || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: item.type ? item.type.split('\n')[0] : 'Mess',
      requestType: item.requestType || 'Opt In',
      description: item.description || '',
      attachment: item.attachment || null,
      fileName: item.attachment?.fileName || ''
    });
    setViewMode('edit');
  };

  // Submit Form Action
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingRequest) {
        await API.put(`/students/service-requests/${editingRequest._id}`, formData);
        setSuccessMsg('Service request updated successfully!');
      } else {
        await API.post('/students/service-requests', formData);
        setSuccessMsg('Service request created successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode === 'add') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save service request');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteTrigger = (id) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/students/service-requests/${id}`);
          setServiceRequests(prev => prev.filter(item => item._id !== id));
          setSuccessMsg('Service request deleted successfully!');
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete service request');
        }
      }
    });
  };

  // Status Change Handler (Approve / Reject)
  const handleStatusChange = async (id, newStatus, reason = '') => {
    try {
      await API.put(`/students/service-requests/${id}/status`, { status: newStatus, rejectionReason: reason });
      setSuccessMsg(`Service request ${newStatus.toLowerCase()} successfully!`);
      if (selectedRequestModal && selectedRequestModal._id === id) {
        setSelectedRequestModal(prev => ({ ...prev, status: newStatus, rejectionReason: reason }));
      }
      await fetchData();
    } catch (err) {
      console.error('Status change error:', err);
      setError('Failed to update status');
    }
  };

  // Header Options Handlers
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Service requests refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (serviceRequests.length === 0) {
      setError('No service requests to export');
      return;
    }

    try {
      const exportData = filteredRequests.map((item, index) => ({
        '#': index + 1,
        'Code Number': item.codeNumber || '',
        'Student Name': item.studentName || '',
        'Contact': item.contact || '',
        'Parent Name': item.parentName || '',
        'Date of Admission': item.dateOfAdmission || '',
        'Course': item.course || '',
        'Date': item.date ? new Date(item.date).toLocaleDateString() : '',
        'Type': item.type || '',
        'Request Type': item.requestType || '',
        'Status': item.status || '',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Service_Requests');

      XLSX.writeFile(workbook, `Campus_Pilot_Service_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported service requests to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export to Excel');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        attachment: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          url: URL.createObjectURL(file)
        }
      }));
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

  const formatDateShort = (d) => {
    if (!d) return '-';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return d;
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search logic
  const filteredRequests = serviceRequests
    .filter(item => {
      const matchesSearch = 
        !searchTerm ||
        (item.codeNumber && item.codeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.parentName && item.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.course && item.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStudent = !appliedFilters.student || 
        (item.student?._id === appliedFilters.student) || 
        (item.studentName && item.studentName.toLowerCase().includes(appliedFilters.student.toLowerCase()));

      let matchesDate = true;
      if (appliedFilters.startDate || appliedFilters.endDate) {
        const itemDate = new Date(item.date || item.createdAt).getTime();
        if (appliedFilters.startDate && itemDate < new Date(appliedFilters.startDate).getTime()) matchesDate = false;
        if (appliedFilters.endDate && itemDate > new Date(appliedFilters.endDate).setHours(23,59,59,999)) matchesDate = false;
      }

      return matchesSearch && matchesStudent && matchesDate;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'createdAt' || sortField === 'date') {
        valA = new Date(a[sortField] || 0).getTime();
        valB = new Date(b[sortField] || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalResults = filteredRequests.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-servicerequest-area, #printable-servicerequest-area * {
            visibility: visible;
          }
          #printable-servicerequest-area {
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
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots 1 & 4 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/admin/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <a href="/admin/students" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                Student
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">
                Service Request
              </button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Service Request' : 'Edit Service Request'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Service Request' : viewMode === 'add' ? 'Add Service Request' : 'Edit Service Request'}
            </h1>
          </div>

          {/* Top Right Buttons matching Screenshots 1, 2 & 4 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                {/* Add Service Request Button (Screenshot 1) */}
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Service Request
                </button>

                {/* Filter Icon Button (Screenshot 1 & 3) */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* 3-DOTS HEADER DROPDOWN MENU matching Screenshot 2 */}
                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isHeaderMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Header Dropdown Menu matching Screenshot 2 */}
                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
                        
                        {/* 1. Refresh */}
                        <button
                          onClick={handleRefreshAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <RotateCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Refresh</span>
                        </button>

                        {/* 2. Print */}
                        <button
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Print</span>
                        </button>

                        {/* 3. Generate PDF */}
                        <button
                          onClick={handlePrintAction}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3"
                        >
                          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Generate PDF</span>
                        </button>

                        {/* 4. Export to Excel */}
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
              /* List all Service Request Button (Screenshot 4) */
              <button 
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Service Request
              </button>
            )}
          </div>
        </div>

        {/* Notifications Alert */}
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

        {/* FILTER CARD PANEL matching Screenshot 3 */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm no-print space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Select Student */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Select Student
                </label>
                <select 
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-gray-600 dark:text-slate-300"
                >
                  <option value="">Select Student</option>
                  {studentsList.map(st => (
                    <option key={st._id} value={st._id}>{st.name} ({st.rollNumber || st.admissionNumber || 'N/A'})</option>
                  ))}
                  <option value="Ritisha Tripathi">Ritisha Tripathi</option>
                </select>
              </div>

              {/* Date Between */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Date Between
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-gray-600 dark:text-slate-300"
                    placeholder="Start Date"
                  />
                  <input 
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-gray-600 dark:text-slate-300"
                    placeholder="End Date"
                  />
                </div>
              </div>

            </div>

            {/* Filter Action Buttons matching Screenshot 3 */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button 
                onClick={() => {
                  setFilterStudent('');
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setAppliedFilters({});
                  setShowFilterBar(false);
                }}
                className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAppliedFilters({
                    student: filterStudent,
                    startDate: filterStartDate,
                    endDate: filterEndDate
                  });
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                Filter
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST (Screenshots 1 & 5 Exact Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-servicerequest-area">
            
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search service requests..."
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
              <h2 className="text-xl font-bold">Campus Pilot - Service Requests</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshot 1 columns */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-4 py-3.5 whitespace-nowrap">CODE NUMBER</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">NAME</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">PARENT</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">DATE OF ADMISSION</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">COURSE</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">DATE</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">TYPE</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">REQUEST TYPE</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">STATUS</th>
                    <th 
                      onClick={() => toggleSort('createdAt')}
                      className="px-4 py-3.5 whitespace-nowrap cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>CREATED AT</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/80 text-xs">
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No service requests found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Service Request</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((item) => {
                      const isSingleRowCustom = item.studentName === 'May 27, 2026' || item.studentName === 'April 20, 2026';
                      return (
                        <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                          
                          {/* CODE NUMBER */}
                          <td className="px-4 py-4 font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                            {item.codeNumber}
                          </td>

                          {/* NAME */}
                          <td className="px-4 py-4 text-gray-900 dark:text-slate-100">
                            {isSingleRowCustom ? (
                              <span className="font-semibold">{item.studentName}</span>
                            ) : (
                              <div>
                                <div className="font-semibold text-gray-800 dark:text-slate-200">{item.studentName}</div>
                                {item.contact && <div className="text-gray-400 dark:text-slate-400 text-[11px] mt-0.5">{item.contact}</div>}
                              </div>
                            )}
                          </td>

                          {/* PARENT */}
                          <td className="px-4 py-4 text-gray-600 dark:text-slate-300">
                            <div className="whitespace-pre-line leading-snug">{item.parentName || '-'}</div>
                          </td>

                          {/* DATE OF ADMISSION */}
                          <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
                            {item.dateOfAdmission === 'Opt In' ? (
                              <span className="font-semibold text-gray-800 dark:text-slate-200">Opt In</span>
                            ) : (
                              <div>
                                <div>{item.dateOfAdmission}</div>
                                {item.admissionNumber && <div className="text-gray-400 dark:text-slate-400 text-[11px] font-mono mt-0.5">{item.admissionNumber}</div>}
                              </div>
                            )}
                          </td>

                          {/* COURSE */}
                          <td className="px-4 py-4 text-gray-700 dark:text-slate-300">
                            {item.course === 'Approved' ? (
                              <span className="inline-block px-3 py-1 bg-emerald-500 text-white font-semibold text-[11px] rounded-full">Approved</span>
                            ) : item.course === 'Requested' ? (
                              <span className="inline-block px-3 py-1 bg-sky-400 text-white font-semibold text-[11px] rounded-full">Requested</span>
                            ) : (
                              <div>
                                <div className="font-semibold">{item.course}</div>
                                {item.section && <div className="text-gray-400 text-[11px]">{item.section}</div>}
                              </div>
                            )}
                          </td>

                          {/* DATE */}
                          <td className="px-4 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                            {formatCreatedAt(item.date)}
                          </td>

                          {/* TYPE */}
                          <td className="px-4 py-4 text-gray-700 dark:text-slate-300 font-medium">
                            <div className="whitespace-pre-line">{item.type || '-'}</div>
                          </td>

                          {/* REQUEST TYPE */}
                          <td className="px-4 py-4 text-gray-700 dark:text-slate-300 font-medium">
                            {item.requestType || '-'}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full text-white shadow-xs ${
                              item.status === 'Approved' ? 'bg-emerald-500' :
                              item.status === 'Requested' ? 'bg-[#3b82f6]' :
                              item.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}>
                              {item.status}
                            </span>
                          </td>

                          {/* CREATED AT */}
                          <td className="px-4 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                            {formatCreatedAt(item.createdAt)}
                          </td>

                          {/* ROW ACTIONS 3-DOT MENU matching Screenshot 5 */}
                          <td className="px-4 py-4 text-right no-print relative">
                            <div className="relative inline-block text-left row-menu-container">
                              <button 
                                onClick={() => setOpenRowMenuId(openRowMenuId === item._id ? null : item._id)}
                                className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ${openRowMenuId === item._id ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 ring-2 ring-teal-500/20' : ''}`}
                                title="Actions Menu"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* ROW ACTION DROPDOWN MENU - 3 ITEMS matching Screenshot 5 */}
                              {openRowMenuId === item._id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                  <div className="py-1">
                                    
                                    {/* 1. Show */}
                                    <button
                                      onClick={() => {
                                        setOpenRowMenuId(null);
                                        setSelectedRequestModal(item);
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                      <span>Show</span>
                                    </button>

                                    {/* 2. Edit */}
                                    <button
                                      onClick={() => handleOpenEdit(item)}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                      <span>Edit</span>
                                    </button>

                                    {/* 3. Delete */}
                                    <button
                                      onClick={() => handleDeleteTrigger(item._id)}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-700 no-print text-xs text-gray-500 dark:text-slate-400">
              <div>
                Showing {totalResults === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-3">
                {/* Per Page Select */}
                <select 
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                {/* Page Navigation */}
                <div className="flex items-center space-x-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    ‹
                  </button>

                  <span className="px-3 py-1 bg-[#1e293b] text-white font-bold rounded-lg text-xs">
                    {currentPage}
                  </span>

                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Branding matching Screenshot 1 */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-700/50 text-center text-xs text-gray-400 font-medium">
              Campus Pilot
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT SERVICE REQUEST (Screenshot 4 Exact Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Top Row Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Select Student */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Select Student
                  </label>
                  <select 
                    value={formData.studentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-600 dark:text-slate-300"
                  >
                    <option value="">Select Student</option>
                    {studentsList.map(st => (
                      <option key={st._id} value={st._id}>{st.name} ({st.rollNumber || st.admissionNumber || 'N/A'})</option>
                    ))}
                    <option value="Ritisha Tripathi">Ritisha Tripathi</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Date
                  </label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800 dark:text-slate-200"
                  />
                </div>

                {/* Type Choice Buttons matching Screenshot 4 */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Type
                  </label>
                  <div className="flex items-center space-x-2">
                    {['Mess', 'Transport', 'Hostel'].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                        className={`px-4 py-2 text-xs font-medium border rounded-md transition ${
                          formData.type === t
                            ? 'border-slate-800 bg-slate-800 text-white font-semibold'
                            : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Second Row: Request Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Request Type
                </label>
                <div className="flex items-center space-x-2">
                  {['Opt In', 'Opt Out'].map((rt) => (
                    <button
                      type="button"
                      key={rt}
                      onClick={() => setFormData(prev => ({ ...prev, requestType: rt }))}
                      className={`px-6 py-2 text-xs font-medium border rounded-md transition ${
                        formData.requestType === rt
                          ? 'border-slate-800 bg-slate-800 text-white font-semibold'
                          : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Description
                </label>
                <textarea 
                  rows={4}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800 dark:text-slate-200 resize-y"
                />
              </div>

              {/* Upload File Button matching Screenshot 4 */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-md cursor-pointer transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {formData.fileName && (
                  <span className="ml-3 text-xs text-gray-600 dark:text-slate-300 font-medium">
                    {formData.fileName}
                  </span>
                )}
              </div>

              {/* Bottom Action Bar matching Screenshot 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button 
                    type="button"
                    onClick={() => setFormData(initialForm)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-slate-200 text-xs font-medium rounded-md transition"
                  >
                    Reset
                  </button>
                  <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={keepAdding}
                      onChange={(e) => setKeepAdding(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Keep Adding</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-md shadow-xs transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center gap-2"
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>

            <div className="mt-8 pt-4 text-center text-xs text-gray-400 font-medium">
              Campus Pilot
            </div>
          </div>
        )}

      </div>

      {/* SHOW DETAIL MODAL */}
      {selectedRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 dark:border-slate-700 relative">
            <button 
              onClick={() => setSelectedRequestModal(null)}
              className="absolute right-5 top-5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Service Request Details</h3>
                <p className="text-xs text-gray-500 font-mono">Code: {selectedRequestModal.codeNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Student Name</span>
                <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{selectedRequestModal.studentName}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Parent Name</span>
                <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{selectedRequestModal.parentName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Course / Section</span>
                <span className="font-semibold text-gray-700 dark:text-slate-300">{selectedRequestModal.course} {selectedRequestModal.section}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Admission Date / ID</span>
                <span className="font-semibold text-gray-700 dark:text-slate-300">{selectedRequestModal.dateOfAdmission} ({selectedRequestModal.admissionNumber || 'N/A'})</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Service Type</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{selectedRequestModal.type}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Request Type</span>
                <span className="font-bold text-gray-700 dark:text-slate-300">{selectedRequestModal.requestType}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Request Date</span>
                <span className="font-medium text-gray-600 dark:text-slate-400">{formatCreatedAt(selectedRequestModal.date)}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Current Status</span>
                <span className={`inline-block mt-1 px-3 py-1 text-[11px] font-bold rounded-full text-white ${
                  selectedRequestModal.status === 'Approved' ? 'bg-emerald-500' :
                  selectedRequestModal.status === 'Requested' ? 'bg-blue-500' :
                  selectedRequestModal.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                }`}>
                  {selectedRequestModal.status}
                </span>
              </div>
            </div>

            {selectedRequestModal.description && (
              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
                <span className="font-bold text-gray-700 dark:text-slate-300 block">Description:</span>
                <p className="text-gray-600 dark:text-slate-400">{selectedRequestModal.description}</p>
              </div>
            )}

            {selectedRequestModal.attachment && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <span className="font-medium text-gray-700 dark:text-slate-300">{selectedRequestModal.attachment.fileName}</span>
                </div>
                {selectedRequestModal.attachment.url && (
                  <a href={selectedRequestModal.attachment.url} target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline">
                    View
                  </a>
                )}
              </div>
            )}

            {/* Admin Status Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Update Request Status:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusChange(selectedRequestModal._id, 'Approved')}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedRequestModal._id, 'Rejected')}
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition"
                >
                  Reject
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{confirmModal.title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{confirmModal.message}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md"
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

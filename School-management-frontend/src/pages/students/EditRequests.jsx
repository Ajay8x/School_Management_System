import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import * as XLSX from 'xlsx';
import { 
  Filter, MoreVertical, RefreshCw, Printer, FileText, FileSpreadsheet, 
  ChevronRight, ChevronLeft, X, Check, Eye, Trash2, Info, Plus, FileUp, AlertCircle
} from 'lucide-react';

export default function EditRequests() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [editRequests, setEditRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);

  // Top header actions dropdown
  const [showTopMenu, setShowTopMenu] = useState(false);
  const topMenuRef = useRef(null);

  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Row action menu state
  const [activeRowMenu, setActiveRowMenu] = useState(null);

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Add request modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    studentName: '',
    contact: '',
    fatherName: '',
    motherName: '',
    dateOfAdmission: '',
    admissionNumber: '',
    course: 'IX',
    section: 'Section A',
    birthDate: '',
    requestBy: '',
    bloodGroup: 'O+',
    attachmentName: ''
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topMenuRef.current && !topMenuRef.current.contains(event.target)) {
        setShowTopMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Edit Requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let params = {};
      if (filterStudent) params.studentId = filterStudent;
      if (filterStatus && filterStatus !== 'All') params.status = filterStatus;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await API.get('/students/edit-requests', { params });
      setEditRequests(res.data);
    } catch (err) {
      console.error('Error fetching edit requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students for dropdown
  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStudents();
  }, []);

  // Sync route parameter for detail view
  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    } else {
      setIsDetailView(false);
      setSelectedRequest(null);
    }
  }, [id]);

  const fetchRequestById = async (reqId) => {
    setLoading(true);
    try {
      const res = await API.get(`/students/edit-requests/${reqId}`);
      setSelectedRequest(res.data);
      setIsDetailView(true);
    } catch (err) {
      console.error('Error fetching request detail:', err);
      setIsDetailView(false);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = editRequests.map(item => ({
      'Student Name': item.studentName,
      'Contact': item.contact,
      'Parent Name': item.parentName || `${item.fatherName} / ${item.motherName}`,
      'Admission Date': item.dateOfAdmission,
      'Admission Number': item.admissionNumber,
      'Course': `${item.course} ${item.section || ''}`,
      'Status': item.status,
      'Created At': new Date(item.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Edit Requests');
    XLSX.writeFile(workbook, 'Student_Edit_Requests.xlsx');
    setShowTopMenu(false);
  };

  // Print function
  const handlePrint = () => {
    window.print();
    setShowTopMenu(false);
  };

  // Status Change handlers
  const handleApprove = async (reqId) => {
    try {
      await API.put(`/students/edit-requests/${reqId}/status`, { status: 'Approved' });
      fetchRequests();
      if (selectedRequest && selectedRequest._id === reqId) {
        fetchRequestById(reqId);
      }
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };

  const handleOpenRejectModal = (reqId) => {
    setRejectingId(reqId);
    setRejectionReasonInput('bb');
    setShowRejectModal(true);
    setActiveRowMenu(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    try {
      await API.put(`/students/edit-requests/${rejectingId}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReasonInput || 'Rejected'
      });
      setShowRejectModal(false);
      fetchRequests();
      if (selectedRequest && selectedRequest._id === rejectingId) {
        fetchRequestById(rejectingId);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleDelete = async (reqId) => {
    if (window.confirm('Are you sure you want to delete this edit request?')) {
      try {
        await API.delete(`/students/edit-requests/${reqId}`);
        fetchRequests();
        if (isDetailView) {
          navigate('/admin/students/edit-request');
        }
      } catch (err) {
        console.error('Error deleting request:', err);
      }
    }
  };

  const handleCreateNewRequest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRequestForm,
        attachment: newRequestForm.attachmentName ? {
          fileName: newRequestForm.attachmentName,
          fileSize: '103.97 KB',
          url: '#'
        } : null
      };
      await API.post('/students/edit-requests', payload);
      setShowAddModal(false);
      setNewRequestForm({
        studentName: '',
        contact: '',
        fatherName: '',
        motherName: '',
        dateOfAdmission: '',
        admissionNumber: '',
        course: 'IX',
        section: 'Section A',
        birthDate: '',
        requestBy: '',
        bloodGroup: 'O+',
        attachmentName: ''
      });
      fetchRequests();
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filtering list locally if needed
  const filteredData = editRequests;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 sm:p-6 bg-[#f4f7fa] dark:bg-slate-900 min-h-screen text-[#333333] dark:text-slate-200">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
        <span>&gt;</span>
        <span>Student</span>
        <span>&gt;</span>
        <span className={isDetailView ? 'hover:text-teal-600 cursor-pointer' : 'font-semibold text-gray-700 dark:text-slate-300'} onClick={() => { if(isDetailView) navigate('/admin/students/edit-request'); }}>
          Edit Request
        </span>
        {isDetailView && (
          <>
            <span>&gt;</span>
            <span className="font-semibold text-gray-700 dark:text-slate-300">Edit Request Detail</span>
          </>
        )}
      </div>

      {/* Detail View Mode */}
      {isDetailView && selectedRequest ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          
          {/* Header Title Bar with "List all Edit Request" button */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-[#2d3748] dark:text-white">Edit Request Detail</h2>
            <button
              onClick={() => navigate('/admin/students/edit-request')}
              className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold px-4 py-2 rounded-md transition duration-150 shadow-sm flex items-center gap-1.5"
            >
              List all Edit Request
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Student Title Subheader */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {selectedRequest.studentName}
            </h3>

            {/* Rejection Alert Banner matching Screenshot 4 */}
            {selectedRequest.status === 'Rejected' && (
              <div className="bg-[#ef4444] text-white px-4 py-3 rounded-md flex items-center space-x-2 text-sm font-semibold shadow-sm">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>{selectedRequest.rejectionReason || 'bb'}</span>
              </div>
            )}

            {/* Student Details Grid (2 Columns Layout matching Screenshot 4 & 5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 py-2">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Admission Number</p>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {selectedRequest.admissionNumber}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold text-white ${
                      selectedRequest.status === 'Approved' ? 'bg-[#10b981]' : 
                      selectedRequest.status === 'Rejected' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Father Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {selectedRequest.fatherName || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Course</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {selectedRequest.course} {selectedRequest.section}
                  </p>
                </div>

                {selectedRequest.bloodGroup && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Blood Group</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {selectedRequest.bloodGroup}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Birth Date</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {selectedRequest.birthDate || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Mother Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {selectedRequest.motherName || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Request By</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {selectedRequest.requestBy || selectedRequest.studentName}
                  </p>
                </div>
              </div>

            </div>

            {/* Attachments Section matching Screenshot 4 & 5 */}
            <div className="pt-4">
              {selectedRequest.attachment && selectedRequest.attachment.fileName ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 max-w-sm">
                  <FileText className="w-8 h-8 text-gray-600 dark:text-slate-300 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{selectedRequest.attachment.fileName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{selectedRequest.attachment.fileSize || '103.97 KB'}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#60a5fa] text-white px-4 py-3 rounded-md flex items-center space-x-2 text-sm font-semibold shadow-sm">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span>No attachment found.</span>
                </div>
              )}
            </div>

            {/* Bottom Timestamps matching Screenshot 4 & 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
              <div>
                <span className="block font-medium mb-1">Created At</span>
                <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {formatDate(selectedRequest.createdAt)}
                </span>
              </div>
              <div>
                <span className="block font-medium mb-1">Last Updated At</span>
                <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {formatDate(selectedRequest.lastUpdatedAt || selectedRequest.updatedAt || selectedRequest.createdAt)}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Branding */}
          <div className="py-4 text-center text-xs text-gray-400 dark:text-slate-500 border-t border-gray-100 dark:border-slate-700">
            Campus Tracker
          </div>

        </div>
      ) : (
        /* Main List View Mode */
        <div className="space-y-4">
          
          {/* Header Title and Right Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Edit Request</h1>

            <div className="flex items-center space-x-2">
              
              {/* Add New Request Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Request</span>
              </button>

              {/* Filter Toggle Button (Funnel Icon) */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-2 rounded-lg border text-gray-600 dark:text-slate-300 transition ${
                  showFilterPanel 
                    ? 'bg-teal-50 border-teal-500 text-teal-600 dark:bg-slate-700' 
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                }`}
                title="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Three Dots Menu Button (Top Right Header Action Dropdown) */}
              <div className="relative" ref={topMenuRef}>
                <button
                  onClick={() => setShowTopMenu(!showTopMenu)}
                  className="p-2 rounded-lg border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Top Right Action Menu Dropdown matching Screenshot 2 */}
                {showTopMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1.5 text-xs text-gray-700 dark:text-slate-200">
                    <button
                      onClick={() => { fetchRequests(); setShowTopMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>Generate PDF</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
                      <span>Export to Excel</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Filter Accordion Panel matching Screenshot 3 */}
          {showFilterPanel && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Select Student */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Select Student
                  </label>
                  <select
                    value={filterStudent}
                    onChange={(e) => setFilterStudent(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s._id} value={s.name}>{s.name} ({s.rollNumber || s.serialNumber || 'SM001'})</option>
                    ))}
                  </select>
                </div>

                {/* Date Between */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Date Between
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Select Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    Select Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="All">Select Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setFilterStudent('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setFilterStatus('All');
                    fetchRequests();
                  }}
                  className="bg-[#ef4444] hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  onClick={fetchRequests}
                  className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold px-5 py-2 rounded-md transition flex items-center gap-1"
                >
                  <span>Filter</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            
            {/* Recent Alert Bar matching Screenshot 1 & 2 */}
            {editRequests.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#10b981] text-white px-2.5 py-0.5 rounded font-semibold text-[11px]">
                    Approved
                  </span>
                  <span className="text-gray-600 dark:text-slate-300 font-medium">
                    May 27, 2026 10:07 AM
                  </span>
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-[11px] font-bold uppercase text-gray-500 dark:text-slate-400 tracking-wider">
                    <th className="px-6 py-3.5">NAME</th>
                    <th className="px-6 py-3.5">PARENT</th>
                    <th className="px-6 py-3.5">DATE OF ADMISSION</th>
                    <th className="px-6 py-3.5">COURSE</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5">CREATED AT <span className="inline-block text-[10px]">⇅</span></th>
                    <th className="px-4 py-3.5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">Loading edit requests...</td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">No edit requests found.</td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr 
                        key={item._id} 
                        className="hover:bg-gray-50/80 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {/* NAME */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800 dark:text-white leading-tight">{item.studentName}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{item.contact || '9935332556'}</p>
                        </td>

                        {/* PARENT */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800 dark:text-slate-200 leading-tight">{item.fatherName || 'Hariom Tripathi'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{item.motherName || 'Anamika Tripathi'}</p>
                        </td>

                        {/* DATE OF ADMISSION */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800 dark:text-slate-200 leading-tight">{item.dateOfAdmission || 'February 8, 2025'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{item.admissionNumber || 'SM001'}</p>
                        </td>

                        {/* COURSE */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800 dark:text-slate-200 leading-tight">{item.course || 'IX'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{item.section || 'Section A'}</p>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded font-semibold text-white ${
                            item.status === 'Approved' ? 'bg-[#10b981]' : 
                            item.status === 'Rejected' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        {/* CREATED AT */}
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* ROW ACTIONS THREE-DOTS MENU */}
                        <td className="px-4 py-4 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRowMenu(activeRowMenu === item._id ? null : item._id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Row Action Menu Dropdown */}
                          {activeRowMenu === item._id && (
                            <div 
                              className="absolute right-6 top-10 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 text-xs text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setActiveRowMenu(null);
                                  navigate(`/admin/students/edit-request/${item._id}`);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-gray-700 dark:text-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                <span>Show</span>
                              </button>
                              
                              {item.status !== 'Approved' && (
                                <button
                                  onClick={() => {
                                    setActiveRowMenu(null);
                                    handleApprove(item._id);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-emerald-600"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {item.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleOpenRejectModal(item._id)}
                                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-rose-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setActiveRowMenu(null);
                                  handleDelete(item._id);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer matching Screenshot 1 */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
              <div>
                Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
              </div>

              <div className="flex items-center space-x-4">
                {/* Items per page selector */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md px-3 py-1.5 text-xs pr-7 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center space-x-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="w-7 h-7 bg-[#1e293b] text-white font-semibold rounded flex items-center justify-center text-xs">
                    {currentPage}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Branding */}
          <div className="py-4 text-center text-xs text-gray-400 dark:text-slate-500">
            Campus Tracker
          </div>

        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Reject Request</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Please provide a reason for rejecting this edit request:</p>
            <textarea
              rows="3"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2.5 text-xs bg-white dark:bg-slate-700 focus:ring-1 focus:ring-red-500 outline-none"
              placeholder="Reason for rejection (e.g. bb)"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Edit Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Create Edit Request</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.studentName}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, studentName: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="Ritisha Tripathi"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={newRequestForm.contact}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, contact: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="9935332556"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Father Name</label>
                  <input
                    type="text"
                    value={newRequestForm.fatherName}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, fatherName: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="Hariom Tripathi"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={newRequestForm.motherName}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, motherName: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="Anamika Tripathi"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Admission Number</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.admissionNumber}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, admissionNumber: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="SM001"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Date of Admission</label>
                  <input
                    type="text"
                    value={newRequestForm.dateOfAdmission}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, dateOfAdmission: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="February 8, 2025"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Course</label>
                  <input
                    type="text"
                    value={newRequestForm.course}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, course: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="IX"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={newRequestForm.section}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, section: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="Section A"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Birth Date</label>
                  <input
                    type="text"
                    value={newRequestForm.birthDate}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, birthDate: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="December 5, 2000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={newRequestForm.bloodGroup}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, bloodGroup: e.target.value })}
                    className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                    placeholder="O+"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-slate-300 mb-1">Attachment File Name (Optional)</label>
                <input
                  type="text"
                  value={newRequestForm.attachmentName}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, attachmentName: e.target.value })}
                  className="w-full border rounded-md p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                  placeholder="IMG-20250711-WA0005.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

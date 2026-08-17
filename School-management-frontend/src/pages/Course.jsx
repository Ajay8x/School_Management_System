import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  ChevronLeft, X, Eye, Copy, ArrowRightCircle, UserCheck, Move, Users,
  Upload, FileText, ArrowUp, ArrowDown, HelpCircle, Check, XCircle, UserPlus, GripVertical
} from 'lucide-react';

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [enrollmentSeats, setEnrollmentSeats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State for Course List
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('sortOrder');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selected Row for Floating Move Up/Down Buttons
  const [selectedRowId, setSelectedRowId] = useState(null);

  // Header Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row Three Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Show Details Modal State
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  // Reorder Modal State (Screenshot 5)
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderList, setReorderList] = useState([]);

  // Add Batch Modal State
  const [batchModalItem, setBatchModalItem] = useState(null);
  const [batchInput, setBatchInput] = useState('');

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null);

  // View mode: 'list' | 'add' | 'edit' | 'duplicate' | 'incharge-list' | 'incharge-assign' | 'enrollment-list' | 'enrollment-add'
  const [viewMode, setViewMode] = useState('list');
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Add Course Incharge Modal State
  const [showAddInchargeModal, setShowAddInchargeModal] = useState(false);
  const [inchargeModalData, setInchargeModalData] = useState({
    course: 'XII',
    employee: 'Anamika Tiwari',
    employeeCode: 'ESM001',
    period: 'November 29, 2025 - Present'
  });

  // Assign Course Incharge Drag-and-Drop state (Screenshot 2)
  const [assignedInchargesMap, setAssignedInchargesMap] = useState({});
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [courseSearchAssign, setCourseSearchAssign] = useState('');
  const [employeeSearchAssign, setEmployeeSearchAssign] = useState('');

  // Add Enrollment Seat Form State (Screenshot 4)
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    course: 'XII',
    enrollmentType: 'Regular',
    maxSeat: 1,
    description: ''
  });

  // Main Form State matching Screenshot 4
  const initialForm = {
    name: '',
    term: '',
    division: 'Senior Secondary',
    code: '',
    shortCode: '',
    paymentAccount: '',
    feeAmount: 100,
    registration: true,
    batchSameSubject: true,
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);

      let fetchedCourses = [];
      let fetchedIncharges = [];
      let fetchedSeats = [];

      try {
        const resCourses = await API.get('/courses');
        fetchedCourses = Array.isArray(resCourses.data) ? resCourses.data : [];
      } catch (err) {
        console.error('Error fetching courses:', err);
      }

      try {
        const resIncharges = await API.get('/courses/incharges/all');
        fetchedIncharges = Array.isArray(resIncharges.data) ? resIncharges.data : [];
      } catch (err) {
        console.error('Error fetching incharges:', err);
      }

      try {
        const resSeats = await API.get('/courses/enrollment-seats/all');
        fetchedSeats = Array.isArray(resSeats.data) ? resSeats.data : [];
      } catch (err) {
        console.error('Error fetching seats:', err);
      }

      const defaultIncharges = [
        {
          _id: 'inc_1',
          course: 'IX (IX)',
          employee: 'Anamika Tiwari',
          employeeCode: 'ESM001',
          period: 'November 29, 2025 - Present',
          createdAt: new Date('2025-11-29T12:28:00')
        },
        {
          _id: 'inc_2',
          course: 'LKG (LKG)',
          employee: 'Attendance Incharge',
          employeeCode: 'ESM004',
          period: 'November 4, 2025 to November 14, 2026',
          createdAt: new Date('2025-11-04T11:25:00')
        },
        {
          _id: 'inc_3',
          course: 'XII (XII)',
          employee: 'Kalpana Comar',
          employeeCode: 'ESM100',
          period: 'November 4, 2025 to December 10, 2025',
          createdAt: new Date('2025-11-04T11:18:00')
        },
        {
          _id: 'inc_4',
          course: 'XII',
          employee: 'Kalpana Comar',
          employeeCode: 'ESM100',
          period: 'November 4, 2025 to November 4, 2026',
          createdAt: new Date('2025-11-04T11:24:00')
        },
        {
          _id: 'inc_5',
          course: 'XII',
          employee: 'Shivam Mishra',
          employeeCode: 'ESM005',
          period: 'April 1, 2025 to April 1, 2026',
          createdAt: new Date('2025-11-04T11:40:00')
        },
        {
          _id: 'inc_6',
          course: 'LKG (LKG)',
          employee: 'Kalpana Comar',
          employeeCode: 'ESM100',
          period: 'February 28, 2025 to March 29, 2025',
          createdAt: new Date('2025-02-28T00:16:00')
        },
        {
          _id: 'inc_7',
          course: 'Nursery (NUR)',
          employee: 'Kalpana Comar',
          employeeCode: 'ESM100',
          period: 'February 1, 2025 to March 31, 2026',
          createdAt: new Date('2025-02-08T17:33:00')
        }
      ];

      const defaultEnrollmentSeats = [
        {
          _id: 'seat_1',
          course: 'XII',
          enrollmentType: 'Regular',
          usedSeat: 0,
          maxSeat: 1,
          createdAt: new Date('2025-11-04T11:22:00')
        },
        {
          _id: 'seat_2',
          course: 'XII',
          enrollmentType: 'Private',
          usedSeat: 0,
          maxSeat: 0,
          createdAt: new Date('2025-11-04T11:22:00')
        }
      ];

      setCourses(fetchedCourses);
      setIncharges(fetchedIncharges.length > 0 ? fetchedIncharges : defaultIncharges);
      setEnrollmentSeats(fetchedSeats.length > 0 ? fetchedSeats : defaultEnrollmentSeats);

      // Initialize assigned incharges map for drag & drop
      const initialMap = {};
      fetchedCourses.forEach(c => {
        if (c.incharge && c.incharge !== '-') {
          initialMap[c.name] = {
            employee: c.incharge,
            period: c.inchargeDates || 'November 4, 2025 - November 14, 2026',
            employeeCode: 'ESM001'
          };
        }
      });
      setAssignedInchargesMap(initialMap);

      setError('');
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Failed to load academic courses data');
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
    setEditingCourse(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (courseItem) => {
    setOpenRowMenuId(null);
    if (selectedCourseModal) setSelectedCourseModal(null);
    setEditingCourse(courseItem);
    setFormData({
      name: courseItem.name || '',
      term: courseItem.term || '',
      division: courseItem.division || 'Senior Secondary',
      code: courseItem.code || '',
      shortCode: courseItem.shortCode || courseItem.code || '',
      paymentAccount: courseItem.paymentAccount || '',
      feeAmount: courseItem.feeAmount || 100,
      registration: courseItem.registration !== false,
      batchSameSubject: courseItem.batchSameSubject !== false,
      description: courseItem.description || ''
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (courseItem) => {
    setOpenRowMenuId(null);
    if (selectedCourseModal) setSelectedCourseModal(null);
    setEditingCourse(null);
    setFormData({
      name: `${courseItem.name} (Copy)`,
      term: courseItem.term || '',
      division: courseItem.division || 'Senior Secondary',
      code: courseItem.code ? `${courseItem.code}-COPY` : '',
      shortCode: courseItem.shortCode ? `${courseItem.shortCode}-COPY` : '',
      paymentAccount: courseItem.paymentAccount || '',
      feeAmount: courseItem.feeAmount || 100,
      registration: courseItem.registration !== false,
      batchSameSubject: courseItem.batchSameSubject !== false,
      description: courseItem.description || ''
    });
    setViewMode('duplicate');
  };

  const handleResetForm = () => {
    if (editingCourse) {
      handleOpenEdit(editingCourse);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Course Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingCourse) {
        await API.put(`/courses/${editingCourse._id}`, formData);
        setSuccessMsg('Academic course updated successfully!');
      } else {
        await API.post('/courses', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated course saved successfully!' : 'Academic course added successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save course';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Row Action: Show Details
  const handleActionShow = (courseItem) => {
    setOpenRowMenuId(null);
    setSelectedCourseModal(courseItem);
  };

  // Row Action: Add Batches Modal Trigger
  const handleOpenAddBatchesModal = (courseItem) => {
    setOpenRowMenuId(null);
    setBatchModalItem(courseItem);
    setBatchInput('');
  };

  const handleSaveAddBatch = async () => {
    if (!batchModalItem || !batchInput.trim()) return;
    try {
      await API.post(`/courses/${batchModalItem._id}/batches`, {
        batchName: batchInput.trim()
      });
      await fetchData();
      setBatchModalItem(null);
      setSuccessMsg(`Added batch "${batchInput}" to course "${batchModalItem.name}"!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Add batch error:', err);
      setError('Failed to add batch');
    }
  };

  // Row Action: Delete Course
  const handleActionDeleteTrigger = (id, name) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/courses/${id}`);
          setCourses(courses.filter(c => c._id !== id));
          setSuccessMsg(`Course "${name}" deleted successfully!`);
          if (selectedCourseModal && selectedCourseModal._id === id) {
            setSelectedCourseModal(null);
          }
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete course');
        }
      }
    });
  };

  // Reorder Modal Actions (Screenshot 5)
  const handleOpenReorderModal = () => {
    setOpenRowMenuId(null);
    setReorderList([...courses].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    setIsReorderModalOpen(true);
  };

  const moveReorderItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= reorderList.length) return;
    const newList = [...reorderList];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setReorderList(newList);
  };

  const handleSaveReorder = async () => {
    try {
      const orderedIds = reorderList.map(item => item._id);
      await API.post('/courses/reorder', { orderedIds });
      await fetchData();
      setIsReorderModalOpen(false);
      setSuccessMsg('Course order updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Reorder save error:', err);
      setError('Failed to save course order');
    }
  };

  // Inline Move Buttons for Selected Row
  const handleMoveInline = async (direction) => {
    if (!selectedRowId) return;
    const currentIndex = courses.findIndex(c => c._id === selectedRowId);
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= courses.length) return;

    const newList = [...courses];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[targetIndex];
    newList[targetIndex] = temp;

    setCourses(newList);
    try {
      const orderedIds = newList.map(item => item._id);
      await API.post('/courses/reorder', { orderedIds });
      await fetchData();
    } catch (err) {
      console.error('Inline reorder error:', err);
    }
  };

  // Save Add Incharge Modal (Screenshot 1)
  const handleSaveAddIncharge = async () => {
    try {
      await API.post('/courses/incharges/add', inchargeModalData);
      await fetchData();
      setShowAddInchargeModal(false);
      setSuccessMsg(`Added course incharge "${inchargeModalData.employee}" for "${inchargeModalData.course}"!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Save incharge error:', err);
      setError('Failed to save course incharge');
    }
  };

  // Drag and Drop Assign Incharge Handlers (Screenshot 2)
  const sampleEmployees = [
    { name: 'Anamika Tiwari', code: 'ESM001', department: 'Teaching Department - PRT' },
    { name: 'Demo Employee', code: 'ESM003', department: 'Teaching Department - Administrator' },
    { name: 'Kalpana Comar', code: 'ESM100', department: 'Teaching Department - Senior Teacher' },
    { name: 'Shivam Mishra', code: 'ESM005', department: 'Teaching Department - PGT' }
  ];

  const handleDropOnCourse = (courseName) => {
    if (!draggedEmployee) return;
    setAssignedInchargesMap(prev => ({
      ...prev,
      [courseName]: {
        employee: draggedEmployee.name,
        employeeCode: draggedEmployee.code,
        period: 'November 4, 2025 - November 14, 2026',
        isNew: true
      }
    }));
    setDraggedEmployee(null);
  };

  const handleSaveAssignedIncharges = async () => {
    try {
      for (const [courseName, info] of Object.entries(assignedInchargesMap)) {
        if (info && info.employee) {
          await API.post('/courses/incharges/add', {
            course: courseName,
            employee: info.employee,
            employeeCode: info.employeeCode || 'ESM001',
            period: info.period || 'November 4, 2025 to November 14, 2026'
          });
        }
      }
      await fetchData();
      setViewMode('incharge-list');
      setSuccessMsg('Course incharges assigned successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Save assigned incharges error:', err);
      setError('Failed to save assigned incharges');
    }
  };

  // Add Enrollment Seat Submit (Screenshot 4)
  const handleSubmitEnrollmentSeat = async (e) => {
    e.preventDefault();
    if (!enrollmentFormData.course) {
      setError('Course is required');
      return;
    }
    try {
      await API.post('/courses/enrollment-seats/add', enrollmentFormData);
      await fetchData();
      setViewMode('enrollment-list');
      setSuccessMsg('Enrollment seat added successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Add enrollment seat error:', err);
      setError('Failed to add enrollment seat');
    }
  };

  // Header Options Actions
  const handleHeaderImport = () => {
    setIsHeaderMenuOpen(false);
    alert('Import functionality initialized.');
  };

  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleGeneratePDF = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    try {
      let exportData = [];
      let filename = 'Export';
      if (viewMode === 'incharge-list') {
        exportData = incharges.map((item, idx) => ({
          '#': idx + 1,
          'Course': item.course,
          'Employee': item.employee,
          'Employee Code': item.employeeCode || '-',
          'Period': item.period,
          'Created At': new Date(item.createdAt).toLocaleString()
        }));
        filename = 'Campus_Pilot_Course_Incharges';
      } else if (viewMode === 'enrollment-list') {
        exportData = enrollmentSeats.map((item, idx) => ({
          '#': idx + 1,
          'Course': item.course,
          'Enrollment Type': item.enrollmentType,
          'Seat': `${item.usedSeat}/${item.maxSeat}`,
          'Created At': new Date(item.createdAt).toLocaleString()
        }));
        filename = 'Campus_Pilot_Enrollment_Seats';
      } else {
        exportData = filteredCourses.map((c, index) => ({
          '#': index + 1,
          'Name': c.name || '',
          'Division': c.division || '',
          'Code': c.code || '',
          'Incharge': c.incharge || '-',
          'Created At': new Date(c.createdAt || Date.now()).toLocaleString()
        }));
        filename = 'Campus_Pilot_Courses';
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported to Excel successfully!');
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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort for Course List
  const filteredCourses = courses
    .filter(c => {
      const matchesSearch = 
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.division && c.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.incharge && c.incharge.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortField === 'sortOrder') {
        const orderA = a.sortOrder || 0;
        const orderB = b.sortOrder || 0;
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (sortField === 'createdAt') {
        valA = new Date(a[sortField] || 0).getTime();
        valB = new Date(b[sortField] || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalResults = filteredCourses.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-table, #printable-table * {
            visibility: visible;
          }
          #printable-table {
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

      <div className="max-w-[1400px] w-full mx-auto space-y-6">
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">Course</button>
              
              {viewMode === 'incharge-list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Course Incharge</span>
                </>
              )}

              {viewMode === 'incharge-assign' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <button onClick={() => setViewMode('incharge-list')} className="hover:text-teal-600 transition font-medium">Course Incharge</button>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Assign Course Incharge</span>
                </>
              )}

              {viewMode === 'enrollment-list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Enrollment Seat</span>
                </>
              )}

              {viewMode === 'enrollment-add' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <button onClick={() => setViewMode('enrollment-list')} className="hover:text-teal-600 transition font-medium">Enrollment Seat</button>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Add Enrollment Seat</span>
                </>
              )}

              {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Course' : viewMode === 'edit' ? 'Edit Course' : 'Duplicate Course'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' && 'Course'}
              {viewMode === 'incharge-list' && 'Course Incharge'}
              {viewMode === 'incharge-assign' && 'Course Incharge'}
              {viewMode === 'enrollment-list' && 'Enrollment Seat'}
              {viewMode === 'enrollment-add' && 'Add Enrollment Seat'}
              {viewMode === 'add' && 'Add Course'}
              {viewMode === 'edit' && 'Edit Course'}
              {viewMode === 'duplicate' && 'Duplicate Course'}
            </h1>
          </div>

          {/* Top Right Header Toolbar matching Screenshots */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            
            {/* LIST VIEW TOOLBAR */}
            {viewMode === 'list' && (
              <>
                <button 
                  onClick={handleOpenReorderModal}
                  title="Reorder Course"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Move className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setViewMode('incharge-list')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Incharge
                </button>

                <button 
                  onClick={() => setViewMode('enrollment-list')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Enrollment Seat
                </button>

                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Add Course
                </button>

                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isHeaderMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="divide-y divide-gray-100 dark:divide-slate-700/80">
                        <button onClick={handleHeaderImport} className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3">
                          <Upload className="w-4 h-4 text-slate-500" /><span>Import</span>
                        </button>
                        <button onClick={handleRefreshAction} className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3">
                          <RotateCw className="w-4 h-4 text-slate-500" /><span>Refresh</span>
                        </button>
                        <button onClick={handlePrintAction} className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3">
                          <Printer className="w-4 h-4 text-slate-500" /><span>Print</span>
                        </button>
                        <button onClick={handleGeneratePDF} className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-500" /><span>Generate PDF</span>
                        </button>
                        <button onClick={handleExportExcelAction} className="w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-3">
                          <FileSpreadsheet className="w-4 h-4 text-slate-500" /><span>Export to Excel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* INCHARGE LIST TOOLBAR (Screenshot 1) */}
            {viewMode === 'incharge-list' && (
              <>
                <button 
                  onClick={() => setViewMode('incharge-assign')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Assign Course Incharge
                </button>

                <button 
                  onClick={() => setShowAddInchargeModal(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Add Course Incharge
                </button>

                <button title="Filter" className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
                  <Filter className="w-4 h-4" />
                </button>

                <button title="More Options" onClick={handleExportExcelAction} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </>
            )}

            {/* ENROLLMENT SEAT LIST TOOLBAR (Screenshot 3) */}
            {viewMode === 'enrollment-list' && (
              <>
                <button 
                  onClick={() => setViewMode('enrollment-add')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Add Enrollment Seat
                </button>

                <button title="Filter" className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
                  <Filter className="w-4 h-4" />
                </button>

                <button title="More Options" onClick={handleExportExcelAction} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </>
            )}

            {/* ENROLLMENT SEAT ADD TOOLBAR (Screenshot 4) */}
            {viewMode === 'enrollment-add' && (
              <button 
                onClick={() => setViewMode('enrollment-list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Enrollment Seat
              </button>
            )}

            {/* COURSE ADD / EDIT FORM TOOLBAR */}
            {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
              <button 
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Course
              </button>
            )}

          </div>
        </div>

        {/* Notifications */}
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

        {/* ========================================================
            VIEW MODE: COURSE LIST (Screenshot 1 of first prompt)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8 relative" id="printable-table">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th onClick={() => toggleSort('name')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition">
                      <div className="flex items-center gap-1"><span>NAME</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-5 py-3.5">DIVISION</th>
                    <th onClick={() => toggleSort('code')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition">
                      <div className="flex items-center gap-1"><span>CODE</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-5 py-3.5">COURSE INCHARGE</th>
                    <th className="px-5 py-3.5">BATCHES</th>
                    <th className="px-5 py-3.5">SUBJECTS</th>
                    <th className="px-5 py-3.5 text-center">REGISTRATION</th>
                    <th onClick={() => toggleSort('createdAt')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition whitespace-nowrap">
                      <div className="flex items-center gap-1"><span>CREATED AT</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {paginatedCourses.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No courses found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Course</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedCourses.map((courseItem) => (
                      <tr key={courseItem._id} onClick={() => setSelectedRowId(courseItem._id)} className={`hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition ${selectedRowId === courseItem._id ? 'bg-slate-50 dark:bg-slate-750' : ''}`}>
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100 align-top">
                          <div>{courseItem.name}</div>
                          {courseItem.feeAmount ? <div className="text-xs text-gray-400 dark:text-slate-500 font-normal mt-0.5">₹{courseItem.feeAmount}</div> : null}
                        </td>
                        <td className="px-5 py-4 text-xs align-top">
                          <div className="text-gray-800 dark:text-slate-200 font-medium">{courseItem.division || 'Senior Secondary'}</div>
                          <div className="text-gray-400 dark:text-slate-500 mt-0.5">{courseItem.divisionSub || 'Senior Secondary'}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono align-top">
                          <div className="text-gray-800 dark:text-slate-200">{courseItem.code || '-'}</div>
                          <div className="text-gray-400 dark:text-slate-500 mt-0.5">{courseItem.shortCode || courseItem.code || '-'}</div>
                        </td>
                        <td className="px-5 py-4 text-xs align-top max-w-[220px]">
                          {courseItem.incharge && courseItem.incharge !== '-' ? (
                            <div>
                              <span className="font-bold text-gray-800 dark:text-slate-200">{courseItem.incharge}</span>
                              {courseItem.inchargeDates && <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1.5">{courseItem.inchargeDates}</span>}
                            </div>
                          ) : <span className="text-gray-400 dark:text-slate-500">-</span>}
                        </td>
                        <td className="px-5 py-4 text-xs align-top">
                          {courseItem.batches && courseItem.batches.length > 0 ? (
                            <div className="space-y-0.5">
                              {courseItem.batches.map((b, i) => <div key={i} className="text-gray-700 dark:text-slate-300 font-medium">{b}</div>)}
                            </div>
                          ) : <span className="text-gray-400 dark:text-slate-500">-</span>}
                        </td>
                        <td className="px-5 py-4 text-xs align-top max-w-[180px]">
                          {courseItem.subjects && courseItem.subjects.length > 0 ? (
                            <div className="space-y-0.5">
                              {courseItem.subjects.map((sub, i) => <div key={i} className="text-gray-700 dark:text-slate-300 font-medium tracking-tight">{sub}</div>)}
                            </div>
                          ) : <span className="text-gray-400 dark:text-slate-500">-</span>}
                        </td>
                        <td className="px-5 py-4 text-center align-top">
                          {courseItem.registration !== false ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60"><Check className="w-3.5 h-3.5" /></div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60"><XCircle className="w-3.5 h-3.5" /></div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap align-top">{formatCreatedAt(courseItem.createdAt)}</td>
                        <td className="px-4 py-4 text-right no-print align-top relative">
                          <div className="relative inline-block text-left row-menu-container">
                            <button onClick={() => setOpenRowMenuId(openRowMenuId === courseItem._id ? null : courseItem._id)} className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 transition ${openRowMenuId === courseItem._id ? 'bg-slate-100 text-teal-600 ring-2 ring-teal-500/20' : ''}`}>
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openRowMenuId === courseItem._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  <button onClick={() => handleActionShow(courseItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5"><ArrowRightCircle className="w-4 h-4 text-slate-500" /><span>Show</span></button>
                                  <button onClick={() => handleOpenAddBatchesModal(courseItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5"><Plus className="w-4 h-4 text-slate-500" /><span>Add Batches</span></button>
                                  <button onClick={handleOpenReorderModal} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5"><Move className="w-4 h-4 text-slate-500" /><span>Reorder</span></button>
                                  <button onClick={() => handleOpenEdit(courseItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5"><Edit className="w-4 h-4 text-slate-500" /><span>Edit</span></button>
                                  <button onClick={() => handleOpenDuplicate(courseItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5"><Copy className="w-4 h-4 text-slate-500" /><span>Duplicate</span></button>
                                  <button onClick={() => handleActionDeleteTrigger(courseItem._id, courseItem.name)} className="w-full px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 border-t border-gray-100 mt-1 pt-1.5"><Trash2 className="w-4 h-4 text-rose-500" /><span>Delete</span></button>
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

            <div className="flex justify-center my-4 no-print">
              <div className="flex items-center space-x-2 bg-[#1e293b] text-white p-1.5 rounded-full shadow-lg">
                <button onClick={() => handleMoveInline(-1)} disabled={!selectedRowId} className="w-8 h-8 rounded-full bg-[#0f172a] hover:bg-[#334155] flex items-center justify-center text-white disabled:opacity-40 transition"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => handleMoveInline(1)} disabled={!selectedRowId} className="w-8 h-8 rounded-full bg-[#0f172a] hover:bg-[#334155] flex items-center justify-center text-white disabled:opacity-40 transition"><ArrowDown className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: COURSE INCHARGE TABLE VIEW (Screenshot 1)
           ======================================================== */}
        {viewMode === 'incharge-list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8 relative" id="printable-table">
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-5 py-3.5">COURSE</th>
                    <th className="px-5 py-3.5">EMPLOYEE</th>
                    <th className="px-5 py-3.5">
                      <div className="flex items-center gap-1"><span>PERIOD</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-5 py-3.5">
                      <div className="flex items-center gap-1"><span>CREATED AT</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {incharges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No course incharges assigned yet. Click <button onClick={() => setViewMode('incharge-assign')} className="text-teal-600 font-bold underline">Assign Course Incharge</button> to assign.
                      </td>
                    </tr>
                  ) : (
                    incharges.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100 text-xs">{item.course}</td>
                        <td className="px-5 py-4 text-xs">
                          <div className="font-semibold text-gray-800 dark:text-slate-200">{item.employee}</div>
                          <div className="text-gray-400 dark:text-slate-500 mt-0.5 text-[11px]">{item.employeeCode || 'ESM001'}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-700 dark:text-slate-300">{item.period}</td>
                        <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">{formatCreatedAt(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right no-print">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400 no-print">
              <div>Showing 1 to {incharges.length} of {incharges.length} results</div>
              <div className="flex items-center space-x-3">
                <select className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none">
                  <option>25 per page</option>
                </select>
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 border border-gray-200 rounded-lg opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-3 py-1 bg-slate-900 text-white font-bold rounded-lg">1</span>
                  <button className="p-1.5 border border-gray-200 rounded-lg opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ASSIGN COURSE INCHARGE DRAG & DROP VIEW (Screenshot 2)
           ======================================================== */}
        {viewMode === 'incharge-assign' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 no-print">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Course Incharge</h2>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-gray-400 dark:text-slate-400 font-medium">Aug 17 2026</span>
                <button onClick={handleSaveAssignedIncharges} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xs transition">
                  Assign
                </button>
                <button onClick={() => setAssignedInchargesMap({})} className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-xs transition">
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Panel: Course Drop Zones */}
              <div className="lg:col-span-3 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Course</h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Drag and drop to assign incharges</p>
                </div>

                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search Course"
                    value={courseSearchAssign}
                    onChange={(e) => setCourseSearchAssign(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {['Nursery', 'LKG', 'UKG', 'Lkg', 'I (I)', 'II', 'XII'].filter(c => c.toLowerCase().includes(courseSearchAssign.toLowerCase())).map((courseName) => {
                    const assigned = assignedInchargesMap[courseName];
                    return (
                      <div key={courseName} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-3">
                        <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300">
                          {courseName}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Current Course Incharge box */}
                          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                              {assigned?.employee ? assigned.employee.charAt(0) : 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[11px] font-bold text-gray-500">Current Course Incharge</span>
                              </div>
                              <p className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate">
                                {assigned?.employee || 'Unknown (N/A)'}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {assigned?.period || 'November 4, 2025 - November 14, 2026'}
                              </p>
                            </div>
                          </div>

                          {/* Drop Zone */}
                          <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropOnCourse(courseName)}
                            onClick={() => {
                              if (draggedEmployee) handleDropOnCourse(courseName);
                            }}
                            className={`p-4 border-2 border-dashed ${draggedEmployee ? 'border-teal-500 bg-teal-50/50 cursor-pointer' : 'border-gray-200 dark:border-slate-700'} rounded-xl flex flex-col items-center justify-center text-center transition`}
                          >
                            <Plus className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Drop here to assign</span>
                            <span className="text-[10px] text-gray-400">Drag from employees panel</span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Employee List to Drag */}
              <div className="lg:col-span-1 border-l border-gray-100 dark:border-slate-700 pl-0 lg:pl-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">Employee</h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Drag to assign as incharge</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search Employee"
                    value={employeeSearchAssign}
                    onChange={(e) => setEmployeeSearchAssign(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-3">
                  {sampleEmployees.filter(emp => emp.name.toLowerCase().includes(employeeSearchAssign.toLowerCase())).map((emp, index) => (
                    <div 
                      key={index}
                      draggable
                      onDragStart={() => setDraggedEmployee(emp)}
                      onClick={() => setDraggedEmployee(emp)}
                      className={`p-3 bg-white dark:bg-slate-900 border ${draggedEmployee?.name === emp.name ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700'} rounded-xl cursor-grab active:cursor-grabbing hover:border-teal-400 transition shadow-2xs flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{emp.name}</p>
                          <p className="text-[10px] text-gray-400">({emp.code})</p>
                          <p className="text-[10px] text-gray-500 font-medium">{emp.department}</p>
                        </div>
                      </div>
                      <GripVertical className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 space-y-1 text-[11px] text-gray-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Current Course Incharge</span></div>
                  <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>New Course Incharge</span></div>
                  <div className="mt-2 font-bold text-gray-700 dark:text-slate-300">2 Course Incharge Count</div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            VIEW MODE: ENROLLMENT SEAT TABLE VIEW (Screenshot 3)
           ======================================================== */}
        {viewMode === 'enrollment-list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8 relative" id="printable-table">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-5 py-3.5">COURSE</th>
                    <th className="px-5 py-3.5">ENROLLMENT TYPE</th>
                    <th className="px-5 py-3.5">SEAT</th>
                    <th className="px-5 py-3.5">
                      <div className="flex items-center gap-1"><span>CREATED AT</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {enrollmentSeats.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No enrollment seats configured. Click <button onClick={() => setViewMode('enrollment-add')} className="text-teal-600 font-bold underline">Add Enrollment Seat</button> to add.
                      </td>
                    </tr>
                  ) : (
                    enrollmentSeats.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100 text-xs">{item.course}</td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-800 dark:text-slate-200">{item.enrollmentType}</td>
                        <td className="px-5 py-4 text-xs font-mono font-semibold text-gray-700 dark:text-slate-300">{item.usedSeat}/{item.maxSeat}</td>
                        <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">{formatCreatedAt(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right no-print">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400 no-print">
              <div>Showing 1 to {enrollmentSeats.length} of {enrollmentSeats.length} results</div>
              <div className="flex items-center space-x-3">
                <select className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none">
                  <option>25 per page</option>
                </select>
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 border border-gray-200 rounded-lg opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-3 py-1 bg-slate-900 text-white font-bold rounded-lg">1</span>
                  <button className="p-1.5 border border-gray-200 rounded-lg opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD ENROLLMENT SEAT FORM (Screenshot 4)
           ======================================================== */}
        {viewMode === 'enrollment-add' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmitEnrollmentSeat} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select 
                    value={enrollmentFormData.course}
                    onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition text-gray-800 dark:text-slate-200"
                  >
                    {courses.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Enrollment Type
                  </label>
                  <select 
                    value={enrollmentFormData.enrollmentType}
                    onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, enrollmentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition text-gray-800 dark:text-slate-200"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Private">Private</option>
                    <option value="Distance">Distance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Max Seat
                  </label>
                  <input 
                    type="number"
                    placeholder="Max Seat"
                    value={enrollmentFormData.maxSeat}
                    onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, maxSeat: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Description"
                  value={enrollmentFormData.description}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition resize-y"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setEnrollmentFormData({ course: 'XII', enrollmentType: 'Regular', maxSeat: 1, description: '' })}
                    className="px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
                  >
                    Reset
                  </button>
                  <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300" />
                    <span>Keep Adding</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('enrollment-list')}
                    className="px-6 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-semibold rounded-xl shadow-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT / DUPLICATE FORM (Screenshot 4 of first prompt)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Term
                  </label>
                  <input 
                    type="text"
                    placeholder="Term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Division
                  </label>
                  <select 
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition text-gray-800 dark:text-slate-200"
                  >
                    <option value="Pre Primary">Pre Primary</option>
                    <option value="Primary">Primary</option>
                    <option value="Middle">Middle</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Short Code
                  </label>
                  <input 
                    type="text"
                    placeholder="Short Code"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      Payment Gateway Account
                    </label>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer" title="Payment Gateway Info">
                      ?
                    </div>
                  </div>
                  <input 
                    type="text"
                    placeholder="Payment Gateway Account"
                    value={formData.paymentAccount}
                    onChange={(e) => setFormData({ ...formData, paymentAccount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl relative pt-6">
                <span className="absolute -top-3 left-4 bg-white dark:bg-slate-800 px-3 py-0.5 text-xs font-semibold text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-md">
                  Registration
                </span>
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span>Enable Registration</span>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="block text-xs font-bold text-gray-800 dark:text-slate-200">
                    Batch With Same Subject
                  </span>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    All the batches of this course have same subjects
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.batchSameSubject}
                    onChange={(e) => setFormData({ ...formData, batchSameSubject: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition resize-y"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
                  >
                    Reset
                  </button>
                  {viewMode !== 'edit' && (
                    <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
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
          ADD COURSE INCHARGE MODAL DIALOG
         ======================================================== */}
      {showAddInchargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Course Incharge</h3>
              <button onClick={() => setShowAddInchargeModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Course</label>
                <select 
                  value={inchargeModalData.course}
                  onChange={(e) => setInchargeModalData({ ...inchargeModalData, course: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Employee Name</label>
                <input 
                  type="text"
                  value={inchargeModalData.employee}
                  onChange={(e) => setInchargeModalData({ ...inchargeModalData, employee: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Period / Date Range</label>
                <input 
                  type="text"
                  value={inchargeModalData.period}
                  onChange={(e) => setInchargeModalData({ ...inchargeModalData, period: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setShowAddInchargeModal(false)} className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleSaveAddIncharge} className="px-5 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"><Save className="w-4 h-4" />Save Incharge</button>
            </div>

          </div>
        </div>
      )}

      {/* REORDER COURSE MODAL DIALOG */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-4 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Reorder Course</h3>
              <button onClick={() => setIsReorderModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {reorderList.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xs group hover:border-teal-500 transition">
                  <div className="flex items-center space-x-3"><Move className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition cursor-grab" /><span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{item.name}</span></div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => moveReorderItem(index, -1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-gray-100 transition"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveReorderItem(index, 1)} disabled={index === reorderList.length - 1} className="p-1 text-gray-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-gray-100 transition"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setIsReorderModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleSaveReorder} className="px-5 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"><Save className="w-4 h-4" />Save Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BATCH MODAL DIALOG */}
      {batchModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600"><Plus className="w-5 h-5" /></div>
                <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Batch / Section</h3><p className="text-xs text-gray-500">{batchModalItem.name}</p></div>
              </div>
              <button onClick={() => setBatchModalItem(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Batch / Section Name</label>
                <input type="text" placeholder="e.g. Section D" value={batchInput} onChange={(e) => setBatchInput(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none" />
              </div>
            </div>
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setBatchModalItem(null)} className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleSaveAddBatch} className="px-5 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"><Save className="w-4 h-4" />Add Batch</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL DIALOG */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200 text-center space-y-6 animate-in zoom-in-95 duration-150">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-300 flex items-center justify-center text-amber-500 text-4xl font-light">!</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{confirmModal.title || 'Are you sure?'}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed px-4">{confirmModal.message}</p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={confirmModal.onConfirm} className="px-6 py-2.5 bg-[#3b82f6] text-white text-sm font-semibold rounded-xl transition">OK</button>
              <button onClick={() => setConfirmModal(null)} className="px-6 py-2.5 bg-[#ef4444] text-white text-sm font-semibold rounded-xl transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SHOW DETAILS MODAL DIALOG */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600"><Eye className="w-5 h-5" /></div>
                <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Details</h3><p className="text-xs text-gray-500">{selectedCourseModal.name}</p></div>
              </div>
              <button onClick={() => setSelectedCourseModal(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Course Name</span><p className="font-bold text-gray-900 dark:text-slate-100">{selectedCourseModal.name}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Division</span><p className="font-semibold text-gray-900 dark:text-slate-100">{selectedCourseModal.division || 'Senior Secondary'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Code</span><p className="font-mono font-semibold text-gray-900 dark:text-slate-100">{selectedCourseModal.code || '-'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Course Incharge</span><p className="font-semibold text-gray-900 dark:text-slate-100">{selectedCourseModal.incharge || '-'}</p></div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Batches</span><p className="font-medium text-gray-900 dark:text-slate-100">{selectedCourseModal.batches?.join(', ') || '-'}</p></div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1"><span className="text-gray-400 font-medium">Subjects</span><p className="font-medium text-gray-900 dark:text-slate-100">{selectedCourseModal.subjects?.join(', ') || '-'}</p></div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setSelectedCourseModal(null)} className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">Close</button>
              <button onClick={() => handleOpenEdit(selectedCourseModal)} className="px-5 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"><Edit className="w-4 h-4" />Edit Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding Text matching User Request */}
      <div className="mt-8 text-center text-xs font-medium text-gray-400 dark:text-slate-500 no-print">
        Campus Pilot
      </div>

    </div>
  );
}

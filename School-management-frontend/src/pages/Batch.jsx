import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, Save, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, ChevronRight, Home, CheckCircle2, AlertCircle,
  ChevronLeft, X, Eye, Copy, Move, Upload, FileText, ArrowUp, ArrowDown,
  LayoutGrid, GripVertical, Check, XCircle
} from 'lucide-react';

export default function Batch() {
  const [batches, setBatches] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [sortField, setSortField] = useState('sortOrder');
  const [sortOrder, setSortOrder] = useState('asc');

  // Header Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row Three Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Selected Batch for Show / Detail View (Screenshot 3)
  const [selectedBatchShow, setSelectedBatchShow] = useState(null);

  // Reorder Subjects Modal State (Screenshot 2: Reorder Subject)
  const [reorderSubjectBatch, setReorderSubjectBatch] = useState(null);
  const [subjectsToReorder, setSubjectsToReorder] = useState([]);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null);

  // View mode: 'list' | 'show' | 'add' | 'edit' | 'duplicate' | 'incharge-list' | 'incharge-assign'
  const [viewMode, setViewMode] = useState('list');
  const [editingBatch, setEditingBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Add Batch Incharge Modal State
  const [showAddInchargeModal, setShowAddInchargeModal] = useState(false);
  const [inchargeModalData, setInchargeModalData] = useState({
    batch: 'Section B',
    employee: 'Anamika Tiwari',
    employeeCode: 'ESM001',
    period: 'November 29, 2025 - Present'
  });

  // Assign Batch Incharge Drag-and-Drop state
  const [assignedInchargesMap, setAssignedInchargesMap] = useState({});
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [batchSearchAssign, setBatchSearchAssign] = useState('');
  const [employeeSearchAssign, setEmployeeSearchAssign] = useState('');

  // Main Form State matching Screenshot 4
  const initialForm = {
    name: '',
    course: 'Nursery (NUR)',
    code: '',
    shortCode: '',
    maxStrength: 45,
    rollPrefix: '',
    paymentAccount: '',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const defaultSampleSubjects = [
    { name: 'COMPUTER', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'English', code: 'ENG', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'ARTS and CRAFTS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'HINDI', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'RHYMES and STORIES', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'MUSIC', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'EVS', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'Conclusion', code: '', isElective: false, hasGrading: false, hasNoExam: false },
    { name: 'Art', code: '', isElective: false, hasGrading: true, hasNoExam: false }
  ];

  const defaultBatchesFallback = [
    {
      _id: 'b1',
      name: 'Section B',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 0,
      incharge: '-',
      subjects: defaultSampleSubjects,
      createdAt: new Date('2025-02-10T14:28:00')
    },
    {
      _id: 'b2',
      name: 'Section A',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 22,
      incharge: '-',
      subjects: defaultSampleSubjects,
      createdAt: new Date('2025-02-08T00:21:00')
    },
    {
      _id: 'b3',
      name: 'Section C',
      course: 'Nursery (NUR)',
      code: '',
      shortCode: '',
      maxStrength: 45,
      currentStrength: 0,
      incharge: '-',
      subjects: defaultSampleSubjects,
      createdAt: new Date('2025-02-10T14:28:00')
    }
  ];

  const defaultInchargesFallback = [
    {
      _id: 'bi_1',
      batch: 'Section B',
      employee: 'Anamika Tiwari',
      employeeCode: 'ESM001',
      period: 'November 29, 2025 - Present',
      createdAt: new Date('2025-11-29T12:28:00')
    },
    {
      _id: 'bi_2',
      batch: 'Section A',
      employee: 'Kalpana Comar',
      employeeCode: 'ESM100',
      period: 'February 1, 2025 - March 31, 2026',
      createdAt: new Date('2025-02-01T11:25:00')
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);

      let fetchedBatches = [];
      let fetchedIncharges = [];
      let fetchedCourses = [];

      try {
        const resBatches = await API.get('/batches');
        fetchedBatches = Array.isArray(resBatches.data) ? resBatches.data : [];
      } catch (err) {
        console.error('Error fetching batches:', err);
      }

      try {
        const resIncharges = await API.get('/batches/incharges/all');
        fetchedIncharges = Array.isArray(resIncharges.data) ? resIncharges.data : [];
      } catch (err) {
        console.error('Error fetching batch incharges:', err);
      }

      try {
        const resCourses = await API.get('/courses');
        fetchedCourses = Array.isArray(resCourses.data) ? resCourses.data : [];
      } catch (err) {
        console.error('Error fetching courses:', err);
      }

      const finalBatches = fetchedBatches.length > 0 ? fetchedBatches : defaultBatchesFallback;
      const finalIncharges = fetchedIncharges.length > 0 ? fetchedIncharges : defaultInchargesFallback;

      setBatches(finalBatches);
      setIncharges(finalIncharges);
      setCoursesList(fetchedCourses);

      const initialMap = {};
      finalBatches.forEach(b => {
        if (b.incharge && b.incharge !== '-') {
          initialMap[b.name] = {
            employee: b.incharge,
            period: b.inchargeDates || 'November 4, 2025 - November 14, 2026',
            employeeCode: 'ESM001'
          };
        }
      });
      setAssignedInchargesMap(initialMap);

      setError('');
    } catch (err) {
      console.error('Error fetching batch data:', err);
      setError('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

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
    setEditingBatch(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (batchItem) => {
    setOpenRowMenuId(null);
    if (selectedBatchShow) setSelectedBatchShow(null);
    setEditingBatch(batchItem);
    setFormData({
      name: batchItem.name || '',
      course: batchItem.course || 'Nursery (NUR)',
      code: batchItem.code || '',
      shortCode: batchItem.shortCode || '',
      maxStrength: batchItem.maxStrength || 45,
      rollPrefix: batchItem.rollPrefix || '',
      paymentAccount: batchItem.paymentAccount || '',
      description: batchItem.description || ''
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (batchItem) => {
    setOpenRowMenuId(null);
    if (selectedBatchShow) setSelectedBatchShow(null);
    setEditingBatch(null);
    setFormData({
      name: `${batchItem.name} (Copy)`,
      course: batchItem.course || 'Nursery (NUR)',
      code: batchItem.code ? `${batchItem.code}-COPY` : '',
      shortCode: batchItem.shortCode ? `${batchItem.shortCode}-COPY` : '',
      maxStrength: batchItem.maxStrength || 45,
      rollPrefix: batchItem.rollPrefix || '',
      paymentAccount: batchItem.paymentAccount || '',
      description: batchItem.description || ''
    });
    setViewMode('duplicate');
  };

  const handleResetForm = () => {
    if (editingBatch) {
      handleOpenEdit(editingBatch);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Batch Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingBatch) {
        await API.put(`/batches/${editingBatch._id}`, formData);
        setSuccessMsg('Academic batch updated successfully!');
      } else {
        await API.post('/batches', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated batch saved successfully!' : 'Academic batch added successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save batch';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Row Action: Show Detail (Screenshot 3)
  const handleActionShow = (batchItem) => {
    setOpenRowMenuId(null);
    setSelectedBatchShow(batchItem);
    setViewMode('show');
  };

  // Row Action: Reorder Subject Modal Trigger (Screenshot 2)
  const handleOpenReorderSubjectModal = (batchItem) => {
    setOpenRowMenuId(null);
    setReorderSubjectBatch(batchItem);
    setSubjectsToReorder([...(batchItem.subjects || defaultSampleSubjects)]);
  };

  const moveSubjectItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= subjectsToReorder.length) return;
    const newList = [...subjectsToReorder];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setSubjectsToReorder(newList);
  };

  const handleSaveReorderSubjects = async () => {
    if (!reorderSubjectBatch) return;
    try {
      await API.post(`/batches/${reorderSubjectBatch._id}/reorder-subjects`, {
        subjects: subjectsToReorder
      });
      await fetchData();
      setReorderSubjectBatch(null);
      setSuccessMsg(`Subject order updated for batch "${reorderSubjectBatch.name}"!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Save reorder subjects error:', err);
      setError('Failed to reorder subjects');
    }
  };

  // Row Action: Delete Batch
  const handleActionDeleteTrigger = (id, name) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/batches/${id}`);
          setBatches(batches.filter(b => b._id !== id));
          setSuccessMsg(`Batch "${name}" deleted successfully!`);
          if (selectedBatchShow && selectedBatchShow._id === id) {
            setViewMode('list');
          }
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete batch');
        }
      }
    });
  };

  // Save Add Incharge Modal
  const handleSaveAddIncharge = async () => {
    try {
      await API.post('/batches/incharges/add', inchargeModalData);
      await fetchData();
      setShowAddInchargeModal(false);
      setSuccessMsg(`Added batch incharge "${inchargeModalData.employee}" for "${inchargeModalData.batch}"!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Save incharge error:', err);
      setError('Failed to save batch incharge');
    }
  };

  // Drag and Drop Assign Incharge Handlers
  const sampleEmployees = [
    { name: 'Anamika Tiwari', code: 'ESM001', department: 'Teaching Department - PRT' },
    { name: 'Demo Employee', code: 'ESM003', department: 'Teaching Department - Administrator' },
    { name: 'Kalpana Comar', code: 'ESM100', department: 'Teaching Department - Senior Teacher' },
    { name: 'Shivam Mishra', code: 'ESM005', department: 'Teaching Department - PGT' }
  ];

  const handleDropOnBatch = (batchName) => {
    if (!draggedEmployee) return;
    setAssignedInchargesMap(prev => ({
      ...prev,
      [batchName]: {
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
      for (const [batchName, info] of Object.entries(assignedInchargesMap)) {
        if (info && info.employee) {
          await API.post('/batches/incharges/add', {
            batch: batchName,
            employee: info.employee,
            employeeCode: info.employeeCode || 'ESM001',
            period: info.period || 'November 4, 2025 to November 14, 2026'
          });
        }
      }
      await fetchData();
      setViewMode('incharge-list');
      setSuccessMsg('Batch incharges assigned successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Save assigned incharges error:', err);
      setError('Failed to save assigned incharges');
    }
  };

  // Header Actions
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
      let filename = 'Campus_Pilot_Batches';
      if (viewMode === 'incharge-list') {
        exportData = incharges.map((item, idx) => ({
          '#': idx + 1,
          'Batch': item.batch,
          'Employee': item.employee,
          'Employee Code': item.employeeCode || '-',
          'Period': item.period,
          'Created At': new Date(item.createdAt).toLocaleString()
        }));
        filename = 'Campus_Pilot_Batch_Incharges';
      } else {
        exportData = filteredBatches.map((b, index) => ({
          '#': index + 1,
          'Name': b.name || '',
          'Course': b.course || '',
          'Code': b.code || '',
          'Strength': `${b.currentStrength || 0}/${b.maxStrength || 45}`,
          'Incharge': b.incharge || '-',
          'Created At': new Date(b.createdAt || Date.now()).toLocaleString()
        }));
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

  const filteredBatches = batches
    .filter(b => {
      const matchesSearch = 
        (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (b.course && b.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.incharge && b.incharge.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
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
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">Batch</button>
              
              {viewMode === 'show' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Batch Detail</span>
                </>
              )}

              {viewMode === 'incharge-list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Batch Incharge</span>
                </>
              )}

              {viewMode === 'incharge-assign' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <button onClick={() => setViewMode('incharge-list')} className="hover:text-teal-600 transition font-medium">Batch Incharge</button>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Assign Batch Incharge</span>
                </>
              )}

              {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Batch' : viewMode === 'edit' ? 'Edit Batch' : 'Duplicate Batch'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' && 'Batch'}
              {viewMode === 'show' && 'Batch Detail'}
              {viewMode === 'incharge-list' && 'Batch Incharge'}
              {viewMode === 'incharge-assign' && 'Batch Incharge'}
              {viewMode === 'add' && 'Add Batch'}
              {viewMode === 'edit' && 'Edit Batch'}
              {viewMode === 'duplicate' && 'Duplicate Batch'}
            </h1>
          </div>

          {/* Top Right Header Toolbar matching Screenshots 1, 3, 4, 5 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            
            {/* LIST VIEW TOOLBAR (Screenshot 1 & Screenshot 5) */}
            {viewMode === 'list' && (
              <>
                <button 
                  onClick={() => setViewMode('incharge-list')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Incharge
                </button>

                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Add Batch
                </button>

                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                <button 
                  title="Select Columns"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <LayoutGrid className="w-4 h-4" />
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

            {/* BATCH DETAIL / ADD FORM TOOLBAR (Screenshot 3 & 4) */}
            {(viewMode === 'show' || viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
              <button 
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List all Batch
              </button>
            )}

            {/* INCHARGE LIST TOOLBAR */}
            {viewMode === 'incharge-list' && (
              <>
                <button 
                  onClick={() => setViewMode('incharge-assign')}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Assign Batch Incharge
                </button>

                <button 
                  onClick={() => setShowAddInchargeModal(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  Add Batch Incharge
                </button>
              </>
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

        {/* Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-4 no-print animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search batch by name, course, code, or incharge..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs font-semibold text-rose-500 hover:underline">Clear</button>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW MODE: BATCH LIST (Screenshot 1 & Screenshot 5)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8 relative" id="printable-table">
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th onClick={() => toggleSort('name')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition">
                      <div className="flex items-center gap-1"><span>NAME</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-5 py-3.5">COURSE</th>
                    <th onClick={() => toggleSort('code')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition">
                      <div className="flex items-center gap-1"><span>CODE</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th onClick={() => toggleSort('maxStrength')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition">
                      <div className="flex items-center gap-1"><span>MAX STRENGTH</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-5 py-3.5">BATCH INCHARGE</th>
                    <th className="px-5 py-3.5">SUBJECTS</th>
                    <th onClick={() => toggleSort('createdAt')} className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition whitespace-nowrap">
                      <div className="flex items-center gap-1"><span>CREATED AT</span><span className="text-[10px]">⇅</span></div>
                    </th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No batches found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Batch</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((batchItem) => {
                      const subjectsList = batchItem.subjects || defaultSampleSubjects;
                      return (
                        <tr key={batchItem._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                          <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100 align-top text-xs">{batchItem.name}</td>
                          <td className="px-5 py-4 text-xs font-medium text-gray-800 dark:text-slate-200 align-top">{batchItem.course || 'Nursery (NUR)'}</td>
                          <td className="px-5 py-4 text-xs font-mono align-top text-gray-500">{batchItem.code || '-'}</td>
                          <td className="px-5 py-4 text-xs font-mono font-semibold text-gray-700 dark:text-slate-300 align-top">{batchItem.currentStrength || 0}/{batchItem.maxStrength || 45}</td>
                          <td className="px-5 py-4 text-xs align-top">
                            {batchItem.incharge && batchItem.incharge !== '-' ? (
                              <span className="font-bold text-gray-800 dark:text-slate-200">{batchItem.incharge}</span>
                            ) : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-5 py-4 text-xs align-top max-w-[220px]">
                            <div className="space-y-0.5">
                              {subjectsList.map((sub, i) => (
                                <div key={i} className="text-gray-700 dark:text-slate-300 font-medium">
                                  {sub.name} {sub.code && <span className="text-gray-400 font-mono text-[10px]">{sub.code}</span>} {sub.hasGrading && <span className="font-bold text-slate-800 ml-1">A</span>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap align-top">{formatCreatedAt(batchItem.createdAt)}</td>
                          <td className="px-4 py-4 text-right no-print align-top relative">
                            <div className="relative inline-block text-left row-menu-container">
                              <button onClick={() => setOpenRowMenuId(openRowMenuId === batchItem._id ? null : batchItem._id)} className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 transition ${openRowMenuId === batchItem._id ? 'bg-slate-100 text-teal-600 ring-2 ring-teal-500/20' : ''}`}>
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* Row Options Dropdown matching Screenshot 2 */}
                              {openRowMenuId === batchItem._id && (
                                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                  <div className="py-1">
                                    <button onClick={() => handleActionShow(batchItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5">
                                      <Eye className="w-4 h-4 text-slate-500" /><span>Show</span>
                                    </button>
                                    <button onClick={() => handleOpenReorderSubjectModal(batchItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5">
                                      <Move className="w-4 h-4 text-slate-500" /><span>Reorder Subject</span>
                                    </button>
                                    <button onClick={() => handleOpenEdit(batchItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5">
                                      <Edit className="w-4 h-4 text-slate-500" /><span>Edit</span>
                                    </button>
                                    <button onClick={() => handleOpenDuplicate(batchItem)} className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-2.5">
                                      <Copy className="w-4 h-4 text-slate-500" /><span>Duplicate</span>
                                    </button>
                                    <button onClick={() => handleActionDeleteTrigger(batchItem._id, batchItem.name)} className="w-full px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 border-t border-gray-100 mt-1 pt-1.5">
                                      <Trash2 className="w-4 h-4 text-rose-500" /><span>Delete</span>
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
          </div>
        )}

        {/* ========================================================
            VIEW MODE: BATCH DETAIL / SHOW VIEW (Screenshot 3)
           ======================================================== */}
        {viewMode === 'show' && selectedBatchShow && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            
            {/* Left Card: Batch Detail (Subjects Table) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-700">
                Batch Detail
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                      <th className="px-4 py-3">SUBJECT</th>
                      <th className="px-4 py-3">CODE</th>
                      <th className="px-4 py-3">IS ELECTIVE</th>
                      <th className="px-4 py-3">HAS GRADING</th>
                      <th className="px-4 py-3">HAS NO EXAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                    {(selectedBatchShow.subjects || defaultSampleSubjects).map((sub, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">{sub.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{sub.code || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{sub.isElective ? 'Yes' : '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{sub.hasGrading ? 'Yes' : '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{sub.hasNoExam ? 'Yes' : '-'}</td>
                      </tr>
                    ))}
                    <tr className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">Description</td>
                      <td className="px-4 py-3 font-mono text-gray-500">-</td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Batch Metadata */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-700">
                Batch
              </h2>

              <div className="space-y-4 text-xs divide-y divide-gray-100 dark:divide-slate-700">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-500 font-medium">Course</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{selectedBatchShow.course} {selectedBatchShow.name}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Code</span>
                  <span className="font-mono text-gray-700 dark:text-slate-300">{selectedBatchShow.code || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Max Strength</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{selectedBatchShow.maxStrength || 45}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Roll Number Prefix</span>
                  <span className="text-gray-700 dark:text-slate-300">{selectedBatchShow.rollPrefix || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Payment Gateway Account</span>
                  <span className="text-gray-700 dark:text-slate-300">{selectedBatchShow.paymentAccount || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Created At</span>
                  <span className="text-gray-700 dark:text-slate-300">{formatCreatedAt(selectedBatchShow.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-gray-500 font-medium">Last Updated At</span>
                  <span className="text-gray-700 dark:text-slate-300">{formatCreatedAt(selectedBatchShow.updatedAt || selectedBatchShow.createdAt)}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT BATCH FORM (Screenshot 4)
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select 
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition text-gray-800 dark:text-slate-200"
                  >
                    <option value="Nursery (NUR)">Nursery (NUR)</option>
                    <option value="LKG (LKG)">LKG (LKG)</option>
                    <option value="UKG (UKG)">UKG (UKG)</option>
                    <option value="I (I)">I (I)</option>
                    <option value="XII (XII)">XII (XII)</option>
                    {coursesList.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Short Code
                  </label>
                  <input 
                    type="text"
                    placeholder="Short Code"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Max Strength
                  </label>
                  <input 
                    type="number"
                    placeholder="Max Strength"
                    value={formData.maxStrength}
                    onChange={(e) => setFormData({ ...formData, maxStrength: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Roll Number Prefix
                  </label>
                  <input 
                    type="text"
                    placeholder="Roll Number Prefix"
                    value={formData.rollPrefix}
                    onChange={(e) => setFormData({ ...formData, rollPrefix: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 outline-none transition resize-y"
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

        {/* ========================================================
            VIEW MODE: BATCH INCHARGE TABLE VIEW
           ======================================================== */}
        {viewMode === 'incharge-list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8 relative" id="printable-table">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th className="px-5 py-3.5">BATCH</th>
                    <th className="px-5 py-3.5">EMPLOYEE</th>
                    <th className="px-5 py-3.5">PERIOD ⇅</th>
                    <th className="px-5 py-3.5">CREATED AT ⇅</th>
                    <th className="px-4 py-3.5 text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {incharges.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100 text-xs">{item.batch}</td>
                      <td className="px-5 py-4 text-xs">
                        <div className="font-semibold text-gray-800 dark:text-slate-200">{item.employee}</div>
                        <div className="text-gray-400 text-[11px]">{item.employeeCode || 'ESM001'}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-700 dark:text-slate-300">{item.period}</td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">{formatCreatedAt(item.createdAt)}</td>
                      <td className="px-4 py-4 text-right no-print">
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* REORDER SUBJECT MODAL DIALOG (Screenshot 2: Reorder Subject) */}
      {reorderSubjectBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-4 relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Reorder Subject - {reorderSubjectBatch.name}</h3>
              <button onClick={() => setReorderSubjectBatch(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {subjectsToReorder.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xs group hover:border-teal-500 transition">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition cursor-grab" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{sub.name} {sub.code && `(${sub.code})`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => moveSubjectItem(index, -1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-gray-100 transition"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveSubjectItem(index, 1)} disabled={index === subjectsToReorder.length - 1} className="p-1 text-gray-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-gray-100 transition"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setReorderSubjectBatch(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleSaveReorderSubjects} className="px-5 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"><Save className="w-4 h-4" />Save Order</button>
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

      {/* Footer Branding Text matching User Request */}
      <div className="mt-8 text-center text-xs font-medium text-gray-400 dark:text-slate-500 no-print">
        Campus Pilot
      </div>

    </div>
  );
}

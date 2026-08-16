import { useState, useEffect, useRef, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Building2, Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileText, FileSpreadsheet,
  List, Filter, MoreVertical, Sliders, ChevronRight, Home, CheckCircle2, RotateCcw, AlertCircle, UserCheck, X,
  Check, Network, ChevronLeft
} from 'lucide-react';

export default function Program() {
  const { user: currentUser } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Three Dots Dropdown Menu state & Ref
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Program Types State (Dynamic with Add Modal option)
  const [programTypes, setProgramTypes] = useState(['K-12', 'Undergraduate', 'Postgraduate', 'Diploma', 'Certificate']);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // Incharge Modal State
  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);
  const [selectedProgramForIncharge, setSelectedProgramForIncharge] = useState('');
  const [selectedTeacherForIncharge, setSelectedTeacherForIncharge] = useState('');
  const [inchargeSubmitting, setInchargeSubmitting] = useState(false);

  // View mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingProgram, setEditingProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State matching Screenshot 2
  const initialForm = {
    type: 'K-12',
    department: '',
    name: '',
    code: '',
    shortCode: '',
    alias: '',
    enableRegistration: true,
    duration: '',
    eligibility: '',
    benefits: '',
    description: '',
    incharge: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes, teacherRes] = await Promise.all([
        API.get('/programs'),
        API.get('/departments').catch(() => ({ data: [] })),
        API.get('/teachers').catch(() => ({ data: [] }))
      ]);

      setPrograms(Array.isArray(progRes.data) ? progRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching program data:', err);
      setError(err.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close three dots dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setEditingProgram(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (prog) => {
    setEditingProgram(prog);
    setFormData({
      type: prog.type || 'K-12',
      department: prog.department?._id || prog.department || '',
      name: prog.name || '',
      code: prog.code || '',
      shortCode: prog.shortCode || '',
      alias: prog.alias || '',
      enableRegistration: prog.enableRegistration !== false,
      duration: prog.duration || '',
      eligibility: prog.eligibility || '',
      benefits: prog.benefits || '',
      description: prog.description || '',
      incharge: prog.incharge?._id || prog.incharge || '',
      status: prog.status || 'Active'
    });
    setViewMode('edit');
  };

  const handleResetForm = () => {
    if (editingProgram) {
      handleOpenEdit(editingProgram);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Program Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    const payload = { ...formData };
    if (!payload.department) delete payload.department;
    if (!payload.incharge) delete payload.incharge;

    try {
      if (editingProgram) {
        await API.put(`/programs/${editingProgram._id}`, payload);
        setSuccessMsg('Program updated successfully!');
      } else {
        await API.post('/programs', payload);
        setSuccessMsg('Program added successfully!');
      }

      await fetchData();

      if (keepAdding && !editingProgram) {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save program';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await API.delete(`/programs/${id}`);
      setPrograms(programs.filter(p => p._id !== id));
      setSuccessMsg('Program deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete program');
    }
  };

  const handleAddTypeSubmit = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const trimmed = newTypeName.trim();
    if (!programTypes.includes(trimmed)) {
      setProgramTypes([...programTypes, trimmed]);
      setFormData({ ...formData, type: trimmed });
    }
    setNewTypeName('');
    setShowAddTypeModal(false);
  };

  // Three Dots Dropdown Actions
  const handleRefreshAction = async () => {
    setIsMenuOpen(false);
    await fetchData();
    setSuccessMsg('Program list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsMenuOpen(false);
    window.print();
  };

  const handleGeneratePdfAction = () => {
    setIsMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsMenuOpen(false);
    if (programs.length === 0) {
      setError('No program data available to export');
      return;
    }

    try {
      const exportData = filteredPrograms.map((p, index) => ({
        '#': index + 1,
        'Name': p.name || '',
        'Type': p.type || '',
        'Department': p.department?.name || '',
        'Registration': p.enableRegistration ? 'Enabled' : 'Disabled',
        'Code': p.code || '',
        'Short Code': p.shortCode || '',
        'Alias': p.alias || '',
        'Program Incharge': p.incharge ? (p.incharge.name || p.inchargeName) : '',
        'Duration': p.duration || '',
        'Created At': new Date(p.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Programs');
      
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 }
      ];

      XLSX.writeFile(workbook, `Campus_Pilot_Programs_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported programs to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
  };

  const handleAssignInchargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgramForIncharge) {
      alert('Please select a program');
      return;
    }
    setInchargeSubmitting(true);
    try {
      await API.put(`/programs/${selectedProgramForIncharge}`, {
        incharge: selectedTeacherForIncharge || null
      });
      await fetchData();
      setIsInchargeModalOpen(false);
      setSelectedProgramForIncharge('');
      setSelectedTeacherForIncharge('');
      setSuccessMsg('Program Incharge assigned successfully!');
    } catch (err) {
      alert('Failed to assign incharge');
    } finally {
      setInchargeSubmitting(false);
    }
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
  const filteredPrograms = programs
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesType = typeFilter === 'All' || p.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalResults = filteredPrograms.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-program-table, #printable-program-table * {
            visibility: visible;
          }
          #printable-program-table {
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
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshots */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            {/* Breadcrumb Navigation matching Screenshot 1 & 2 */}
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition">Program</button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Program' : 'Edit Program'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Program' : viewMode === 'add' ? 'Add Program' : 'Edit Program'}
            </h1>
          </div>

          {/* Top Right Header Actions Toolbar matching Screenshots */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Layout / Options"
                  className={`p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Sliders className="w-4 h-4" />
                </button>

                <button 
                  title="Hierarchy View"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Network className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setIsInchargeModalOpen(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Incharge
                </button>

                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Program
                </button>

                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* THREE DOTS BUTTON & DROPDOWN MENU */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
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
                          onClick={handleGeneratePdfAction}
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
                List all Program
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

        {/* Optional Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-4 no-print animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Types</option>
                {programTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); setTypeFilter('All'); setCurrentPage(1); }}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST (Screenshot 1 Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-8" id="printable-program-table">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search program..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button 
                  onClick={fetchData} 
                  className="p-2 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Print Title header */}
            <div className="hidden print:block mb-4 text-center">
              <h2 className="text-xl font-bold">Campus Pilot - Academic Program List</h2>
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table matching Screenshot 1 exactly */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th 
                      onClick={() => toggleSort('name')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>NAME</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th className="px-6 py-3.5">DEPARTMENT</th>
                    <th className="px-6 py-3.5">REGISTRATION</th>
                    <th 
                      onClick={() => toggleSort('code')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>CODE</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('alias')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>ALIAS</span>
                        <span className="text-[10px]">⇅</span>
                      </div>
                    </th>
                    <th className="px-6 py-3.5">PROGRAM INCHARGE</th>
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
                  {paginatedPrograms.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No programs found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Program</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedPrograms.map((prog) => (
                      <tr key={prog._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        {/* Name + Type under it matching Screenshot 1 */}
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-100">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{prog.name}</p>
                            <p className="text-xs font-normal text-gray-400 dark:text-slate-400 mt-0.5">{prog.type || 'K-12'}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                          {prog.department ? (prog.department.name || prog.department) : '-'}
                        </td>

                        {/* Registration Green Check badge matching Screenshot 1 */}
                        <td className="px-6 py-4">
                          {prog.enableRegistration !== false ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 inline-flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-400 border border-gray-300 dark:border-slate-600 inline-flex items-center justify-center text-[10px]">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-slate-300">
                          {prog.code || '-'}
                        </td>

                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                          {prog.alias || '-'}
                        </td>

                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                          {prog.incharge ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              <UserCheck className="w-3.5 h-3.5" />
                              {prog.incharge.name || prog.inchargeName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not Assigned</span>
                          )}
                        </td>

                        {/* Created At timestamp matching Screenshot 1 format: "November 6, 2025 10:56 AM" */}
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(prog.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) + ' ' + new Date(prog.createdAt || Date.now()).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        <td className="px-6 py-4 text-right no-print">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenEdit(prog)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                              title="Edit Program"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(prog._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar matching Screenshot 1 */}
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
            VIEW MODE: ADD / EDIT PROGRAM FORM (Screenshot 2 Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Row 1: Type (with + Add Program Type), Department, Name matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                  >
                    {programTypes.map(t => (
                      <option key={t} value={t} className="dark:bg-slate-800">{t}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setShowAddTypeModal(true)}
                    className="mt-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline block text-right w-full"
                  >
                    Add Program Type
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                  >
                    <option value="" className="dark:bg-slate-800">Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id} className="dark:bg-slate-800">{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Row 2: Code, Short Code, Alias matching Screenshot 2 */}
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Row 3: Enable Registration Toggle & Duration matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center space-x-3 pt-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Enable Registration
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, enableRegistration: !formData.enableRegistration })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.enableRegistration ? 'bg-teal-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.enableRegistration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input 
                    type="text"
                    placeholder="Duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Row 4: Eligibility Textarea matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Eligibility
                </label>
                <textarea 
                  rows="2"
                  placeholder="Eligibility"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition resize-y"
                />
              </div>

              {/* Row 5: Benefits Textarea matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Benefits
                </label>
                <textarea 
                  rows="2"
                  placeholder="Benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition resize-y"
                />
              </div>

              {/* Row 6: Description Textarea matching Screenshot 2 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="2"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition resize-y"
                />
              </div>

              {/* Form Action Buttons Bar matching Screenshot 2 */}
              <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Reset & Keep Adding */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-semibold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>

                  {viewMode === 'add' && (
                    <label className="inline-flex items-center space-x-2 text-xs text-gray-700 dark:text-slate-300 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Keep Adding</span>
                    </label>
                  )}
                </div>

                {/* Right side: Cancel & Save */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button 
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-full shadow transition"
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs rounded-full shadow transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Add Program Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Add Program Type</h3>
            <input 
              type="text"
              placeholder="e.g. Diploma, Vocational"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowAddTypeModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAddTypeSubmit}
                className="px-4 py-1.5 text-xs bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incharge Assignment Modal */}
      {isInchargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Assign Program Incharge
              </h3>
              <button 
                onClick={() => setIsInchargeModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignInchargeSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Select Program <span className="text-rose-500">*</span>
                </label>
                <select 
                  required
                  value={selectedProgramForIncharge}
                  onChange={(e) => setSelectedProgramForIncharge(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose Program...</option>
                  {programs.map(p => (
                    <option key={p._id} value={p._id}>{p.name} {p.code ? `(${p.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Select Incharge Teacher/Staff
                </label>
                <select 
                  value={selectedTeacherForIncharge}
                  onChange={(e) => setSelectedTeacherForIncharge(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Unassigned / Remove Incharge</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.subject || 'Staff'})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsInchargeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={inchargeSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {inchargeSubmitting ? 'Assigning...' : 'Assign Incharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Branding matching Screenshots: "Campus Pilot" */}
      <footer className="mt-8 pt-4 border-t border-gray-200/60 dark:border-slate-800 text-center text-xs font-medium text-gray-500 dark:text-slate-400 no-print">
        Campus Pilot
      </footer>

    </div>
  );
}

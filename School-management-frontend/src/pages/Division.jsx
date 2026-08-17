import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  ChevronLeft, X, Eye, Copy, ArrowRightCircle, UserCheck, Move, Users
} from 'lucide-react';

export default function Division() {
  const [divisions, setDivisions] = useState([]);
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
  const [sortOrder, setSortOrder] = useState('asc');

  // Three Dots Header Dropdown Menu state & Ref
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // Row Three Dots Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // Show Details Modal State
  const [selectedDivisionModal, setSelectedDivisionModal] = useState(null);

  // Assign Incharge Modal State
  const [inchargeModalItem, setInchargeModalItem] = useState(null);
  const [inchargeInput, setInchargeInput] = useState('');

  // Custom Confirmation Modal State ("Are you sure?")
  const [confirmModal, setConfirmModal] = useState(null);

  // View mode: 'list' | 'add' | 'edit' | 'duplicate'
  const [viewMode, setViewMode] = useState('list');
  const [editingDivision, setEditingDivision] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    shortCode: '',
    program: 'Senior Secondary',
    programSub: '-',
    incharge: '-',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/divisions');
      const fetched = Array.isArray(res.data) ? res.data : [];
      setDivisions(fetched);
      setError('');
    } catch (err) {
      console.error('Error fetching divisions:', err);
      setError('Failed to load academic divisions');
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
    setEditingDivision(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (divisionItem) => {
    setOpenRowMenuId(null);
    if (selectedDivisionModal) setSelectedDivisionModal(null);
    setEditingDivision(divisionItem);
    setFormData({
      name: divisionItem.name || '',
      code: divisionItem.code || '',
      shortCode: divisionItem.shortCode || divisionItem.code || '',
      program: divisionItem.program || 'Senior Secondary',
      programSub: divisionItem.programSub || '-',
      incharge: divisionItem.incharge || '-',
      description: divisionItem.description || ''
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (divisionItem) => {
    setOpenRowMenuId(null);
    if (selectedDivisionModal) setSelectedDivisionModal(null);
    setEditingDivision(null);
    setFormData({
      name: `${divisionItem.name} (Copy)`,
      code: divisionItem.code ? `${divisionItem.code}-COPY` : '',
      shortCode: divisionItem.shortCode ? `${divisionItem.shortCode}-COPY` : '',
      program: divisionItem.program || 'Senior Secondary',
      programSub: divisionItem.programSub || '-',
      incharge: divisionItem.incharge || '-',
      description: divisionItem.description || ''
    });
    setViewMode('duplicate');
  };

  const handleResetForm = () => {
    if (editingDivision) {
      handleOpenEdit(editingDivision);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Division Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingDivision) {
        await API.put(`/divisions/${editingDivision._id}`, formData);
        setSuccessMsg('Academic division updated successfully!');
      } else {
        await API.post('/divisions', formData);
        setSuccessMsg(viewMode === 'duplicate' ? 'Duplicated division saved successfully!' : 'Academic division added successfully!');
      }

      await fetchData();

      if (keepAdding && viewMode !== 'edit') {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save division';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Row Action: Show Details
  const handleActionShow = (divisionItem) => {
    setOpenRowMenuId(null);
    setSelectedDivisionModal(divisionItem);
  };

  // Row Action: Assign Incharge Trigger
  const handleOpenInchargeModal = (divisionItem) => {
    setOpenRowMenuId(null);
    setInchargeModalItem(divisionItem);
    setInchargeInput(divisionItem.incharge === '-' ? '' : divisionItem.incharge);
  };

  const handleSaveIncharge = async () => {
    if (!inchargeModalItem) return;
    try {
      await API.patch(`/divisions/${inchargeModalItem._id}/incharge`, {
        incharge: inchargeInput.trim() || '-'
      });
      await fetchData();
      setInchargeModalItem(null);
      setSuccessMsg(`Division Incharge updated for "${inchargeModalItem.name}"!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Incharge save error:', err);
      setError('Failed to update division incharge');
    }
  };

  // Row Action: Delete Division
  const handleActionDeleteTrigger = (id, name) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Are you sure?',
      message: 'You might not be able to reverse this action. Confirm to proceed?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/divisions/${id}`);
          setDivisions(divisions.filter(d => d._id !== id));
          setSuccessMsg(`Division "${name}" deleted successfully!`);
          if (selectedDivisionModal && selectedDivisionModal._id === id) {
            setSelectedDivisionModal(null);
          }
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete division');
        }
      }
    });
  };

  // Header Actions
  const handleRefreshAction = async () => {
    setIsHeaderMenuOpen(false);
    await fetchData();
    setSuccessMsg('Division list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsHeaderMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (divisions.length === 0) {
      setError('No division data available to export');
      return;
    }

    try {
      const exportData = filteredDivisions.map((d, index) => ({
        '#': index + 1,
        'Division': d.name || '',
        'Code': d.code || '',
        'Short Code': d.shortCode || '',
        'Program': d.program || '',
        'Program Sub/Alias': d.programSub || '',
        'Division Incharge': d.incharge || '-',
        'Created At': new Date(d.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Divisions');
      
      XLSX.writeFile(workbook, `Campus_Pilot_Divisions_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported divisions to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
  };

  // Date Formatter matching screenshot: "February 7, 2025 11:32 PM"
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

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredDivisions = divisions
    .filter(d => {
      const matchesSearch = 
        (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.program && d.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.incharge && d.incharge.toLowerCase().includes(searchTerm.toLowerCase()));

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

  // Pagination
  const totalResults = filteredDivisions.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedDivisions = filteredDivisions.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-division-table, #printable-division-table * {
            visibility: visible;
          }
          #printable-division-table {
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
        
        {/* Top Breadcrumb & Page Header Bar matching Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300">Division</button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Division' : viewMode === 'edit' ? 'Edit Division' : 'Duplicate Division'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Division' : viewMode === 'add' ? 'Add Division' : viewMode === 'edit' ? 'Edit Division' : 'Duplicate Division'}
            </h1>
          </div>

          {/* Top Right Header Toolbar matching Screenshot */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                {/* Reorder Icon Button */}
                <button 
                  title="Reorder Divisions"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Move className="w-4 h-4" />
                </button>

                {/* Incharge Button */}
                <button 
                  onClick={() => {
                    if (divisions.length > 0) handleOpenInchargeModal(divisions[0]);
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  Incharge
                </button>

                {/* Add Division Button */}
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  Add Division
                </button>

                {/* Filter Icon Button */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Header Three Dots Menu Button */}
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
                List all Division
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

        {/* Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs flex items-center gap-4 no-print animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search division by name, code, program..."
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
            VIEW MODE: LIST (Division Screenshot Exact Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-visible p-6 sm:p-8" id="printable-division-table">
            
            {/* Table matching Screenshot columns */}
            <div className="overflow-visible min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                    <th 
                      onClick={() => toggleSort('name')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      DIVISION
                    </th>
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
                      onClick={() => toggleSort('program')}
                      className="px-6 py-3.5 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition"
                    >
                      PROGRAM
                    </th>
                    <th className="px-6 py-3.5">
                      DIVISION INCHARGE
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
                  {paginatedDivisions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No divisions found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Division</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedDivisions.map((divisionItem) => (
                      <tr key={divisionItem._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        
                        {/* DIVISION Name Column */}
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-100">
                          {divisionItem.name}
                        </td>

                        {/* CODE & SHORT CODE Column (2 lines matching screenshot) */}
                        <td className="px-6 py-4 text-xs font-mono">
                          <div className="text-gray-800 dark:text-slate-200">{divisionItem.code || '-'}</div>
                          <div className="text-gray-400 dark:text-slate-500 mt-0.5">{divisionItem.shortCode || divisionItem.code || '-'}</div>
                        </td>

                        {/* PROGRAM & SUB Column (2 lines matching screenshot) */}
                        <td className="px-6 py-4 text-xs">
                          <div className="text-gray-800 dark:text-slate-200 font-medium">{divisionItem.program || 'Senior Secondary'}</div>
                          <div className="text-gray-400 dark:text-slate-500 mt-0.5">{divisionItem.programSub || '-'}</div>
                        </td>

                        {/* DIVISION INCHARGE Column */}
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-slate-300">
                          {divisionItem.incharge || '-'}
                        </td>

                        {/* CREATED AT Column */}
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatCreatedAt(divisionItem.createdAt)}
                        </td>

                        {/* ROW ACTIONS THREE-DOT MENU */}
                        <td className="px-6 py-4 text-right no-print relative">
                          <div className="relative inline-block text-left row-menu-container">
                            <button 
                              onClick={() => setOpenRowMenuId(openRowMenuId === divisionItem._id ? null : divisionItem._id)}
                              className={`p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition ${openRowMenuId === divisionItem._id ? 'bg-slate-100 dark:bg-slate-700 text-teal-600 ring-2 ring-teal-500/20' : ''}`}
                              title="Actions Menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* ROW ACTION DROPDOWN MENU */}
                            {openRowMenuId === divisionItem._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/90 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <div className="py-1">
                                  
                                  {/* Show */}
                                  <button
                                    onClick={() => handleActionShow(divisionItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <ArrowRightCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Show</span>
                                  </button>

                                  {/* Assign Incharge */}
                                  <button
                                    onClick={() => handleOpenInchargeModal(divisionItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Assign Incharge</span>
                                  </button>

                                  {/* Edit */}
                                  <button
                                    onClick={() => handleOpenEdit(divisionItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Duplicate */}
                                  <button
                                    onClick={() => handleOpenDuplicate(divisionItem)}
                                    className="w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center gap-2.5"
                                  >
                                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleActionDeleteTrigger(divisionItem._id, divisionItem.name)}
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

            {/* Pagination Controls Bar matching Screenshot */}
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
            VIEW MODE: ADD / EDIT / DUPLICATE FORM
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'duplicate') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Division Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Primary"
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
                    placeholder="e.g. P"
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
                    placeholder="e.g. P"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Program
                  </label>
                  <input 
                    type="text"
                    placeholder="Senior Secondary"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Program Sub / Alias
                  </label>
                  <input 
                    type="text"
                    placeholder="-"
                    value={formData.programSub}
                    onChange={(e) => setFormData({ ...formData, programSub: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Division Incharge
                  </label>
                  <input 
                    type="text"
                    placeholder="-"
                    value={formData.incharge}
                    onChange={(e) => setFormData({ ...formData, incharge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Division description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition resize-y"
                />
              </div>

              {/* Bottom Buttons */}
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
          CONFIRMATION MODAL DIALOG ("Are you sure?")
         ======================================================== */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200/80 dark:border-slate-700 text-center space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-300 dark:border-amber-900/50 flex items-center justify-center text-amber-500 text-4xl font-light">
              !
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {confirmModal.title || 'Are you sure?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed px-4">
                {confirmModal.message || 'You might not be able to reverse this action. Confirm to proceed?'}
              </p>
            </div>

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
          ASSIGN INCHARGE MODAL DIALOG
         ======================================================== */}
      {inchargeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign Division Incharge</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{inchargeModalItem.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setInchargeModalItem(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Incharge Name / Employee
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Shivam (Teaching Staff)"
                  value={inchargeInput}
                  onChange={(e) => setInchargeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setInchargeModalItem(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIncharge}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Incharge
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          SHOW DETAILS MODAL DIALOG
         ======================================================== */}
      {selectedDivisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-6 relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Division Details</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{selectedDivisionModal.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDivisionModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Division Name</span>
                <p className="font-bold text-gray-900 dark:text-slate-100">{selectedDivisionModal.name}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Code</span>
                <p className="font-mono font-semibold text-gray-900 dark:text-slate-100">{selectedDivisionModal.code || '-'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Short Code</span>
                <p className="font-mono font-semibold text-gray-900 dark:text-slate-100">{selectedDivisionModal.shortCode || selectedDivisionModal.code || '-'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Program</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{selectedDivisionModal.program || 'Senior Secondary'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Program Sub / Alias</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{selectedDivisionModal.programSub || '-'}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                <span className="text-gray-400 dark:text-slate-500 font-medium">Division Incharge</span>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{selectedDivisionModal.incharge || '-'}</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setSelectedDivisionModal(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenEdit(selectedDivisionModal)}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Division
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

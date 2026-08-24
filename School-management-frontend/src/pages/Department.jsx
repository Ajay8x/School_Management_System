import { useState, useEffect, useRef, useContext } from 'react';
import API from '../api/axios';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Building2, Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileText, FileSpreadsheet,
  List, Filter, MoreVertical, Sliders, ChevronRight, Home, CheckCircle2, RotateCcw, AlertCircle, UserCheck, X
} from 'lucide-react';

export default function Department() {
  const { user: currentUser } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterBar, setShowFilterBar] = useState(false);
  
  // Three Dots Dropdown Menu state & Ref
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Incharge Modal state
  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);
  const [selectedDeptForIncharge, setSelectedDeptForIncharge] = useState('');
  const [selectedTeacherForIncharge, setSelectedTeacherForIncharge] = useState('');
  const [inchargeSubmitting, setInchargeSubmitting] = useState(false);

  // View mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    shortCode: '',
    alias: '',
    description: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, teacherRes] = await Promise.all([
        API.get('/departments'),
        API.get('/teachers').catch(() => ({ data: [] }))
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError('Failed to load departments');
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
    setEditingDept(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      shortCode: dept.shortCode || '',
      alias: dept.alias || '',
      description: dept.description || '',
      status: dept.status || 'Active'
    });
    setViewMode('edit');
  };

  const handleResetForm = () => {
    if (editingDept) {
      setFormData({
        name: editingDept.name || '',
        code: editingDept.code || '',
        shortCode: editingDept.shortCode || '',
        alias: editingDept.alias || '',
        description: editingDept.description || '',
        status: editingDept.status || 'Active'
      });
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Department Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingDept) {
        await API.put(`/departments/${editingDept._id}`, formData);
        setSuccessMsg('Department updated successfully!');
      } else {
        await API.post('/departments', formData);
        setSuccessMsg('Department added successfully!');
      }

      await fetchData();

      if (keepAdding && !editingDept) {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      setDepartments(departments.filter(d => d._id !== id));
      setSuccessMsg('Department deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete department');
    }
  };

  // Three Dots Dropdown Actions
  const handleRefreshAction = async () => {
    setIsMenuOpen(false);
    await fetchData();
    setSuccessMsg('Department list refreshed successfully!');
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
    if (departments.length === 0) {
      setError('No department data available to export');
      return;
    }

    try {
      const exportData = filteredDepartments.map((d, index) => ({
        '#': index + 1,
        'Code': d.code || '',
        'Name': d.name || '',
        'Short Code': d.shortCode || '',
        'Alias': d.alias || '',
        'Incharge': d.incharge ? (d.incharge.name || d.inchargeName) : '',
        'Description': d.description || '',
        'Status': d.status || 'Active'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
      
      // Auto-fit column widths
      const max_cols = [
        { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 12 }
      ];
      worksheet['!cols'] = max_cols;

      XLSX.writeFile(workbook, `Campus_Pilot_Departments_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported departments to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      setError('Failed to export to Excel');
    }
  };

  const handleAssignInchargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptForIncharge) {
      alert('Please select a department');
      return;
    }
    setInchargeSubmitting(true);
    try {
      await API.put(`/departments/${selectedDeptForIncharge}`, {
        incharge: selectedTeacherForIncharge || null
      });
      await fetchData();
      setIsInchargeModalOpen(false);
      setSelectedDeptForIncharge('');
      setSelectedTeacherForIncharge('');
      setSuccessMsg('Department Incharge assigned successfully!');
    } catch (err) {
      alert('Failed to assign incharge');
    } finally {
      setInchargeSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.shortCode && d.shortCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.alias && d.alias.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles for clean PDF / Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-department-table, #printable-department-table * {
            visibility: visible;
          }
          #printable-department-table {
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
        
        {/* Top Breadcrumb & Page Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            {/* Breadcrumb Navigation matching Screenshot */}
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Academic</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition">Department</button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Department' : 'Edit Department'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Department' : viewMode === 'add' ? 'Add Department' : 'Edit Department'}
            </h1>
          </div>

          {/* Top Right Header Actions Toolbar matching Screenshots */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Toggle Filters"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Sliders className="w-4 h-4" />
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
                  Add Department
                </button>

                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* THREE DOTS BUTTON AND WORKING DROPDOWN MENU */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="More Options"
                    className={`p-2.5 bg-white dark:bg-slate-800 border ${isMenuOpen ? 'border-teal-500 text-teal-600 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Options Popup matching Screenshot */}
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
                List all Department
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

        {/* Optional Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-4 no-print animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW MODE: LIST / LANDING (Screenshot 1 Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10" id="printable-department-table">
            {departments.length === 0 ? (
              /* Screenshot 1 Empty State Landing Card */
              <div className="max-w-2xl mx-auto text-center py-10 space-y-6">
                {/* List icon matching Screenshot 1 */}
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                  <List className="w-10 h-10 stroke-[1.5]" />
                </div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  List all Department
                </h3>

                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-normal">
                  Academic Departments are divisions within an educational institution responsible for specific subject areas or fields of study. For example, the Mathematics Department, Science Department, or Humanities Department.
                </p>

                <button 
                  onClick={handleOpenAdd}
                  className="px-6 py-3 bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center justify-center no-print"
                >
                  Add Department
                </button>
              </div>
            ) : (
              /* Full Department List Table View */
              <div className="space-y-6">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      Total: {filteredDepartments.length} Departments
                    </span>
                  </div>
                </div>

                {/* Print Title header */}
                <div className="hidden print:block mb-4 text-center">
                  <h2 className="text-xl font-bold">Campus Pilot - Department List</h2>
                  <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/50">
                        <th className="px-6 py-3.5">Code</th>
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Short Code</th>
                        <th className="px-6 py-3.5">Alias</th>
                        <th className="px-6 py-3.5">Incharge</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                      {filteredDepartments.map((dept) => (
                        <tr key={dept._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                            {dept.code || '-'}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-800 dark:text-slate-200">
                            <div>
                              <p>{dept.name}</p>
                              {dept.description && (
                                <p className="text-xs font-normal text-gray-400 dark:text-slate-400 line-clamp-1 mt-0.5">{dept.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-mono text-xs">
                            {dept.shortCode || '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                            {dept.alias || '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                            {dept.incharge ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                <UserCheck className="w-3.5 h-3.5" />
                                {dept.incharge.name || dept.inchargeName}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              dept.status === 'Inactive'
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {dept.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right no-print">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleOpenEdit(dept)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                title="Edit Department"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(dept._id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                                title="Delete Department"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW MODE: ADD / EDIT FORM (Screenshot 2 Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-8 no-print">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Name, Code, Short Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>

              {/* Row 2: Alias */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Row 3: Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 outline-none focus:border-teal-500 transition resize-y"
                />
              </div>

              {/* Form Bottom Actions matching Screenshot 2 */}
              <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side actions */}
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

                {/* Right side actions */}
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

      {/* Incharge Assignment Modal */}
      {isInchargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Assign Department Incharge
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
                  Select Department <span className="text-rose-500">*</span>
                </label>
                <select 
                  required
                  value={selectedDeptForIncharge}
                  onChange={(e) => setSelectedDeptForIncharge(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose Department...</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
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



    </div>
  );
}

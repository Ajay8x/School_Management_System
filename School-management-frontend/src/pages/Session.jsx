import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, Save, RefreshCw, RotateCw, Printer, FileText, FileSpreadsheet,
  List, Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle, Calendar,
  ChevronLeft, X
} from 'lucide-react';

export default function Session() {
  const [sessions, setSessions] = useState([]);
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

  // Three Dots Dropdown Menu state & Ref
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // View mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Form State matching Screenshot 2
  const initialForm = {
    name: '',
    code: '',
    shortCode: '',
    alias: '',
    startDate: '',
    endDate: '',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sessions');
      const fetchedSessions = Array.isArray(res.data) ? res.data : [];
      setSessions(fetchedSessions);

      // Seed initial dummy session if empty matching Screenshot 1
      if (fetchedSessions.length === 0) {
        const dummySession = {
          name: '2025-2026',
          code: '2025-2026',
          shortCode: '25-26',
          alias: '2025-2026',
          startDate: '2025-04-01',
          endDate: '2026-03-31',
          period: '2025-2026',
          description: 'April 1, 2025 to March 31, 2026'
        };
        try {
          const seeded = await API.post('/sessions', dummySession);
          setSessions([seeded.data]);
        } catch (e) {
          // ignore seeding error
        }
      }

      setError('');
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close three dots menu when clicking outside
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
    setEditingSession(null);
    setFormData(initialForm);
    setViewMode('add');
  };

  const handleOpenEdit = (sess) => {
    setEditingSession(sess);
    setFormData({
      name: sess.name || '',
      code: sess.code || '',
      shortCode: sess.shortCode || '',
      alias: sess.alias || '',
      startDate: sess.startDate ? new Date(sess.startDate).toISOString().split('T')[0] : '',
      endDate: sess.endDate ? new Date(sess.endDate).toISOString().split('T')[0] : '',
      description: sess.description || ''
    });
    setViewMode('edit');
  };

  const handleResetForm = () => {
    if (editingSession) {
      handleOpenEdit(editingSession);
    } else {
      setFormData(initialForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Session Name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    const payload = { ...formData };

    try {
      if (editingSession) {
        await API.put(`/sessions/${editingSession._id}`, payload);
        setSuccessMsg('Session updated successfully!');
      } else {
        await API.post('/sessions', payload);
        setSuccessMsg('Session added successfully!');
      }

      await fetchData();

      if (keepAdding && !editingSession) {
        setFormData(initialForm);
      } else {
        setViewMode('list');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to save session';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await API.delete(`/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
      setSuccessMsg('Session deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete session');
    }
  };

  // Three Dots Dropdown Actions
  const handleRefreshAction = async () => {
    setIsMenuOpen(false);
    await fetchData();
    setSuccessMsg('Session list refreshed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrintAction = () => {
    setIsMenuOpen(false);
    window.print();
  };

  const handleExportExcelAction = () => {
    setIsMenuOpen(false);
    if (sessions.length === 0) {
      setError('No session data available to export');
      return;
    }

    try {
      const exportData = filteredSessions.map((s, index) => ({
        '#': index + 1,
        'Session': s.name || '',
        'Code': s.code || '',
        'Short Code': s.shortCode || '',
        'Alias': s.alias || '',
        'Start Date': s.startDate ? new Date(s.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        'End Date': s.endDate ? new Date(s.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        'Period': s.period || '',
        'Created At': new Date(s.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');
      
      XLSX.writeFile(workbook, `Campus_Pilot_Sessions_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported sessions to Excel successfully!');
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
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
  const filteredSessions = sessions
    .filter(s => {
      const matchesSearch = 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.alias && s.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.period && s.period.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const totalResults = filteredSessions.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-session-table, #printable-session-table * {
            visibility: visible;
          }
          #printable-session-table {
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
              <button onClick={() => setViewMode('list')} className="hover:text-teal-600 dark:hover:text-teal-400 transition">Session</button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Session' : 'Edit Session'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Session' : viewMode === 'add' ? 'Add Session' : 'Edit Session'}
            </h1>
          </div>

          {/* Top Right Header Actions Toolbar matching Screenshots */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Session
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
                List all Session
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
                placeholder="Search session by name, code or period..."
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
            VIEW MODE: LIST (Screenshot 1 Match)
           ======================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-8" id="printable-session-table">
            
            {/* Table Header Controls */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-700 no-print">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search session..."
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

            {/* Print Title header */}
            <div className="hidden print:block mb-4 text-center">
              <h2 className="text-xl font-bold">Campus Pilot - Session List</h2>
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
                    <th className="px-6 py-3.5">PERIOD</th>
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
                  {paginatedSessions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                        No sessions found. Click <button onClick={handleOpenAdd} className="text-teal-600 dark:text-teal-400 font-bold underline">Add Session</button> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedSessions.map((sess) => (
                      <tr key={sess._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-slate-100">
                          {sess.name}
                        </td>

                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-mono text-xs">
                          {sess.code || sess.name}
                        </td>

                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDisplayDate(sess.startDate)}
                        </td>

                        <td className="px-6 py-4 text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDisplayDate(sess.endDate)}
                        </td>

                        <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-medium">
                          {sess.period || `${formatDisplayDate(sess.startDate)} to ${formatDisplayDate(sess.endDate)}`}
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {formatCreatedAt(sess.createdAt)}
                        </td>

                        <td className="px-6 py-4 text-right no-print">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenEdit(sess)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                              title="Edit Session"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(sess._id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition"
                              title="Delete Session"
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
            VIEW MODE: ADD / EDIT SESSION FORM (Screenshot 2 Match)
           ======================================================== */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden p-6 sm:p-10 no-print">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Row 1: Name, Code, Short Code matching Screenshot 2 */}
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
              </div>

              {/* Row 2: Alias, Start Date, End Date matching Screenshot 2 */}
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
                    className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Description matching Screenshot 2 */}
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
                  {viewMode === 'add' && (
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
                    className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
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

        {/* Footer Brand matching Campus Pilot */}
        <div className="text-center py-4 text-xs font-medium text-gray-400 dark:text-slate-500 no-print">
          Campus Pilot
        </div>

      </div>
    </div>
  );
}

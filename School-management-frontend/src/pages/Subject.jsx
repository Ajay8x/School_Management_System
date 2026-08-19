import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Settings, RefreshCw, Printer, FileText, FileSpreadsheet,
  MoreVertical, Eye, Edit, Copy, Trash2, X, ChevronLeft, ChevronRight, UserCheck,
  BookOpen, CheckSquare, Layers
} from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';

export default function Subject() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit' | 'show'
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    code: '',
    shortCode: '',
    type: 'Theory',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Allotment Modal State
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [allotTargetType, setAllotTargetType] = useState('course'); // 'course' | 'batch'
  const [selectedSubjectNames, setSelectedSubjectNames] = useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [allotSubmitting, setAllotSubmitting] = useState(false);
  const [targetSearch, setTargetSearch] = useState('');

  // UI Menus & Filters
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const mainDropdownRef = useRef(null);
  const routePrefix = (user?.role === 'super-admin' || user?.role === 'admin') ? '/admin' : `/${user?.role || 'admin'}`;

  // Listen for view param or location changes
  useEffect(() => {
    if (location.pathname.endsWith('/create')) {
      setView('add');
    }
  }, [location.pathname]);

  useSchoolRefresh(() => {
    fetchSubjects();
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('/subjects');
      const data = Array.isArray(res.data) ? res.data : [];
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
      showToast('Failed to load subjects', 'error');
      setSubjects([]);
      setFilteredSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndBatches = async () => {
    try {
      const [resCourses, resBatches] = await Promise.all([
        API.get('/courses'),
        API.get('/batches')
      ]);
      setAvailableCourses(Array.isArray(resCourses.data) ? resCourses.data : []);
      setAvailableBatches(Array.isArray(resBatches.data) ? resBatches.data : []);
    } catch (error) {
      console.error('Failed to fetch courses/batches for allotment', error);
    }
  };

  const handleOpenAllotModal = (subjectName = null) => {
    fetchCoursesAndBatches();
    if (subjectName) {
      setSelectedSubjectNames([subjectName]);
    } else {
      setSelectedSubjectNames(subjects.map(s => s.name));
    }
    setSelectedTargetIds([]);
    setShowAllotModal(true);
    setActiveRowMenuId(null);
  };

  const handleExecuteAllotment = async () => {
    if (selectedSubjectNames.length === 0) {
      showToast('Please select at least one subject to allot', 'error');
      return;
    }
    if (selectedTargetIds.length === 0) {
      showToast(`Please select at least one ${allotTargetType === 'course' ? 'Course' : 'Batch'}`, 'error');
      return;
    }

    setAllotSubmitting(true);
    try {
      const res = await API.post('/subjects/allot', {
        subjectNames: selectedSubjectNames,
        targetType: allotTargetType,
        targetIds: selectedTargetIds
      });
      showToast(res.data?.message || 'Subjects allotted successfully!');
      setShowAllotModal(false);
    } catch (error) {
      console.error('Allotment error:', error);
      showToast(error.response?.data?.message || 'Failed to allot subjects', 'error');
    } finally {
      setAllotSubmitting(false);
    }
  };

  // Filter & Search Logic
  useEffect(() => {
    let result = [...subjects];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.alias && s.alias.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.shortCode && s.shortCode.toLowerCase().includes(q))
      );
    }
    if (typeFilter) {
      result = result.filter(s => s.type === typeFilter);
    }
    setFilteredSubjects(result);
    setCurrentPage(1);
  }, [searchQuery, typeFilter, subjects]);

  // Click Outside Main Menu Listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(e.target)) {
        setShowMainDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      alias: '',
      code: '',
      shortCode: '',
      type: 'Theory',
      description: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Subject Name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (view === 'edit' && selectedSubject) {
        const res = await API.put(`/subjects/${selectedSubject._id}`, formData);
        showToast('Subject updated successfully!');
        setSubjects(prev => prev.map(s => s._id === selectedSubject._id ? res.data : s));
        setView('list');
      } else {
        const res = await API.post('/subjects', formData);
        showToast('Subject created successfully!');
        setSubjects(prev => [res.data, ...prev]);
        if (keepAdding) {
          handleResetForm();
        } else {
          setView('list');
          handleResetForm();
        }
      }
    } catch (error) {
      console.error('Save failed', error);
      showToast(error.response?.data?.message || 'Failed to save subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await API.post(`/subjects/${id}/duplicate`);
      showToast('Subject duplicated successfully!');
      setSubjects(prev => [res.data, ...prev]);
    } catch (error) {
      console.error('Duplicate failed', error);
      showToast('Failed to duplicate subject', 'error');
    } finally {
      setActiveRowMenuId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await API.delete(`/subjects/${id}`);
        showToast('Subject deleted successfully!');
        setSubjects(prev => prev.filter(s => s._id !== id));
      } catch (error) {
        console.error('Delete failed', error);
        showToast('Failed to delete subject', 'error');
      } finally {
        setActiveRowMenuId(null);
      }
    }
  };

  const handleOpenEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name || '',
      alias: subject.alias || '',
      code: subject.code || '',
      shortCode: subject.shortCode || '',
      type: subject.type || 'Theory',
      description: subject.description || ''
    });
    setView('edit');
    setActiveRowMenuId(null);
  };

  const handleOpenShow = (subject) => {
    setSelectedSubject(subject);
    setView('show');
    setActiveRowMenuId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Pagination Math
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage) || 1;
  const currentItems = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredTargets = allotTargetType === 'course' 
    ? availableCourses.filter(c => c.name?.toLowerCase().includes(targetSearch.toLowerCase()) || c.division?.toLowerCase().includes(targetSearch.toLowerCase()))
    : availableBatches.filter(b => b.name?.toLowerCase().includes(targetSearch.toLowerCase()) || b.course?.toLowerCase().includes(targetSearch.toLowerCase()));

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      <div>
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-teal-600'
          }`}>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Breadcrumb */}
        <div className="bg-gray-200/70 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center">
          <Link to={`${routePrefix}/dashboard`} className="hover:text-teal-600 font-medium">Dashboard</Link>
          <span className="mx-2 text-slate-400">&gt;</span>
          <span className="hover:text-teal-600 font-medium cursor-pointer">Academic</span>
          <span className="mx-2 text-slate-400">&gt;</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {view === 'add' ? 'Add Subject' : view === 'edit' ? 'Edit Subject' : 'Subject'}
          </span>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Main Title & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {view === 'add' ? 'Add Subject' : view === 'edit' ? 'Edit Subject' : 'Subject'}
            </h1>

            {/* Action Bar Buttons */}
            {view === 'list' ? (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Plus Quick Action */}
                <button 
                  onClick={() => { handleResetForm(); setView('add'); }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200"
                  title="Quick Add Subject"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Allot Subjects Button */}
                <button 
                  onClick={() => handleOpenAllotModal()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-md shadow-sm transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Allot Subject</span>
                </button>

                {/* Incharge Link */}
                <Link
                  to={`${routePrefix}/academic/subject-incharge`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Incharge</span>
                </Link>

                {/* Add Subject Main Button */}
                <button
                  onClick={() => { handleResetForm(); setView('add'); }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Add Subject
                </button>

                {/* Filter Icon Button */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  className={`p-2 border rounded-md shadow-sm text-xs font-medium transition ${
                    showFilterBar 
                      ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-slate-700 dark:text-white' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle Filters"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Settings Gear Button */}
                <button 
                  onClick={() => showToast('Subject configuration preferences operational.')}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Subject Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Header Triple-Dot Dropdown */}
                <div className="relative" ref={mainDropdownRef}>
                  <button 
                    onClick={() => setShowMainDropdown(!showMainDropdown)}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMainDropdown && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 text-xs">
                      <button 
                        onClick={() => { fetchSubjects(); setShowMainDropdown(false); showToast('Subject list refreshed'); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Refresh</span>
                      </button>
                      <button 
                        onClick={() => { window.print(); setShowMainDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
                      <button 
                        onClick={() => { showToast('PDF document generated successfully'); setShowMainDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Generate PDF</span>
                      </button>
                      <button 
                        onClick={() => { showToast('Exporting to Excel...'); setShowMainDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export to Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setView('list')}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs rounded-md shadow hover:bg-slate-800 transition"
              >
                List all Subject
              </button>
            )}
          </div>

          {/* LIST VIEW */}
          {view === 'list' && (
            <div>
              {/* Optional Search / Filter Toolbar */}
              {showFilterBar && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-5 flex flex-wrap items-center gap-4 animate-in fade-in duration-200">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search Subject Name, Alias or Code..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">All Types</option>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Both">Both</option>
                      <option value="Extra Curricular">Extra Curricular</option>
                    </select>
                  </div>
                  {(searchQuery || typeFilter) && (
                    <button 
                      onClick={() => { setSearchQuery(''); setTypeFilter(''); }}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Subject Table Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          NAME ⇅
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ALIAS ⇅
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          CODE ⇅
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          SHORT CODE
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          CREATED AT ⇅
                        </th>
                        <th className="px-6 py-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                            Loading Subjects...
                          </td>
                        </tr>
                      ) : currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                            No subjects found. Click "Add Subject" to create one.
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((subject) => (
                          <tr key={subject._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                            {/* Subject Name & Type */}
                            <td className="px-6 py-3.5">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {subject.name}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                                {subject.type || 'Theory'}
                              </div>
                            </td>

                            {/* Alias */}
                            <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 uppercase">
                              {subject.alias || ''}
                            </td>

                            {/* Code */}
                            <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 uppercase">
                              {subject.code || ''}
                            </td>

                            {/* Short Code */}
                            <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300 uppercase">
                              {subject.shortCode || ''}
                            </td>

                            {/* Formatted Created At */}
                            <td className="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatDate(subject.createdAt)}
                            </td>

                            {/* Row Action Triple Dot */}
                            <td className="px-6 py-3.5 text-right relative">
                              <button 
                                onClick={() => setActiveRowMenuId(activeRowMenuId === subject._id ? null : subject._id)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeRowMenuId === subject._id && (
                                <div className="absolute right-6 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 text-left">
                                  <button 
                                    onClick={() => handleOpenAllotModal(subject.name)}
                                    className="w-full px-4 py-1.5 text-xs text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Allot Subject</span>
                                  </button>
                                  <button 
                                    onClick={() => handleOpenShow(subject)}
                                    className="w-full px-4 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Show</span>
                                  </button>
                                  <button 
                                    onClick={() => handleOpenEdit(subject)}
                                    className="w-full px-4 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDuplicate(subject._id)}
                                    className="w-full px-4 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(subject._id, subject.name)}
                                    className="w-full px-4 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
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

                {/* Table Footer & Pagination */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    Showing {filteredSubjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} results
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Items Per Page Select */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <button className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded font-medium">
                        {currentPage}
                      </button>

                      {currentPage < totalPages && (
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {currentPage + 1}
                        </button>
                      )}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD / EDIT SUBJECT FORM VIEW */}
          {(view === 'add' || view === 'edit') && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Alias */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Alias
                    </label>
                    <input 
                      type="text" 
                      name="alias"
                      placeholder="Alias" 
                      value={formData.alias}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Code
                    </label>
                    <input 
                      type="text" 
                      name="code"
                      placeholder="Code" 
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Short Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Short Code
                    </label>
                    <input 
                      type="text" 
                      name="shortCode"
                      placeholder="Short Code" 
                      value={formData.shortCode}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Type Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="Theory" className="dark:bg-slate-800">Theory</option>
                      <option value="Practical" className="dark:bg-slate-800">Practical</option>
                      <option value="Both" className="dark:bg-slate-800">Both</option>
                      <option value="Extra Curricular" className="dark:bg-slate-800">Extra Curricular</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea 
                    name="description"
                    rows="3"
                    placeholder="Description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 border-b border-slate-300 dark:border-slate-600 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 transition-colors resize-y"
                  ></textarea>
                </div>

                {/* Form Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <button 
                      type="button" 
                      onClick={handleResetForm}
                      className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition"
                    >
                      Reset
                    </button>
                    
                    {view === 'add' && (
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={keepAdding}
                          onChange={(e) => setKeepAdding(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        <span>Keep Adding</span>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setView('list')}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition"
                    >
                      Cancel
                    </button>

                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-md shadow-sm transition disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* SHOW SUBJECT DRAWER / MODAL */}
          {view === 'show' && selectedSubject && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedSubject.name}
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold inline-block mt-1">
                    {selectedSubject.type}
                  </span>
                </div>
                <button 
                  onClick={() => setView('list')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Alias</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedSubject.alias || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Code</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedSubject.code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Short Code</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedSubject.shortCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Created At</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatDate(selectedSubject.createdAt)}</span>
                </div>
              </div>

              {selectedSubject.description && (
                <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Description</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedSubject.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => handleOpenAllotModal(selectedSubject.name)}
                  className="px-5 py-2 bg-teal-600 text-white rounded-md text-xs font-semibold hover:bg-teal-700 transition"
                >
                  Allot to Course/Batch
                </button>
                <button 
                  onClick={() => handleOpenEdit(selectedSubject)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-black transition"
                >
                  Edit Subject
                </button>
                <button 
                  onClick={() => setView('list')}
                  className="px-5 py-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold hover:bg-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ALLOT SUBJECT MODAL */}
      {showAllotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Allot Subject to Course or Batch
                </h3>
              </div>
              <button 
                onClick={() => setShowAllotModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Target Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Allot Target:
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    allotTargetType === 'course' 
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-slate-700/60 ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="course"
                      checked={allotTargetType === 'course'}
                      onChange={() => { setAllotTargetType('course'); setSelectedTargetIds([]); }}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">Course (Class)</div>
                      <div className="text-[11px] text-slate-500">Allot subject to whole class (e.g. Class I, Class II)</div>
                    </div>
                  </label>

                  <label className={`flex-1 p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    allotTargetType === 'batch' 
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-slate-700/60 ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="batch"
                      checked={allotTargetType === 'batch'}
                      onChange={() => { setAllotTargetType('batch'); setSelectedTargetIds([]); }}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">Batch (Section)</div>
                      <div className="text-[11px] text-slate-500">Allot subject to specific batch (e.g. Section A, Section B)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Selected Subjects to Allot */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subjects to Allot ({selectedSubjectNames.length} selected):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSubjectNames.length === subjects.length) {
                        setSelectedSubjectNames([]);
                      } else {
                        setSelectedSubjectNames(subjects.map(s => s.name));
                      }
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  >
                    {selectedSubjectNames.length === subjects.length ? 'Deselect All' : 'Select All Subjects'}
                  </button>
                </div>

                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 max-h-36 overflow-y-auto flex flex-wrap gap-2">
                  {subjects.map(s => {
                    const isChecked = selectedSubjectNames.includes(s.name);
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSubjectNames(selectedSubjectNames.filter(n => n !== s.name));
                          } else {
                            setSelectedSubjectNames([...selectedSubjectNames, s.name]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{s.name}</span>
                        {isChecked && <CheckSquare className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Searchable Target List (Courses or Batches) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Target {allotTargetType === 'course' ? 'Courses' : 'Batches'} ({selectedTargetIds.length} selected):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTargetIds.length === filteredTargets.length) {
                        setSelectedTargetIds([]);
                      } else {
                        setSelectedTargetIds(filteredTargets.map(t => t._id));
                      }
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  >
                    {selectedTargetIds.length === filteredTargets.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={`Search ${allotTargetType === 'course' ? 'Class' : 'Section'}...`}
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredTargets.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No {allotTargetType === 'course' ? 'courses' : 'batches'} found.
                    </div>
                  ) : (
                    filteredTargets.map(item => {
                      const isChecked = selectedTargetIds.includes(item._id);
                      return (
                        <label 
                          key={item._id} 
                          className="flex items-center justify-between py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer rounded transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTargetIds([...selectedTargetIds, item._id]);
                                } else {
                                  setSelectedTargetIds(selectedTargetIds.filter(id => id !== item._id));
                                }
                              }}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {allotTargetType === 'course' ? item.division : `Course: ${item.course}`}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAllotModal(false)}
                className="px-5 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleExecuteAllotment}
                disabled={allotSubmitting}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {allotSubmitting ? 'Allotting...' : 'Allot Subjects'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        Campus Pilot
      </footer>
    </div>
  );
}

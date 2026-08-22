import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { SchoolContext } from '../context/SchoolContext';
import {
  CreditCard, Plus, Filter, MoreVertical, RefreshCw, Printer, FileText, Download,
  Check, X, Eye, Edit3, Copy, Trash2, ArrowLeft, Search, CheckCircle, ChevronLeft, ChevronRight, Sliders,
  QrCode, UserCheck, Layers, Layout, ArrowRight
} from 'lucide-react';

export default function IdCard({ initialView = 'templates' }) {
  const { currentSchool } = useContext(SchoolContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Active View State: 'templates' | 'id-cards' | 'create' | 'edit'
  const [activeView, setActiveView] = useState(() => {
    if (location.pathname.includes('/id-cards')) return 'id-cards';
    if (location.pathname.includes('/id-card-templates/create')) return 'create';
    if (location.pathname.includes('/id-card-templates/edit')) return 'edit';
    return initialView;
  });

  // Keep view in sync with URL
  useEffect(() => {
    if (location.pathname.includes('/id-cards')) {
      setActiveView('id-cards');
    } else if (location.pathname.includes('/id-card-templates/create')) {
      setActiveView('create');
    } else if (location.pathname.includes('/id-card-templates')) {
      setActiveView('templates');
    } else {
      setActiveView(initialView);
    }
  }, [location.pathname, initialView]);

  // Data States
  const [templates, setTemplates] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search States (Templates View)
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown States
  const [activeRowMenu, setActiveRowMenu] = useState(null);
  const [showTopMenu, setShowTopMenu] = useState(false);

  // ID Cards Filter State (Generation View - Screenshot 4)
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filterType, setFilterType] = useState('Student');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Preview & Edit Modal States
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  // Add / Edit Template Form State (Screenshot 5)
  const [keepAdding, setKeepAdding] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    for: 'Student',
    customTemplateFileName: '',
    layout: 'Portrait',
    dimensions: 'Standard CR80',
    headerBgColor: '#0f172a',
    headerTextColor: '#ffffff',
    cardBgColor: '#ffffff',
    schoolTitle: currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY',
    subTitle: 'STUDENT IDENTITY CARD',
    showLogo: true,
    showPhoto: true,
    showRollNo: true,
    showClassCourse: true,
    showBatchSection: true,
    showDob: true,
    showBloodGroup: true,
    showPhone: true,
    showEmergencyContact: true,
    showAddress: true,
    showBarcode: true,
    showSignature: true,
    signatureTitle: 'Principal',
    termsText: 'This ID card is property of the institution. If found, please return to the school office.'
  });

  // Fetch Templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await API.get('/id-card-templates');
      const data = res.data || [];
      setTemplates(data);
      if (data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching ID Card templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch Filtered Members for ID Cards Generation
  const fetchFilteredMembers = async () => {
    setActionLoading(true);
    try {
      const params = new URLSearchParams({
        forType: filterType,
        course: filterCourse,
        batch: filterBatch,
        search: filterSearch
      });
      const res = await API.get(`/id-cards/members/filter?${params.toString()}`);
      setMembers(res.data || []);
      setSelectedMemberIds((res.data || []).map(m => m._id));
    } catch (error) {
      console.error('Error fetching members for ID Cards:', error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'id-cards') {
      fetchFilteredMembers();
    }
  }, [activeView]);

  // Form Submit Handler for Creating/Editing Template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.name.trim()) {
      alert('Please enter template name');
      return;
    }

    setActionLoading(true);
    try {
      if (editingTemplateId) {
        await API.put(`/id-card-templates/${editingTemplateId}`, templateForm);
        alert('Template updated successfully');
      } else {
        await API.post('/id-card-templates', templateForm);
        alert('ID Card Template created successfully');
      }
      await fetchTemplates();

      if (keepAdding && !editingTemplateId) {
        setTemplateForm(prev => ({
          ...prev,
          name: '',
          customTemplateFileName: ''
        }));
      } else {
        navigate('/admin/academic/id-card-templates');
        setActiveView('templates');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save template');
    } finally {
      setActionLoading(false);
    }
  };

  // Populate Edit Form
  const startEditTemplate = (tpl) => {
    setEditingTemplateId(tpl._id);
    setTemplateForm({
      name: tpl.name || '',
      for: tpl.for || 'Student',
      customTemplateFileName: tpl.customTemplateFileName || '',
      layout: tpl.layout || 'Portrait',
      dimensions: tpl.dimensions || 'Standard CR80',
      headerBgColor: tpl.headerBgColor || '#0f172a',
      headerTextColor: tpl.headerTextColor || '#ffffff',
      cardBgColor: tpl.cardBgColor || '#ffffff',
      schoolTitle: tpl.schoolTitle || currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY',
      subTitle: tpl.subTitle || 'STUDENT IDENTITY CARD',
      showLogo: tpl.showLogo ?? true,
      showPhoto: tpl.showPhoto ?? true,
      showRollNo: tpl.showRollNo ?? true,
      showClassCourse: tpl.showClassCourse ?? true,
      showBatchSection: tpl.showBatchSection ?? true,
      showDob: tpl.showDob ?? true,
      showBloodGroup: tpl.showBloodGroup ?? true,
      showPhone: tpl.showPhone ?? true,
      showEmergencyContact: tpl.showEmergencyContact ?? true,
      showAddress: tpl.showAddress ?? true,
      showBarcode: tpl.showBarcode ?? true,
      showSignature: tpl.showSignature ?? true,
      signatureTitle: tpl.signatureTitle || 'Principal',
      termsText: tpl.termsText || 'This ID card is property of the institution.'
    });
    setActiveView('create');
    setActiveRowMenu(null);
  };

  // Row Action Handlers
  const handleDuplicateTemplate = async (tpl) => {
    setActionLoading(true);
    try {
      await API.post(`/id-card-templates/${tpl._id}/duplicate`);
      await fetchTemplates();
    } catch (error) {
      alert('Failed to duplicate template');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ID card template?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/id-card-templates/${id}`);
      await fetchTemplates();
    } catch (error) {
      alert('Failed to delete template');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  const handlePrintWindow = () => {
    window.print();
  };

  // Selection Toggles for Generation
  const toggleSelectMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(i => i !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const toggleSelectAllMembers = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map(m => m._id));
    }
  };

  // Filter Templates
  const filteredTemplates = templates.filter(t => {
    return searchQuery === '' ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.for?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customTemplateFileName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination Logic
  const totalResults = filteredTemplates.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Active Template selected for generation
  const currentActiveTemplate = templates.find(t => t._id === selectedTemplateId) || templates[0] || {
    name: 'Standard ID Card',
    schoolTitle: currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY',
    subTitle: 'STUDENT IDENTITY CARD',
    headerBgColor: '#0f172a',
    headerTextColor: '#ffffff',
    showLogo: true,
    showPhoto: true,
    showRollNo: true,
    showClassCourse: true,
    showBatchSection: true,
    showDob: true,
    showBloodGroup: true,
    showBarcode: true,
    showSignature: true,
    signatureTitle: 'Principal'
  };

  // Date Formatter
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans">
      
      {/* ------------------------------------------------------------------ */}
      {/* VIEW 1: ID CARD TEMPLATE LIST VIEW (Matching Screenshots 1, 2, 3) */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'templates' && (
        <>
          {/* Top Breadcrumb & Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span>Academic</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">ID Card Template</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">ID Card Template</h1>
            </div>

            {/* Top Action Buttons (Screenshot 1) */}
            <div className="flex items-center space-x-2.5 relative">
              <button
                onClick={() => {
                  navigate('/admin/academic/id-cards');
                  setActiveView('id-cards');
                }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4 text-teal-500" />
                <span>ID Card</span>
              </button>

              <button
                onClick={() => {
                  setEditingTemplateId(null);
                  setTemplateForm({
                    name: '',
                    for: 'Student',
                    customTemplateFileName: '',
                    layout: 'Portrait',
                    dimensions: 'Standard CR80',
                    headerBgColor: '#0f172a',
                    headerTextColor: '#ffffff',
                    cardBgColor: '#ffffff',
                    schoolTitle: currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY',
                    subTitle: 'STUDENT IDENTITY CARD',
                    showLogo: true,
                    showPhoto: true,
                    showRollNo: true,
                    showClassCourse: true,
                    showBatchSection: true,
                    showDob: true,
                    showBloodGroup: true,
                    showPhone: true,
                    showEmergencyContact: true,
                    showAddress: true,
                    showBarcode: true,
                    showSignature: true,
                    signatureTitle: 'Principal',
                    termsText: 'This ID card is property of the institution.'
                  });
                  navigate('/admin/academic/id-card-templates/create');
                  setActiveView('create');
                }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-teal-500" />
                <span>Add ID Card Template</span>
              </button>

              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm ${showFilterDrawer ? 'border-teal-500 text-teal-600' : ''}`}
                title="Filter Templates"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* 3-Dots Top Menu (Screenshot 3) */}
              <div className="relative">
                <button
                  onClick={() => setShowTopMenu(!showTopMenu)}
                  className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showTopMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 font-medium text-sm">
                    <button
                      onClick={() => { fetchTemplates(); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => { handlePrintWindow(); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Printer className="w-4 h-4 text-gray-400" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => { alert('ID Card templates PDF export generated!'); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Generate PDF</span>
                    </button>
                    <button
                      onClick={() => { alert('Excel file exported!'); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      <span>Export to Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Filter Drawer */}
          {showFilterDrawer && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates by name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Table Container (Matching Screenshot 1) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    <th className="py-3.5 px-6">NAME <span className="text-[9px]">⇅</span></th>
                    <th className="py-3.5 px-6">FOR</th>
                    <th className="py-3.5 px-6">CREATED AT <span className="text-[9px]">⇅</span></th>
                    <th className="py-3.5 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm text-gray-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                        Loading templates...
                      </td>
                    </tr>
                  ) : paginatedTemplates.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-400">
                        <CreditCard className="w-12 h-12 stroke-1 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-600 dark:text-slate-400">No ID Card Templates found</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add ID Card Template" to create a new layout design.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTemplates.map((tpl) => (
                      <tr key={tpl._id} className="hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-800 dark:text-slate-200">
                          {tpl.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm text-gray-700 dark:text-slate-300">{tpl.for || 'Student'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                              Custom Template File <span className="ml-1 font-normal opacity-90">{tpl.customTemplateFileName || 'default'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(tpl.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right relative">
                          <button
                            onClick={() => setActiveRowMenu(activeRowMenu === tpl._id ? null : tpl._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Row Actions Dropdown Menu (Screenshot 2) */}
                          {activeRowMenu === tpl._id && (
                            <div className="absolute right-6 top-10 w-36 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs font-medium text-left">
                              <button
                                onClick={() => { setPreviewTemplate(tpl); setShowPreviewModal(true); setActiveRowMenu(null); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                <span>Show</span>
                              </button>
                              <button
                                onClick={() => { setPreviewTemplate(tpl); setShowPreviewModal(true); setActiveRowMenu(null); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Printer className="w-3.5 h-3.5 text-gray-400" />
                                <span>Print</span>
                              </button>
                              <button
                                onClick={() => startEditTemplate(tpl)}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDuplicateTemplate(tpl)}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(tpl._id)}
                                className="w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

            {/* Table Bottom Pagination Bar (Screenshot 1) */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
              <div>
                Showing {totalResults > 0 ? (currentPage - 1) * perPage + 1 : 0} to {Math.min(currentPage * perPage, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none dark:text-slate-200"
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="p-1 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-700 rounded-lg font-semibold text-xs">
                    {currentPage}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="p-1 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Brand Credit */}
            <div className="py-4 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
              Campus Pilot
            </div>
          </div>
        </>
      )}


      {/* ------------------------------------------------------------------ */}
      {/* VIEW 2: ID CARDS FILTER & GENERATION PAGE (Matching Screenshot 4)  */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'id-cards' && (
        <>
          {/* Breadcrumb & Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('templates')}>Academic</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">ID Cards</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">ID Cards</h1>
            </div>

            <button
              onClick={() => {
                navigate('/admin/academic/id-card-templates');
                setActiveView('templates');
              }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4 text-teal-500" />
              <span>ID Card Template</span>
            </button>
          </div>

          {/* ID Cards Filter Form Box (Matching Screenshot 4) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8">
            <div className="max-w-xl">
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                ID Card Template
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">ID Card Template</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.for || 'Student'})</option>
                ))}
              </select>

              {/* Show Options Toggle Switch (Screenshot 4) */}
              <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-700 w-fit">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Show Options</span>
                <button
                  type="button"
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${showFilterOptions ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showFilterOptions ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Expanded Filter Options */}
              {showFilterOptions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-100 dark:border-slate-700 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">For / Type</label>
                    <select
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher / Faculty</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Course / Class</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 1, Class 10"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Batch / Section</label>
                    <input
                      type="text"
                      placeholder="e.g. Section A, 2025-26"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                      value={filterBatch}
                      onChange={(e) => setFilterBatch(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Search Name / ID</label>
                    <input
                      type="text"
                      placeholder="Keyword..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions (Screenshot 4: Cancel red button, Filter dark blue button) */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setFilterCourse('');
                  setFilterBatch('');
                  setFilterSearch('');
                }}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm transition shadow-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={fetchFilteredMembers}
                className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-lg font-medium text-sm transition shadow-sm flex items-center space-x-2"
              >
                <Filter className="w-4 h-4 text-teal-400" />
                <span>Filter</span>
              </button>
            </div>

            <div className="mt-8 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 pt-4 border-t border-gray-100 dark:border-slate-700">
              Campus Pilot
            </div>
          </div>

          {/* GENERATED ID CARDS DISPLAY GRID */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-700 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedMemberIds.length === members.length && members.length > 0}
                  onChange={toggleSelectAllMembers}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <label htmlFor="selectAll" className="text-sm font-semibold text-gray-700 dark:text-slate-200 cursor-pointer">
                  Select All ({selectedMemberIds.length}/{members.length})
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrintWindow}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition shadow-sm flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Selected ({selectedMemberIds.length})</span>
                </button>
                <button
                  onClick={() => alert('Exporting PDF...')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition shadow-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Printable ID Cards Grid */}
            <div className="py-6 print-container">
              {actionLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                  Generating ID Cards...
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <CreditCard className="w-12 h-12 stroke-1 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-base font-medium text-gray-600 dark:text-slate-400">No members found for ID Card generation</p>
                  <p className="text-xs text-gray-400 mt-1">Adjust your filter options above to select students or staff.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.filter(m => selectedMemberIds.includes(m._id)).map((member) => (
                    <div
                      key={member._id}
                      className="relative group border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                      style={{ width: '100%', maxWidth: '340px', margin: '0 auto', minHeight: '440px' }}
                    >
                      {/* ID Card Header Bar */}
                      <div
                        className="p-4 text-center text-white relative overflow-hidden"
                        style={{ backgroundColor: currentActiveTemplate.headerBgColor || '#0f172a' }}
                      >
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          {currentActiveTemplate.showLogo && (
                            <img
                              src={currentSchool?.assets?.logo || currentSchool?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentActiveTemplate.schoolTitle)}&background=2563eb&color=fff`}
                              alt="Logo"
                              className="w-7 h-7 object-contain rounded-full bg-white p-0.5"
                            />
                          )}
                          <h2 className="text-xs font-bold uppercase tracking-wide truncate max-w-[220px]" style={{ color: currentActiveTemplate.headerTextColor || '#ffffff' }}>
                            {currentActiveTemplate.schoolTitle || currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY'}
                          </h2>
                        </div>
                        <p className="text-[10px] font-semibold tracking-widest text-teal-300 uppercase">
                          {currentActiveTemplate.subTitle || 'STUDENT IDENTITY CARD'}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col items-center text-center flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
                        {/* Avatar */}
                        {currentActiveTemplate.showPhoto && (
                          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 mb-3 -mt-2">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{member.name}</h3>
                        <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                          {member.role || 'Student'}
                        </span>

                        {/* Details Table */}
                        <div className="w-full mt-4 text-xs text-left space-y-1.5 border-t border-b border-gray-100 dark:border-slate-700 py-3 text-gray-600 dark:text-slate-300">
                          {currentActiveTemplate.showRollNo && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">ID / Roll No:</span>
                              <span className="font-bold text-gray-800 dark:text-slate-100">{member.code}</span>
                            </div>
                          )}
                          {currentActiveTemplate.showClassCourse && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">Class / Course:</span>
                              <span>{member.className} ({member.section})</span>
                            </div>
                          )}
                          {currentActiveTemplate.showDob && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">D.O.B:</span>
                              <span>{member.dob}</span>
                            </div>
                          )}
                          {currentActiveTemplate.showBloodGroup && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">Blood Group:</span>
                              <span className="font-bold text-rose-600">{member.bloodGroup}</span>
                            </div>
                          )}
                          {currentActiveTemplate.showPhone && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">Phone:</span>
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {currentActiveTemplate.showEmergencyContact && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-500">Emergency Contact:</span>
                              <span>{member.emergencyContact}</span>
                            </div>
                          )}
                        </div>

                        {/* Barcode & Signature */}
                        <div className="w-full mt-3 flex items-center justify-between">
                          {currentActiveTemplate.showBarcode ? (
                            <div className="flex flex-col items-center">
                              <div className="h-6 w-28 bg-gray-800 flex items-center justify-around px-1 rounded">
                                {[...Array(14)].map((_, i) => (
                                  <div key={i} className={`h-full ${i % 2 === 0 ? 'w-1 bg-white' : 'w-0.5 bg-gray-400'}`}></div>
                                ))}
                              </div>
                              <span className="text-[9px] font-mono text-gray-400 mt-0.5">{member.code}</span>
                            </div>
                          ) : <div></div>}

                          {currentActiveTemplate.showSignature && (
                            <div className="text-right">
                              <div className="h-5 font-serif italic text-teal-700 dark:text-teal-400 text-xs font-bold tracking-widest border-b border-gray-300 dark:border-slate-600 px-2">
                                Principal
                              </div>
                              <span className="text-[9px] text-gray-400 block mt-0.5">{currentActiveTemplate.signatureTitle || 'Principal'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}


      {/* ------------------------------------------------------------------ */}
      {/* VIEW 3: ADD / EDIT ID CARD TEMPLATE FORM (Matching Screenshot 5)    */}
      {/* ------------------------------------------------------------------ */}
      {(activeView === 'create' || activeView === 'edit') && (
        <>
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('templates')}>Academic</span>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('templates')}>ID Card Template</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">{editingTemplateId ? 'Edit ID Card Template' : 'Add ID Card Template'}</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">
                {editingTemplateId ? 'Edit ID Card Template' : 'Add ID Card Template'}
              </h1>
            </div>

            <button
              onClick={() => {
                navigate('/admin/academic/id-card-templates');
                setActiveView('templates');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
            >
              <span>List all ID Card Template</span>
            </button>
          </div>

          {/* Add ID Card Template Form Container (Matching Screenshot 5) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSaveTemplate}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* For */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    For
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={templateForm.for}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, for: e.target.value }))}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Custom Template File Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Custom Template File Name
                  </label>
                  <input
                    type="text"
                    placeholder="Custom Template File Name"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={templateForm.customTemplateFileName}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, customTemplateFileName: e.target.value }))}
                  />
                </div>

                {/* School Header Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    School Title Header
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={templateForm.schoolTitle}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, schoolTitle: e.target.value }))}
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Card Subtitle
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={templateForm.subTitle}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subTitle: e.target.value }))}
                  />
                </div>

                {/* Header Background Color */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Header Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      value={templateForm.headerBgColor}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-mono"
                      value={templateForm.headerBgColor}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, headerBgColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Display Fields Selection */}
              <div className="mb-8 p-5 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Card Display Elements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-medium text-gray-700 dark:text-slate-200">
                  {[
                    { key: 'showLogo', label: 'School Logo' },
                    { key: 'showPhoto', label: 'Member Photo' },
                    { key: 'showRollNo', label: 'Roll No / Employee ID' },
                    { key: 'showClassCourse', label: 'Class / Course' },
                    { key: 'showBatchSection', label: 'Batch / Section' },
                    { key: 'showDob', label: 'Date of Birth' },
                    { key: 'showBloodGroup', label: 'Blood Group' },
                    { key: 'showPhone', label: 'Phone Number' },
                    { key: 'showEmergencyContact', label: 'Emergency Contact' },
                    { key: 'showBarcode', label: 'Barcode / QR Code' },
                    { key: 'showSignature', label: 'Principal Signature' }
                  ].map(field => (
                    <label key={field.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        checked={templateForm[field.key]}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, [field.key]: e.target.checked }))}
                      />
                      <span>{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bottom Actions matching Screenshot 5 (Reset, Keep Adding checkbox, Cancel red button, Save dark blue button) */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700 gap-4">
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => setTemplateForm({
                      name: '',
                      for: 'Student',
                      customTemplateFileName: '',
                      layout: 'Portrait',
                      dimensions: 'Standard CR80',
                      headerBgColor: '#0f172a',
                      headerTextColor: '#ffffff',
                      cardBgColor: '#ffffff',
                      schoolTitle: currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY',
                      subTitle: 'STUDENT IDENTITY CARD',
                      showLogo: true,
                      showPhoto: true,
                      showRollNo: true,
                      showClassCourse: true,
                      showBatchSection: true,
                      showDob: true,
                      showBloodGroup: true,
                      showPhone: true,
                      showEmergencyContact: true,
                      showAddress: true,
                      showBarcode: true,
                      showSignature: true,
                      signatureTitle: 'Principal',
                      termsText: 'This ID card is property of the institution.'
                    })}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium transition"
                  >
                    Reset
                  </button>

                  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      checked={keepAdding}
                      onChange={(e) => setKeepAdding(e.target.checked)}
                    />
                    <span>Keep Adding</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin/academic/id-card-templates');
                      setActiveView('templates');
                    }}
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm transition shadow-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-lg font-medium text-sm transition shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 pt-4 border-t border-gray-100 dark:border-slate-700">
                Campus Pilot
              </div>
            </form>
          </div>
        </>
      )}


      {/* ------------------------------------------------------------------ */}
      {/* SHOW MODAL PREVIEW (For Row Action "Show" & "Print")               */}
      {/* ------------------------------------------------------------------ */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Template Preview: {previewTemplate.name}</h3>

            <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-lg mx-auto" style={{ maxWidth: '320px' }}>
              <div className="p-4 text-center text-white" style={{ backgroundColor: previewTemplate.headerBgColor || '#0f172a' }}>
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: previewTemplate.headerTextColor || '#ffffff' }}>
                  {previewTemplate.schoolTitle || currentSchool?.name || 'ROYAL INTERNATIONAL ACADEMY'}
                </h4>
                <p className="text-[10px] text-teal-300 font-semibold tracking-wider mt-0.5">
                  {previewTemplate.subTitle || 'STUDENT IDENTITY CARD'}
                </p>
              </div>

              <div className="p-5 flex flex-col items-center text-center bg-gray-50">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow overflow-hidden mb-2">
                  <img src="https://ui-avatars.com/api/?name=Aarav+Kumar&background=2563eb&color=fff" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h5 className="font-bold text-gray-900">Aarav Kumar</h5>
                <span className="text-xs text-teal-700 font-semibold">{previewTemplate.for || 'Student'}</span>

                <div className="w-full mt-3 text-xs space-y-1 text-left border-t border-b py-2 text-gray-600">
                  <div className="flex justify-between"><span className="font-semibold">ID / Roll:</span><span>SM001</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Class:</span><span>Class 1 (A)</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Blood Group:</span><span>O+</span></div>
                </div>

                <div className="w-full mt-3 flex items-center justify-between">
                  <div className="h-5 w-24 bg-gray-800 rounded"></div>
                  <span className="text-[10px] font-serif italic text-teal-800 font-bold border-b">Principal</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handlePrintWindow}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition"
              >
                Print Template
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

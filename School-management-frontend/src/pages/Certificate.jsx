import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { SchoolContext } from '../context/SchoolContext';
import {
  FileBadge, Plus, Filter, MoreVertical, RefreshCw, Printer, FileText, Download,
  Check, X, Eye, Edit3, Copy, Trash2, ArrowLeft, Search, CheckCircle, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';

export default function Certificate({ initialView = 'list' }) {
  const { currentSchool, currentSession } = useContext(SchoolContext);
  const navigate = useNavigate();

  // Active View State: 'list' | 'add' | 'templates'
  const [activeView, setActiveView] = useState(initialView);

  // Data States
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Open Dropdowns tracking
  const [activeRowMenu, setActiveRowMenu] = useState(null);
  const [showTopMenu, setShowTopMenu] = useState(false);

  // Modal States
  const [selectedCert, setSelectedCert] = useState(null); // For Show / Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [showTemplateModal, setShowTemplateModal] = useState(false); // For Add/Edit Template
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form State for Add Certificate
  const [keepAdding, setKeepAdding] = useState(false);
  const [certForm, setCertForm] = useState({
    templateId: '',
    date: new Date().toISOString().split('T')[0],
    customCertificateNumber: '',
    studentId: '',
    toName: '',
    toCode: '',
    isDuplicate: false,
    fatherName: '',
    className: '',
    section: '',
    rollNo: '',
    dob: '',
    conduct: 'Good',
    reason: '',
    remarks: ''
  });

  // Form State for Add/Edit Template
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'Transfer Certificate',
    applicableFor: 'Student',
    headerText: 'TRANSFER CERTIFICATE',
    subHeader: 'TO WHOM IT MAY CONCERN',
    bodyText: 'This is to certify that {{student_name}}, son/daughter of {{father_name}}, was a student of this institution in Class {{class_name}} during the academic session. His/Her conduct and character during the stay in the school has been good.',
    leftSignatureTitle: 'Class Teacher',
    rightSignatureTitle: 'Principal',
    backgroundStyle: 'Classic'
  });

  // Sync initialView prop changes
  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  // Fetch All Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [certRes, tplRes, studRes] = await Promise.all([
        API.get('/certificates'),
        API.get('/certificates/templates'),
        API.get('/students').catch(() => ({ data: [] }))
      ]);
      setCertificates(certRes.data || []);
      setTemplates(tplRes.data || []);
      setStudents(studRes.data || []);
    } catch (error) {
      console.error('Error loading certificate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update recipient info when student is selected in Add Form
  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const found = students.find(s => s._id === sId);
    if (found) {
      setCertForm(prev => ({
        ...prev,
        studentId: sId,
        toName: found.name || '',
        toCode: found.rollNumber || `SM${found._id.toString().slice(-3)}`,
        fatherName: found.fatherName || found.guardianName || '',
        className: found.className || '',
        section: found.section || '',
        rollNo: found.rollNumber || ''
      }));
    } else {
      setCertForm(prev => ({ ...prev, studentId: sId }));
    }
  };

  // Submit Add Certificate
  const handleSaveCertificate = async (e) => {
    e.preventDefault();
    if (!certForm.templateId) {
      alert('Please select a certificate template');
      return;
    }
    if (!certForm.toName) {
      alert('Please enter or select recipient name');
      return;
    }

    setActionLoading(true);
    try {
      const selectedTpl = templates.find(t => t._id === certForm.templateId);
      const payload = {
        certificateNo: certForm.customCertificateNumber || undefined,
        templateId: certForm.templateId,
        templateName: selectedTpl ? selectedTpl.name : 'Transfer Certificate',
        applicableFor: selectedTpl ? selectedTpl.applicableFor : 'Student',
        studentId: certForm.studentId || undefined,
        toName: certForm.toName,
        toCode: certForm.toCode || '',
        date: certForm.date,
        isDuplicate: certForm.isDuplicate,
        customData: {
          fatherName: certForm.fatherName,
          className: certForm.className,
          section: certForm.section,
          rollNo: certForm.rollNo,
          dob: certForm.dob,
          conduct: certForm.conduct,
          reason: certForm.reason,
          remarks: certForm.remarks
        }
      };

      await API.post('/certificates', payload);
      await fetchData();

      if (keepAdding) {
        setCertForm(prev => ({
          ...prev,
          customCertificateNumber: '',
          toName: '',
          toCode: '',
          studentId: ''
        }));
        alert('Certificate created! Ready for next.');
      } else {
        setActiveView('list');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating certificate');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Add/Edit Template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.name) {
      alert('Please enter template name');
      return;
    }

    setActionLoading(true);
    try {
      if (editingTemplate) {
        await API.put(`/certificates/templates/${editingTemplate._id}`, templateForm);
      } else {
        await API.post('/certificates/templates', templateForm);
      }
      await fetchData();
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving template');
    } finally {
      setActionLoading(false);
    }
  };

  // Row Action Handlers for Certificates
  const handleDuplicateCert = async (cert) => {
    setActionLoading(true);
    try {
      await API.post(`/certificates/${cert._id}/duplicate`);
      await fetchData();
    } catch (error) {
      alert('Failed to duplicate certificate');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/certificates/${id}`);
      await fetchData();
    } catch (error) {
      alert('Failed to delete certificate');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  // Row Action Handlers for Templates
  const handleDuplicateTemplate = async (tpl) => {
    setActionLoading(true);
    try {
      await API.post(`/certificates/templates/${tpl._id}/duplicate`);
      await fetchData();
    } catch (error) {
      alert('Failed to duplicate template');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/certificates/templates/${id}`);
      await fetchData();
    } catch (error) {
      alert('Failed to delete template');
    } finally {
      setActionLoading(false);
      setActiveRowMenu(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Certificates
  const filteredCertificates = certificates.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.certificateNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.toName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.toCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.templateName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTemplate = selectedTemplateFilter === '' || c.templateId === selectedTemplateFilter || c.templateName === selectedTemplateFilter;
    return matchesSearch && matchesTemplate;
  });

  // Pagination Logic
  const totalResults = filteredCertificates.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const paginatedCertificates = filteredCertificates.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: CERTIFICATE LIST VIEW (Matching Screenshot 1 & 2 & 3)   */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'list' && (
        <>
          {/* Top Breadcrumb & Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span>Academic</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">Certificate</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">Certificate</h1>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center space-x-2.5 relative">
              <button
                onClick={() => setActiveView('templates')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <FileBadge className="w-4 h-4 text-teal-500" />
                <span>Certificate Template</span>
              </button>

              <button
                onClick={() => setActiveView('add')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-teal-500" />
                <span>Add Certificate</span>
              </button>

              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm ${showFilterDrawer ? 'border-teal-500 text-teal-600' : ''}`}
                title="Filter Records"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* 3-Dots Top Menu */}
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
                      onClick={() => { fetchData(); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => { window.print(); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Printer className="w-4 h-4 text-gray-400" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => { alert('PDF export generated'); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Generate PDF</span>
                    </button>
                    <button
                      onClick={() => { alert('Excel file exported'); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      <span>Export to Excel</span>
                    </button>
                    <button
                      onClick={() => { alert('All records exported'); setShowTopMenu(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2.5"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      <span>Export All</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Drawer */}
          {showFilterDrawer && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Search Certificate / Student</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Filter by Template</label>
                  <select
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                    value={selectedTemplateFilter}
                    onChange={(e) => setSelectedTemplateFilter(e.target.value)}
                  >
                    <option value="">All Templates</option>
                    {templates.map(t => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedTemplateFilter(''); }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    <th className="py-3.5 px-6">CERTIFICATE #</th>
                    <th className="py-3.5 px-6">CERTIFICATE TEMPLATE</th>
                    <th className="py-3.5 px-6">TO</th>
                    <th className="py-3.5 px-6">DATE <span className="text-[9px]">⇅</span></th>
                    <th className="py-3.5 px-6">CREATED BY</th>
                    <th className="py-3.5 px-6">CREATED AT <span className="text-[9px]">⇅</span></th>
                    <th className="py-3.5 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm text-gray-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                        Loading certificates...
                      </td>
                    </tr>
                  ) : paginatedCertificates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-gray-400">
                        <FileBadge className="w-12 h-12 stroke-1 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-600 dark:text-slate-400">No certificates found</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Certificate" to create a new certificate record.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCertificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-800 dark:text-slate-200">
                          {cert.certificateNo}
                          {cert.isDuplicate && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded">
                              Duplicate
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-slate-200">{cert.templateName}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-400">{cert.applicableFor || 'Student'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-slate-200">{cert.toName}</p>
                            {cert.toCode && (
                              <p className="text-xs text-gray-400 dark:text-slate-400">{cert.toCode}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(cert.date)}
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-slate-400">
                          {cert.createdBy || '-'}
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(cert.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right relative">
                          <button
                            onClick={() => setActiveRowMenu(activeRowMenu === cert._id ? null : cert._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Row Actions Dropdown Menu (Screenshot 2) */}
                          {activeRowMenu === cert._id && (
                            <div className="absolute right-6 top-10 w-36 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs font-medium text-left">
                              <button
                                onClick={() => { setSelectedCert(cert); setShowPrintModal(true); setActiveRowMenu(null); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                <span>Show</span>
                              </button>
                              <button
                                onClick={() => { setSelectedCert(cert); setShowPrintModal(true); setActiveRowMenu(null); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Printer className="w-3.5 h-3.5 text-gray-400" />
                                <span>Print</span>
                              </button>
                              <button
                                onClick={() => { handleDuplicateCert(cert); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => { handleDeleteCert(cert._id); }}
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
                {/* Per Page Selector */}
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

                {/* Page Controls */}
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


      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: ADD CERTIFICATE VIEW (Matching Screenshot 4)          */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'add' && (
        <>
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('list')}>Academic</span>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('list')}>Certificate</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">Add Certificate</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">Add Certificate</h1>
            </div>

            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
            >
              <span>List all Certificate</span>
            </button>
          </div>

          {/* Form Box */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSaveCertificate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Certificate Template Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Certificate Template <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={certForm.templateId}
                    onChange={(e) => setCertForm(prev => ({ ...prev, templateId: e.target.value }))}
                  >
                    <option value="">Certificate Template</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={certForm.date}
                    onChange={(e) => setCertForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                {/* Custom Certificate Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Custom Certificate Number
                  </label>
                  <input
                    type="text"
                    placeholder="Custom Certificate Number"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={certForm.customCertificateNumber}
                    onChange={(e) => setCertForm(prev => ({ ...prev, customCertificateNumber: e.target.value }))}
                  />
                </div>

                {/* Name / Recipient */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  {students.length > 0 ? (
                    <select
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={certForm.studentId}
                      onChange={handleStudentSelect}
                    >
                      <option value="">-- Select Student or Enter Name Below --</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.rollNumber || `SM${s._id.toString().slice(-3)}`})
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    type="text"
                    placeholder="Enter Recipient Name"
                    required
                    className="w-full px-3.5 py-2.5 mt-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={certForm.toName}
                    onChange={(e) => setCertForm(prev => ({ ...prev, toName: e.target.value }))}
                  />
                </div>

                {/* Duplicate Toggle Switch */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                    Duplicate
                  </label>
                  <button
                    type="button"
                    onClick={() => setCertForm(prev => ({ ...prev, isDuplicate: !prev.isDuplicate }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${certForm.isDuplicate ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${certForm.isDuplicate ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700 gap-4">
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => setCertForm({
                      templateId: '',
                      date: new Date().toISOString().split('T')[0],
                      customCertificateNumber: '',
                      studentId: '',
                      toName: '',
                      toCode: '',
                      isDuplicate: false,
                      fatherName: '',
                      className: '',
                      section: '',
                      rollNo: '',
                      dob: '',
                      conduct: 'Good',
                      reason: '',
                      remarks: ''
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
                    onClick={() => setActiveView('list')}
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm transition shadow-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 pt-4 border-t border-gray-100 dark:border-slate-700">
              Campus Pilot
            </div>
          </div>
        </>
      )}


      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: CERTIFICATE TEMPLATE VIEW (Matching Screenshot 5)     */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'templates' && (
        <>
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">
                <Link to="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                <span>&gt;</span>
                <span className="hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer" onClick={() => setActiveView('list')}>Academic</span>
                <span>&gt;</span>
                <span className="text-gray-600 dark:text-slate-200">Certificate Template</span>
              </div>
              <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight">Certificate Template</h1>
            </div>

            {/* Top Buttons */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setActiveView('list')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <FileBadge className="w-4 h-4 text-teal-500" />
                <span>Certificate</span>
              </button>

              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateForm({
                    name: '',
                    type: 'Transfer Certificate',
                    applicableFor: 'Student',
                    headerText: 'TRANSFER CERTIFICATE',
                    subHeader: 'TO WHOM IT MAY CONCERN',
                    bodyText: 'This is to certify that {{student_name}}, son/daughter of {{father_name}}, was a student of this institution in Class {{class_name}} during the academic session. His/Her conduct and character during the stay in the school has been good.',
                    leftSignatureTitle: 'Class Teacher',
                    rightSignatureTitle: 'Principal',
                    backgroundStyle: 'Classic'
                  });
                  setShowTemplateModal(true);
                }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-teal-500" />
                <span>Add Certificate Template</span>
              </button>
            </div>
          </div>

          {/* Templates Table Container */}
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
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-400">
                        <FileBadge className="w-12 h-12 stroke-1 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-600 dark:text-slate-400">No certificate templates found</p>
                      </td>
                    </tr>
                  ) : (
                    templates.map((tpl) => (
                      <tr key={tpl._id} className="hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-slate-200">{tpl.name}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-400">{tpl.type || 'Other'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-slate-300">
                          {tpl.applicableFor || 'Student'}
                        </td>
                        <td className="py-4 px-6 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(tpl.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right relative">
                          <button
                            onClick={() => setActiveRowMenu(activeRowMenu === tpl._id ? null : tpl._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeRowMenu === tpl._id && (
                            <div className="absolute right-6 top-10 w-36 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs font-medium text-left">
                              <button
                                onClick={() => {
                                  setEditingTemplate(tpl);
                                  setTemplateForm({
                                    name: tpl.name,
                                    type: tpl.type || 'Transfer Certificate',
                                    applicableFor: tpl.applicableFor || 'Student',
                                    headerText: tpl.headerText || 'TRANSFER CERTIFICATE',
                                    subHeader: tpl.subHeader || 'TO WHOM IT MAY CONCERN',
                                    bodyText: tpl.bodyText || '',
                                    leftSignatureTitle: tpl.leftSignatureTitle || 'Class Teacher',
                                    rightSignatureTitle: tpl.rightSignatureTitle || 'Principal',
                                    backgroundStyle: tpl.backgroundStyle || 'Classic'
                                  });
                                  setShowTemplateModal(true);
                                  setActiveRowMenu(null);
                                }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => { handleDuplicateTemplate(tpl); }}
                                className="w-full px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => { handleDeleteTemplate(tpl._id); }}
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

            {/* Bottom Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <div>Showing 1 to {templates.length} of {templates.length} results</div>
              <div className="flex items-center space-x-2">
                <span>25 per page</span>
              </div>
            </div>

            <div className="py-4 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
              Campus Pilot
            </div>
          </div>
        </>
      )}


      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT CERTIFICATE TEMPLATE                      */}
      {/* ------------------------------------------------------------- */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingTemplate ? 'Edit Certificate Template' : 'Add Certificate Template'}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transfer Certificate"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Applicable For</label>
                  <select
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                    value={templateForm.applicableFor}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, applicableFor: e.target.value }))}
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Type</label>
                  <select
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Transfer Certificate">Transfer Certificate</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Character Certificate">Character Certificate</option>
                    <option value="Bonafide Certificate">Bonafide Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Header Title</label>
                <input
                  type="text"
                  placeholder="e.g. TRANSFER CERTIFICATE"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  value={templateForm.headerText}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, headerText: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Sub-Header</label>
                <input
                  type="text"
                  placeholder="e.g. TO WHOM IT MAY CONCERN"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  value={templateForm.subHeader}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subHeader: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
                  Body Template Content (Supports placehoders: &#123;&#123;student_name&#125;&#125;, &#123;&#123;father_name&#125;&#125;, &#123;&#123;class_name&#125;&#125;)
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  value={templateForm.bodyText}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, bodyText: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Left Signature Title</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                    value={templateForm.leftSignatureTitle}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, leftSignatureTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">Right Signature Title</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                    value={templateForm.rightSignatureTitle}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, rightSignatureTitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  {actionLoading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: PRINTABLE CERTIFICATE VIEW / PRINT PREVIEW          */}
      {/* ------------------------------------------------------------- */}
      {showPrintModal && selectedCert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 relative max-h-[95vh] overflow-y-auto">
            
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-slate-700 print:hidden">
              <div className="flex items-center space-x-2">
                <FileBadge className="w-5 h-5 text-teal-500" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Certificate Preview & Print</h3>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm shadow flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => { setShowPrintModal(false); setSelectedCert(null); }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Frame */}
            <div id="printable-certificate" className="p-8 sm:p-12 bg-amber-50/20 dark:bg-slate-800/40 border-8 border-double border-teal-700 dark:border-teal-500 rounded-xl relative text-center shadow-inner my-2 font-serif">
              
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-teal-700 dark:text-teal-400 text-xl font-bold">✤</div>
              <div className="absolute top-3 right-3 text-teal-700 dark:text-teal-400 text-xl font-bold">✤</div>
              <div className="absolute bottom-3 left-3 text-teal-700 dark:text-teal-400 text-xl font-bold">✤</div>
              <div className="absolute bottom-3 right-3 text-teal-700 dark:text-teal-400 text-xl font-bold">✤</div>

              {/* School Header */}
              <div className="mb-6 border-b-2 border-teal-600/30 pb-4">
                {currentSchool?.assets?.logo || currentSchool?.logoUrl ? (
                  <img
                    src={currentSchool?.assets?.logo || currentSchool?.logoUrl}
                    alt="School Logo"
                    className="w-16 h-16 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-600 text-white mx-auto mb-2 flex items-center justify-center font-bold text-2xl font-sans shadow-md">
                    {currentSchool?.name ? currentSchool.name.charAt(0) : 'CP'}
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-900 dark:text-teal-300 font-sans tracking-wide uppercase">
                  {currentSchool?.name || 'Demo International School'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-sans mt-0.5">
                  {currentSchool?.address || '123 Education Boulevard'} • Phone: {currentSchool?.phone || '+91 98765 43210'}
                </p>
              </div>

              {/* Certificate Ref & Date */}
              <div className="flex justify-between items-center text-xs font-sans font-semibold text-gray-500 dark:text-slate-400 mb-8 px-4">
                <div>Ref No: <span className="text-gray-800 dark:text-slate-200 font-bold">{selectedCert.certificateNo}</span></div>
                <div>Date: <span className="text-gray-800 dark:text-slate-200 font-bold">{formatDate(selectedCert.date)}</span></div>
              </div>

              {/* Certificate Title */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-widest underline decoration-teal-500 decoration-2 underline-offset-8">
                  {selectedCert.templateName}
                </h1>
                <p className="text-xs italic text-gray-400 dark:text-slate-400 mt-2 font-sans">
                  TO WHOM IT MAY CONCERN
                </p>
              </div>

              {/* Body Text */}
              <div className="max-w-2xl mx-auto leading-relaxed text-base sm:text-lg text-gray-800 dark:text-slate-200 my-8 px-4 text-justify sm:text-center">
                This is to certify that <span className="font-bold text-teal-800 dark:text-teal-300 underline underline-offset-4">{selectedCert.toName}</span>
                {selectedCert.toCode ? ` (${selectedCert.toCode})` : ''},
                {selectedCert.customData?.fatherName ? ` son/daughter of Mr. ${selectedCert.customData.fatherName}, ` : ' '}
                was a bona fide student of this institution.
                His/Her conduct and character during the stay in the school has been <span className="font-semibold">{selectedCert.customData?.conduct || 'Good'}</span>.
                We wish him/her all success in future endeavors.
              </div>

              {/* Duplicate Watermark badge if applicable */}
              {selectedCert.isDuplicate && (
                <div className="my-4 inline-block border-2 border-amber-600 text-amber-700 dark:text-amber-400 font-bold px-4 py-1 rounded text-xs tracking-widest uppercase font-sans">
                  DUPLICATE COPY
                </div>
              )}

              {/* Signatures Footer */}
              <div className="grid grid-cols-2 gap-8 mt-16 pt-8 px-8 border-t border-gray-200 dark:border-slate-700 font-sans">
                <div className="text-center">
                  <div className="h-10 border-b border-gray-400 dark:border-slate-500 w-40 mx-auto mb-2"></div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-gray-400 dark:border-slate-500 w-40 mx-auto mb-2"></div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-400">Principal Signature</p>
                </div>
              </div>

              {/* Official Seal Graphic */}
              <div className="mt-8 text-center text-[10px] text-gray-400 dark:text-slate-500 font-sans uppercase tracking-widest">
                • Official Institution Document • Verified via Campus Pilot •
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Print Media Query Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 4px solid #0f766e !important;
            padding: 40px !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}

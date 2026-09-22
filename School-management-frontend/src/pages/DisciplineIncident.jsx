import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { SchoolContext } from '../context/SchoolContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, ShieldAlert, Edit3, Trash2, Eye, EyeOff,
  Check, X, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Quote, ListOrdered, Code, Image as ImageIcon, Link as LinkIcon,
  RotateCcw, Upload, FileText, Calendar, User, Clock, AlertTriangle,
  CheckCircle2, AlertCircle, ChevronRight, RefreshCw, Printer,
  Paperclip, File, Download, ArrowUpRight
} from 'lucide-react';

export default function DisciplineIncident({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [layoutMode, setLayoutMode] = useState('table'); // 'table' | 'grid'

  // Form State
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    nature: 'Minor',
    severity: 'Low',
    date: new Date().toISOString().split('T')[0],
    student: '',
    studentName: '',
    studentRoll: '',
    studentClass: '',
    reportedBy: user?.name || user?.username || 'School Administration',
    description: '',
    action: '',
    actionStatus: 'Pending',
    attachments: []
  });

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Modal state
  const [viewingIncident, setViewingIncident] = useState(null);

  // Popover / UI toggles
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Refs for rich editors
  const descEditorRef = useRef(null);
  const actionEditorRef = useRef(null);

  const categories = [
    'Behavioral',
    'Academic Dishonesty',
    'Attendance / Tardiness',
    'Bullying / Harassment',
    'Dress Code Violation',
    'Property Damage',
    'Substance Abuse',
    'Fighting / Physical Altercation',
    'Insubordination',
    'Disrespect to Staff',
    'Use of Prohibited Devices',
    'Other'
  ];

  const natures = ['Minor', 'Moderate', 'Major', 'Severe', 'Critical'];
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Pending', 'Under Investigation', 'Resolved', 'Closed'];

  // Fetch incidents from API
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/discipline/incidents');
      setIncidents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching discipline incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for dropdown
  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchStudents();
  }, []);

  useSchoolRefresh(fetchIncidents);

  // Open Add view
  const handleOpenAdd = () => {
    setCurrentEditId(null);
    setFormData({
      category: '',
      title: '',
      nature: 'Minor',
      severity: 'Low',
      date: new Date().toISOString().split('T')[0],
      student: '',
      studentName: '',
      studentRoll: '',
      studentClass: '',
      reportedBy: user?.name || user?.username || 'School Administration',
      description: '',
      action: '',
      actionStatus: 'Pending',
      attachments: []
    });
    if (descEditorRef.current) descEditorRef.current.innerHTML = '';
    if (actionEditorRef.current) actionEditorRef.current.innerHTML = '';
    setViewMode('add');
  };

  // Open Edit view
  const handleOpenEdit = (item) => {
    setCurrentEditId(item._id);
    setFormData({
      category: item.category || '',
      title: item.title || '',
      nature: item.nature || 'Minor',
      severity: item.severity || 'Low',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      student: item.student?._id || item.student || '',
      studentName: item.studentName || item.student?.name || '',
      studentRoll: item.studentRoll || item.student?.rollNumber || '',
      studentClass: item.studentClass || item.student?.className || '',
      reportedBy: item.reportedBy || user?.name || 'School Administration',
      description: item.description || '',
      action: item.action || '',
      actionStatus: item.actionStatus || 'Pending',
      attachments: Array.isArray(item.attachments) ? item.attachments : []
    });
    setViewMode('edit');
    setTimeout(() => {
      if (descEditorRef.current) descEditorRef.current.innerHTML = item.description || '';
      if (actionEditorRef.current) actionEditorRef.current.innerHTML = item.action || '';
    }, 50);
  };

  // Back to list view
  const handleBackToList = () => {
    setViewMode('list');
    setCurrentEditId(null);
  };

  // Reset form fields
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setFormData({
        category: '',
        title: '',
        nature: 'Minor',
        severity: 'Low',
        date: new Date().toISOString().split('T')[0],
        student: '',
        studentName: '',
        studentRoll: '',
        studentClass: '',
        reportedBy: user?.name || user?.username || 'School Administration',
        description: '',
        action: '',
        actionStatus: 'Pending',
        attachments: []
      });
      if (descEditorRef.current) descEditorRef.current.innerHTML = '';
      if (actionEditorRef.current) actionEditorRef.current.innerHTML = '';
    }
  };

  // Student selection handler
  const handleStudentSelect = (studentId) => {
    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        student: '',
        studentName: '',
        studentRoll: '',
        studentClass: ''
      }));
      return;
    }
    const selected = students.find(s => s._id === studentId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        student: selected._id,
        studentName: selected.name || `${selected.firstName || ''} ${selected.lastName || ''}`.trim(),
        studentRoll: selected.rollNumber || '',
        studentClass: selected.className ? `${selected.className} ${selected.section || ''}`.trim() : ''
      }));
    }
  };

  // Editor formatting execution
  const executeEditorCommand = (editorRef, command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  // Save Incident record
  const handleSave = async () => {
    const finalDesc = descEditorRef.current ? descEditorRef.current.innerHTML : formData.description;
    const finalAction = actionEditorRef.current ? actionEditorRef.current.innerHTML : formData.action;

    if (!formData.title.trim()) {
      alert('Please enter an incident title.');
      return;
    }

    if (!finalDesc || finalDesc.trim() === '' || finalDesc === '<p><br></p>') {
      alert('Please enter a description for the incident.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        description: finalDesc,
        action: finalAction
      };

      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/discipline/incidents/${currentEditId}`, payload);
      } else {
        await API.post('/discipline/incidents', payload);
      }

      await fetchIncidents();

      if (keepAdding && viewMode === 'add') {
        // Reset inputs for next entry
        setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          action: '',
          attachments: []
        }));
        if (descEditorRef.current) descEditorRef.current.innerHTML = '';
        if (actionEditorRef.current) actionEditorRef.current.innerHTML = '';
        alert('Incident recorded! You can now add another incident.');
      } else {
        handleBackToList();
      }
    } catch (err) {
      console.error('Error saving incident:', err);
      alert(err.response?.data?.message || 'Failed to save incident record.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Incident
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this incident record?')) return;
    try {
      await API.delete(`/discipline/incidents/${id}`);
      setIncidents(prev => prev.filter(item => item._id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));
      if (viewingIncident?._id === id) setViewingIncident(null);
    } catch (err) {
      console.error('Error deleting incident:', err);
      alert('Failed to delete incident record.');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected incident records?`)) return;
    try {
      await API.post('/discipline/incidents/bulk-delete', { ids: selectedIds });
      setIncidents(prev => prev.filter(item => !selectedIds.includes(item._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error('Error bulk deleting incidents:', err);
      alert('Failed to bulk delete incidents.');
    }
  };

  // Update Status
  const handleStatusChange = async (id, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await API.patch(`/discipline/incidents/${id}/status`, { actionStatus: newStatus });
      setIncidents(prev => prev.map(item => (item._id === id ? { ...item, actionStatus: res.data.actionStatus } : item)));
      if (viewingIncident?._id === id) {
        setViewingIncident(prev => ({ ...prev, actionStatus: res.data.actionStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  // Add attachment
  const handleAddAttachment = () => {
    if (!newAttachmentUrl.trim()) return;
    const item = {
      name: newAttachmentName.trim() || 'Attached Document',
      url: newAttachmentUrl.trim(),
      uploadedAt: new Date()
    };
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, item] }));
    setNewAttachmentUrl('');
    setNewAttachmentName('');
    setShowUploadModal(false);
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredIncidents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIncidents.map(item => item._id));
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(item => {
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.studentRoll && item.studentRoll.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.reportedBy && item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || item.actionStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const schoolLabel = currentSchool?.name || '';

  // Severity Badges Color Helper
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
  };

  // Status Badges Color Helper
  const getStatusBadge = (st) => {
    switch (st) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'Under Investigation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
  };

  // ----------------------------------------------------
  // RENDER: ADD / EDIT VIEW (Matches Screenshot 2)
  // ----------------------------------------------------
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200 pb-16">
        {/* Top Breadcrumbs & Header Bar */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={handleBackToList}>Dashboard</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={handleBackToList}>Discipline</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={handleBackToList}>Incident</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{viewMode === 'edit' ? 'Edit Incident' : 'Add Incident'}</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {viewMode === 'edit' ? 'Edit Incident' : 'Add Incident'}
            </h1>
            <button
              id="list-all-incident-btn"
              onClick={handleBackToList}
              className="px-5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
            >
              List all Incident
            </button>
          </div>
        </div>

        {/* Form Container (Matches Screenshot 2 layout) */}
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="space-y-6">
            {/* Row 1: Category & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Category</label>
                <select
                  id="incident-category-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Title</label>
                <input
                  id="incident-title-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 2: Nature, Severity & Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Nature</label>
                <select
                  id="incident-nature-select"
                  value={formData.nature}
                  onChange={(e) => setFormData({ ...formData, nature: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Nature</option>
                  {natures.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Severity</label>
                <select
                  id="incident-severity-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Severity</option>
                  {severities.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Date</label>
                <div className="relative">
                  <input
                    id="incident-date-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Student & Reported By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Student</label>
                <select
                  id="incident-student-select"
                  value={formData.student}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Student</option>
                  {students.map(std => (
                    <option key={std._id} value={std._id}>
                      {std.name} {std.rollNumber ? `(${std.rollNumber})` : ''} - {std.className} {std.section || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Reported By</label>
                <input
                  id="incident-reported-by-input"
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  placeholder="Reported By"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 4: Description Editor (Matches Screenshot 2 toolbar) */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Description</label>
              <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                {/* Description Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Normal</span>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'bold')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'italic')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'underline')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded underline">
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'insertUnorderedList')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'insertOrderedList')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'formatBlock', '<blockquote>')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'formatBlock', '<pre>')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button type="button" onClick={() => executeEditorCommand(descEditorRef, 'removeFormat')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[11px] font-mono">
                    T<sub>x</sub>
                  </button>
                </div>
                <div
                  id="incident-desc-editor"
                  ref={descEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (descEditorRef.current) {
                      setFormData(prev => ({ ...prev, description: descEditorRef.current.innerHTML }));
                    }
                  }}
                  className="outline-none min-h-[140px] max-h-[300px] overflow-y-auto p-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Row 5: Action Editor (Matches Screenshot 2 toolbar) */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Action</label>
              <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Normal</span>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'bold')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'italic')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'underline')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded underline">
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'insertUnorderedList')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'insertOrderedList')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'formatBlock', '<blockquote>')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'formatBlock', '<pre>')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button type="button" onClick={() => executeEditorCommand(actionEditorRef, 'removeFormat')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[11px] font-mono">
                    T<sub>x</sub>
                  </button>
                </div>
                <div
                  id="incident-action-editor"
                  ref={actionEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (actionEditorRef.current) {
                      setFormData(prev => ({ ...prev, action: actionEditorRef.current.innerHTML }));
                    }
                  }}
                  className="outline-none min-h-[140px] max-h-[300px] overflow-y-auto p-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Row 6: Upload File Button & Attached Files List */}
            <div>
              <button
                type="button"
                id="incident-upload-file-btn"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>

              {formData.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <a href={att.url} target="_blank" rel="noreferrer" className="hover:underline font-medium truncate max-w-[200px]">
                        {att.name || 'Attachment'}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 7 (Footer / Action Bar Matches Screenshot 2): Reset & Keep Adding on left, Cancel & Save on right */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                id="incident-reset-btn"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Reset
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={keepAdding}
                  onChange={(e) => setKeepAdding(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Keep Adding</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="incident-cancel-btn"
                onClick={handleBackToList}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="incident-save-btn"
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Attachment Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" /> Attach Document or File
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">File / Document Name</label>
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="e.g. Incident Report Statement.pdf"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">File URL *</label>
                  <input
                    type="text"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="https://... (or document URL)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Attach File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: LIST VIEW (Matches Screenshot 1)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      {/* Top Breadcrumbs & Header Bar */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">Discipline</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Incident</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Incident
          </h1>

          {/* Header Action Buttons (Matches Screenshot 1: Add Incident, Filter, Settings, More) */}
          <div className="flex items-center space-x-2 relative">
            <button
              id="add-incident-top-btn"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
            >
              Add Incident
            </button>

            {/* Filter Toggle Button */}
            <button
              id="filter-incident-btn"
              title="Filter"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer ${showFilterDropdown ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              id="settings-incident-btn"
              title="Settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Layout Toggle Button */}
            <button
              id="layout-incident-btn"
              title={layoutMode === 'table' ? 'Switch to Grid View' : 'Switch to Table View'}
              onClick={() => setLayoutMode(layoutMode === 'table' ? 'grid' : 'table')}
              className={`p-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer ${layoutMode === 'grid' ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <Columns className="w-4 h-4" />
            </button>

            {/* More Menu Toggle */}
            <button
              id="more-incident-btn"
              title="More Actions"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute right-0 top-12 z-30 w-72 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Filters</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSeverity('All');
                      setSelectedStatus('All');
                      setSearchTerm('');
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Severity</label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="All">All Severities</option>
                    {severities.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block">Action Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* More Menu Popover */}
            {showMoreMenu && (
              <div className="absolute right-0 top-12 z-30 w-48 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    fetchIncidents();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Data
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => {
                      handleBulkDelete();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading discipline records...</p>
          </div>
        ) : incidents.length === 0 ? (
          /* Empty State (Matches Screenshot 1) */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 md:p-20 flex flex-col items-center justify-center text-center">
            {/* Center Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6 shadow-xs">
              <div className="space-y-1.5 flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-600 dark:bg-slate-300" />
                </div>
              </div>
            </div>

            {/* Title & Subtitle (Matches Screenshot 1) */}
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1">
              List all Incidents
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Manage all Incidents
            </p>

            {/* Add Incident Button */}
            <button
              id="empty-add-incident-btn"
              onClick={handleOpenAdd}
              className="px-6 py-2.5 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs md:text-sm font-semibold shadow-md transition-all duration-200 cursor-pointer"
            >
              Add Incident
            </button>
          </div>
        ) : (
          /* Populated State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, student name, roll number, reporter..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['All', 'Pending', 'Under Investigation', 'Resolved', 'Closed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedStatus === st ? 'bg-[#1e293b] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table or Grid View */}
            {filteredIncidents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No incident records match your active search filters.
              </div>
            ) : layoutMode === 'table' ? (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredIncidents.length && filteredIncidents.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="py-3.5 px-4">Incident & Category</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Reported By</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Severity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredIncidents.map(item => (
                      <tr
                        key={item._id}
                        onClick={() => setViewingIncident(item)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={() => handleToggleSelect(item._id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition text-sm">
                            {item.title}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.category || 'Behavioral'}</span>
                            <span>•</span>
                            <span>Nature: {item.nature || 'Minor'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.studentName || item.student?.name || 'General / Unspecified'}
                          </div>
                          {(item.studentClass || item.studentRoll) && (
                            <div className="text-slate-400 text-[11px]">
                              {item.studentClass} {item.studentRoll ? `(Roll: ${item.studentRoll})` : ''}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {item.reportedBy || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                            {item.severity || 'Low'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.actionStatus || 'Pending'}
                            onChange={(e) => handleStatusChange(item._id, e.target.value, e)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border-none outline-none cursor-pointer ${getStatusBadge(item.actionStatus)}`}
                          >
                            {statuses.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="View Details"
                              onClick={() => setViewingIncident(item)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={(e) => handleDelete(item._id, e)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIncidents.map(item => (
                  <div
                    key={item._id}
                    onClick={() => setViewingIncident(item)}
                    className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.category || 'Behavioral'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                          {item.severity} Severity
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">
                        Student: {item.studentName || 'Unspecified'} {item.studentClass ? `(${item.studentClass})` : ''}
                      </div>
                      <div
                        className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item._id, e)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Incident Detail / Investigation Modal */}
      {viewingIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 relative">
            <button
              onClick={() => setViewingIncident(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {viewingIncident.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(viewingIncident.severity)}`}>
                {viewingIncident.severity} Severity
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(viewingIncident.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {viewingIncident.title}
            </h1>

            {/* Student & Reporter Info Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-5">
              <div>
                <span className="text-slate-400 block mb-0.5">Involved Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{viewingIncident.studentName || 'Unspecified'}</span>
                {viewingIncident.studentClass && (
                  <span className="text-slate-500 block text-[11px]">{viewingIncident.studentClass} {viewingIncident.studentRoll ? `(Roll: ${viewingIncident.studentRoll})` : ''}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Reported By:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{viewingIncident.reportedBy || 'School Staff'}</span>
                <span className="text-slate-500 block text-[11px]">Nature: {viewingIncident.nature || 'Minor'}</span>
              </div>
            </div>

            {/* Incident Description */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Statement</h4>
              <div
                className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs md:text-sm p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                dangerouslySetInnerHTML={{ __html: viewingIncident.description }}
              />
            </div>

            {/* Action Taken */}
            {viewingIncident.action && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Disciplinary Action Taken</h4>
                <div
                  className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs md:text-sm p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
                  dangerouslySetInnerHTML={{ __html: viewingIncident.action }}
                />
              </div>
            )}

            {/* Attachments */}
            {viewingIncident.attachments && viewingIncident.attachments.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attached Evidence / Documents</h4>
                <div className="space-y-1.5">
                  {viewingIncident.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-indigo-600 dark:text-indigo-400 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5" />
                        {att.name || 'Document'}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Incident Report
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = viewingIncident;
                  setViewingIncident(null);
                  handleOpenEdit(item);
                }}
                className="px-5 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-indigo-600" /> Discipline Module Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">Default Display Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLayoutMode('table')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition ${layoutMode === 'table' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-2.5 rounded-lg border text-center font-medium transition ${layoutMode === 'grid' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    Card Grid View
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-slate-500 leading-relaxed">
                  The Discipline & Incident module empowers administrators, deans, and teachers to systematically document student behavioral events, assign corrective actions, and track disciplinary follow-ups.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1e293b] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

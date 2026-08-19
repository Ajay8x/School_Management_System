import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  List, Filter, Settings, Columns, MoreVertical, RefreshCw, 
  Printer, FileText, FileSpreadsheet, Plus, ChevronDown, ChevronUp,
  Search, Trash2, Edit, Check, X, Home, HelpCircle, Layers, Tag, Globe, Sparkles
} from 'lucide-react';
import API from '../../api/axios';

export default function FAQ() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [keepAdding, setKeepAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const menuRef = useRef(null);
  const editorRef = useRef(null);

  // Form State
  const initialForm = {
    _id: '',
    question: '',
    category: '',
    tag: '',
    publish: true,
    answer: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const categories = [
    'General', 'Admission', 'Academic', 'Fees & Accounts', 
    'Transport', 'Hostel', 'Library', 'HR & Payroll', 'IT Support'
  ];

  const tags = [
    'Students', 'Employees', 'Parents', 'Teachers', 'General'
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/faqs');
      setFaqs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
      showToast('Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetForm = () => {
    setFormData(initialForm);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      _id: faq._id,
      question: faq.question,
      category: faq.category || '',
      tag: faq.tag || '',
      publish: faq.publish !== undefined ? faq.publish : true,
      answer: faq.answer || ''
    });
    setView('edit');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = faq.answer || '';
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await API.delete(`/faqs/${id}`);
      showToast('FAQ deleted successfully!');
      fetchFAQs();
    } catch (err) {
      showToast('Failed to delete FAQ', 'error');
    }
  };

  const handleTogglePublish = async (faq) => {
    try {
      await API.put(`/faqs/${faq._id}`, { publish: !faq.publish });
      showToast(`FAQ ${!faq.publish ? 'Published' : 'Unpublished'}`);
      fetchFAQs();
    } catch (err) {
      showToast('Failed to update publish status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      showToast('Please enter a Question', 'error');
      return;
    }
    const currentAnswer = editorRef.current ? editorRef.current.innerHTML : formData.answer;
    if (!currentAnswer.trim() || currentAnswer === '<br>') {
      showToast('Please enter an Answer', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        question: formData.question,
        category: formData.category || 'General',
        tag: formData.tag || '',
        publish: formData.publish,
        answer: currentAnswer
      };

      if (formData._id) {
        await API.put(`/faqs/${formData._id}`, payload);
        showToast('FAQ updated successfully!');
      } else {
        await API.post('/faqs', payload);
        showToast('FAQ added successfully!');
      }

      fetchFAQs();

      if (keepAdding && !formData._id) {
        handleResetForm();
      } else {
        setView('list');
        handleResetForm();
      }
    } catch (err) {
      console.error('Save FAQ Error:', err);
      showToast('Failed to save FAQ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Rich Text Editor Commands
  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, answer: editorRef.current.innerHTML }));
    }
  };

  // Export functions
  const handlePrint = () => {
    window.print();
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    if (faqs.length === 0) {
      showToast('No FAQs to export', 'error');
      return;
    }
    const headers = ['Question', 'Category', 'Tag', 'Published', 'Answer'];
    const rows = faqs.map(f => [
      `"${f.question.replace(/"/g, '""')}"`,
      `"${(f.category || '').replace(/"/g, '""')}"`,
      `"${(f.tag || '').replace(/"/g, '""')}"`,
      f.publish ? 'Yes' : 'No',
      `"${f.answer.replace(/<[^>]*>?/gm, '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Pilot_FAQs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
    showToast('Exported FAQs to Excel / CSV');
  };

  // Filtering FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.answer && faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (faq.tag && faq.tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[85vh] flex flex-col justify-between font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
          toast.type === 'error' ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4 text-teal-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        {/* Header Breadcrumb & Title Bar */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Helpdesk</span>
            <span>&gt;</span>
            <span className="text-gray-700 dark:text-slate-200">FAQ</span>
            {view !== 'list' && (
              <>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white font-bold">{view === 'edit' ? 'Edit FAQ' : 'Add FAQ'}</span>
              </>
            )}
          </nav>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {view === 'list' ? 'FAQ' : (view === 'edit' ? 'Edit FAQ' : 'Add FAQ')}
            </h1>

            {/* Top Right Buttons */}
            {view === 'list' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleResetForm();
                    setView('add');
                  }}
                  className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Add FAQ</span>
                </button>

                <button 
                  onClick={() => setSelectedCategory(selectedCategory === 'All' ? categories[0] : 'All')}
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                  title="Filter FAQs"
                >
                  <Filter className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => navigate('/admin/helpdesk/config')}
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button 
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                  title="Layout View"
                >
                  <Columns className="w-4 h-4" />
                </button>

                {/* Triple Dots Menu */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu matching Image 2 */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button 
                        onClick={() => { fetchFAQs(); setShowMenu(false); }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                        <span>Refresh</span>
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-gray-400" />
                        <span>Print</span>
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span>Generate PDF</span>
                      </button>
                      <button 
                        onClick={handleExportCSV}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                        <span>Export to Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setView('list')}
                className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
              >
                List all FAQ
              </button>
            )}
          </div>
        </div>

        {/* MAIN BODY CONTENT */}
        {view === 'list' ? (
          <div>
            {/* Search & Category Filter Bar */}
            {faqs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search question, category or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">Category:</span>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700 dark:text-slate-300"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Empty State matching Image 1 & Image 2 */}
            {faqs.length === 0 && !loading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 my-4 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
                
                {/* Central List Bullet Icon matching screenshot */}
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mb-4 text-gray-600 dark:text-slate-300">
                  <div className="flex flex-col space-y-1.5 items-start justify-center w-8">
                    <div className="flex items-center space-x-1.5 w-full">
                      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                      <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                    </div>
                    <div className="flex items-center space-x-1.5 w-full">
                      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                      <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                    </div>
                    <div className="flex items-center space-x-1.5 w-full">
                      <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-slate-300"></span>
                      <span className="h-1.5 bg-gray-400 dark:bg-slate-400 rounded flex-1"></span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Manage FAQs</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6 font-normal">
                  FAQs are the questions and answers that are frequently asked by your employees.
                </p>

                <button 
                  onClick={() => {
                    handleResetForm();
                    setView('add');
                  }}
                  className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow transition-colors"
                >
                  Add FAQ
                </button>
              </div>
            ) : (
              /* FAQ Accordion List View */
              <div className="space-y-3 mb-6">
                {filteredFaqs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700">
                    No FAQs match your search criteria.
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const isExpanded = expandedFaqId === faq._id;
                    return (
                      <div 
                        key={faq._id || index}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200"
                      >
                        {/* FAQ Question Header Bar */}
                        <div 
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq._id)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-750 transition-colors"
                        >
                          <div className="flex items-center space-x-3 pr-4">
                            <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              Q{index + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 dark:text-white leading-snug">
                                {faq.question}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                {faq.category && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                                    {faq.category}
                                  </span>
                                )}
                                {faq.tag && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                    Tag: {faq.tag}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  faq.publish !== false ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}>
                                  {faq.publish !== false ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePublish(faq);
                              }}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                                faq.publish !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={faq.publish !== false ? 'Unpublish' : 'Publish'}
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(faq);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                              title="Edit FAQ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(faq._id);
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded Answer Content */}
                        {isExpanded && (
                          <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                            <div 
                              className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          /* ADD / EDIT FAQ FORM matching Image 3 */
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Question & FAQ Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Question <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Question"
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    FAQ Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  >
                    <option value="">FAQ Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Select Tag & Publish */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Select Tag
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  >
                    <option value="">Select Tag</option>
                    {tags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Publish
                  </label>
                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, publish: !formData.publish })}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.publish ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.publish ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      {formData.publish ? 'Published' : 'Unpublished'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Answer with Rich Text Toolbar matching Image 3 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                  Answer <span className="text-rose-500">*</span>
                </label>

                {/* Editor Container */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  
                  {/* Toolbar matching Image 3 icons: B, I, U, H, S, Bullet list, Number list, Link */}
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 select-none">
                    <button
                      type="button"
                      onClick={() => formatDoc('bold')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded font-serif font-bold text-xs w-6 h-6 flex items-center justify-center"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('italic')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded font-serif italic text-xs w-6 h-6 flex items-center justify-center"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('underline')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded underline text-xs w-6 h-6 flex items-center justify-center"
                      title="Underline"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('formatBlock', '<h2>')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded font-bold text-xs w-6 h-6 flex items-center justify-center"
                      title="Heading"
                    >
                      H
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('strikeThrough')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded line-through text-xs w-6 h-6 flex items-center justify-center"
                      title="Strikethrough"
                    >
                      S
                    </button>
                    <span className="h-4 w-[1px] bg-gray-300 dark:bg-slate-700 mx-1"></span>
                    <button
                      type="button"
                      onClick={() => formatDoc('insertUnorderedList')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-xs w-6 h-6 flex items-center justify-center"
                      title="Bullet List"
                    >
                      •≡
                    </button>
                    <button
                      type="button"
                      onClick={() => formatDoc('insertOrderedList')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-xs w-6 h-6 flex items-center justify-center"
                      title="Numbered List"
                    >
                      1.≡
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter link URL:');
                        if (url) formatDoc('createLink', url);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-xs w-6 h-6 flex items-center justify-center"
                      title="Insert Link"
                    >
                      🔗
                    </button>
                  </div>

                  {/* Rich Text Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={() => {
                      if (editorRef.current) {
                        setFormData(prev => ({ ...prev, answer: editorRef.current.innerHTML }));
                      }
                    }}
                    className="min-h-[180px] max-h-[350px] overflow-y-auto p-3 text-xs text-gray-800 dark:text-slate-200 outline-none leading-relaxed prose dark:prose-invert max-w-none"
                    placeholder="Answer"
                  />
                </div>
              </div>

              {/* Form Bottom Bar matching Image 3 */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md border border-gray-200 dark:border-slate-600 transition"
                  >
                    Reset
                  </button>

                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-600 dark:text-slate-300">
                    <input 
                      type="checkbox"
                      checked={keepAdding}
                      onChange={(e) => setKeepAdding(e.target.checked)}
                      className="rounded border-gray-300 text-teal-500 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span>Keep Adding</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      setView('list');
                    }}
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-1.5 rounded-md text-xs font-semibold transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-1.5 rounded-md text-xs font-semibold shadow transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* Campus Pilot Footer Branding (User requested "sab jagha pe campus polit hi hoga") */}
      <footer className="mt-8 py-4 text-center text-xs font-medium text-gray-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800">
        Campus Pilot
      </footer>

    </div>
  );
}

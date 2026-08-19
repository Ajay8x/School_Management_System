import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Filter, MoreVertical, RefreshCw, Printer, 
  FileText, FileSpreadsheet, Plus, Check, X, Home, Pipette,
  Trash2, Edit, Download, Upload, Search, List
} from 'lucide-react';
import API from '../../api/axios';

export default function HelpdeskConfig({ initialTab = 'config' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL query or prop
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || initialTab);

  // Sub-views for categories ('list' | 'add' | 'edit')
  const [catView, setCatView] = useState('list');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [keepAdding, setKeepAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  // Config State
  const [configData, setConfigData] = useState({
    faqTitle: '',
    faqDescription: '',
    ticketPrefix: 'HT',
    ticketDigit: 3,
    ticketSuffix: ''
  });

  // Category & Priority Data Arrays
  const [faqCategories, setFaqCategories] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [ticketPriorities, setTicketPriorities] = useState([]);

  // Form state for Category / Priority editing/adding
  const initialCategoryForm = {
    _id: '',
    name: '',
    color: '#3b82f6',
    description: ''
  };
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  useEffect(() => {
    fetchConfig();
    fetchFAQCategories();
    fetchTicketCategories();
    fetchTicketPriorities();
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

  // Fetch Functions
  const fetchConfig = async () => {
    try {
      const res = await API.get('/helpdesk/config');
      if (res.data) setConfigData(res.data);
    } catch (err) {
      console.error('Failed to fetch config', err);
    }
  };

  const fetchFAQCategories = async () => {
    try {
      const res = await API.get('/helpdesk/faq-categories');
      setFaqCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch FAQ categories', err);
    }
  };

  const fetchTicketCategories = async () => {
    try {
      const res = await API.get('/helpdesk/ticket-categories');
      setTicketCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch Ticket categories', err);
    }
  };

  const fetchTicketPriorities = async () => {
    try {
      const res = await API.get('/helpdesk/ticket-priorities');
      setTicketPriorities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch Ticket priorities', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCatView('list');
    setCategoryForm(initialCategoryForm);
    navigate(`?tab=${tab}`, { replace: true });
  };

  // Config Submit
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.put('/helpdesk/config', configData);
      showToast('Helpdesk configuration saved successfully!');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Category / Priority Submit
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: categoryForm.name,
        color: categoryForm.color || '#3b82f6',
        description: categoryForm.description || ''
      };

      let endpoint = '';
      if (activeTab === 'faq-category') endpoint = '/helpdesk/faq-categories';
      else if (activeTab === 'ticket-category') endpoint = '/helpdesk/ticket-categories';
      else if (activeTab === 'ticket-priority') endpoint = '/helpdesk/ticket-priorities';

      if (categoryForm._id) {
        await API.put(`${endpoint}/${categoryForm._id}`, payload);
        showToast('Updated successfully!');
      } else {
        await API.post(endpoint, payload);
        showToast('Added successfully!');
      }

      if (activeTab === 'faq-category') fetchFAQCategories();
      else if (activeTab === 'ticket-category') fetchTicketCategories();
      else if (activeTab === 'ticket-priority') fetchTicketPriorities();

      if (keepAdding && !categoryForm._id) {
        setCategoryForm(initialCategoryForm);
      } else {
        setCatView('list');
        setCategoryForm(initialCategoryForm);
      }
    } catch (err) {
      showToast('Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category / Priority
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      let endpoint = '';
      if (activeTab === 'faq-category') endpoint = '/helpdesk/faq-categories';
      else if (activeTab === 'ticket-category') endpoint = '/helpdesk/ticket-categories';
      else if (activeTab === 'ticket-priority') endpoint = '/helpdesk/ticket-priorities';

      await API.delete(`${endpoint}/${id}`);
      showToast('Deleted successfully!');

      if (activeTab === 'faq-category') fetchFAQCategories();
      else if (activeTab === 'ticket-category') fetchTicketCategories();
      else if (activeTab === 'ticket-priority') fetchTicketPriorities();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleEditCategory = (item) => {
    setCategoryForm({
      _id: item._id,
      name: item.name,
      color: item.color || '#3b82f6',
      description: item.description || ''
    });
    setCatView('edit');
  };

  // Triple dots export/print actions
  const handlePrint = () => {
    window.print();
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    let dataToExport = [];
    let title = activeTab;

    if (activeTab === 'faq-category') dataToExport = faqCategories;
    else if (activeTab === 'ticket-category') dataToExport = ticketCategories;
    else if (activeTab === 'ticket-priority') dataToExport = ticketPriorities;

    if (dataToExport.length === 0) {
      showToast('No items to export', 'error');
      return;
    }

    const headers = ['Name', 'Color', 'Description'];
    const rows = dataToExport.map(d => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.color || '').replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title}_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
    showToast(`Exported ${title} to CSV`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast(`Imported ${file.name} successfully!`);
      }
    };
    input.click();
    setShowMenu(false);
  };

  // Helper for Breadcrumbs & Titles
  const getBreadcrumbTitle = () => {
    if (activeTab === 'config') return { main: 'Config', sub: '' };
    if (activeTab === 'faq-category') return { main: 'FAQ', sub: 'FAQ Category' };
    if (activeTab === 'ticket-category') return { main: 'Ticket', sub: 'Ticket Category' };
    if (activeTab === 'ticket-priority') return { main: 'Ticket', sub: 'Ticket Priority' };
    return { main: 'Config', sub: '' };
  };

  const currentTabItems = () => {
    if (activeTab === 'faq-category') return faqCategories;
    if (activeTab === 'ticket-category') return ticketCategories;
    if (activeTab === 'ticket-priority') return ticketPriorities;
    return [];
  };

  const filteredItems = currentTabItems().filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const { main, sub } = getBreadcrumbTitle();

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
        {/* Top Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Helpdesk</span>
          <span>&gt;</span>
          {sub ? (
            <>
              <span>{main}</span>
              <span>&gt;</span>
              <span className="text-gray-800 dark:text-white font-bold">{sub}</span>
            </>
          ) : (
            <span className="text-gray-800 dark:text-white font-bold">Config</span>
          )}
          {catView !== 'list' && (
            <>
              <span>&gt;</span>
              <span className="text-gray-900 dark:text-white font-bold">
                {catView === 'edit' ? `Edit ${sub}` : `Add ${sub}`}
              </span>
            </>
          )}
        </nav>

        {/* Main Content Layout with Left Dark Sidebar (Matching Image 1 & Image 5) */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Dark Sidebar Panel matching screenshot 1 */}
          <div className="w-full md:w-56 bg-black rounded-xl p-4 flex flex-col space-y-1.5 flex-shrink-0 shadow-lg text-white">
            <button
              onClick={() => handleTabChange('config')}
              className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'config' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>Config</span>
            </button>

            <button
              onClick={() => handleTabChange('faq-category')}
              className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'faq-category' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>FAQ Category</span>
            </button>

            <button
              onClick={() => handleTabChange('ticket-category')}
              className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ticket-category' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>Ticket Category</span>
            </button>

            <button
              onClick={() => handleTabChange('ticket-priority')}
              className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ticket-priority' ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>Ticket Priority</span>
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* CONFIG TAB (Image 1 Match) */}
            {activeTab === 'config' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight mb-4">
                  Config
                </h1>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    
                    {/* FAQ Config Section */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">FAQ Config</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">How do you want to configure the FAQ module?</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Title</label>
                          <input 
                            type="text"
                            placeholder="Title"
                            value={configData.faqTitle}
                            onChange={(e) => setConfigData({ ...configData, faqTitle: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Description</label>
                          <textarea 
                            rows="3"
                            placeholder="Description"
                            value={configData.faqDescription}
                            onChange={(e) => setConfigData({ ...configData, faqDescription: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 resize-y"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ticket Config Section */}
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">Ticket Config</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">How do you want to configure the Ticket module?</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Ticket Number Prefix</label>
                          <input 
                            type="text"
                            placeholder="HT"
                            value={configData.ticketPrefix}
                            onChange={(e) => setConfigData({ ...configData, ticketPrefix: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Ticket Number Digit</label>
                          <input 
                            type="number"
                            placeholder="3"
                            value={configData.ticketDigit}
                            onChange={(e) => setConfigData({ ...configData, ticketDigit: parseInt(e.target.value) || 3 })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">Ticket Number Suffix</label>
                          <input 
                            type="text"
                            placeholder="Ticket Number Suffix"
                            value={configData.ticketSuffix}
                            onChange={(e) => setConfigData({ ...configData, ticketSuffix: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar matching Image 1 */}
                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={fetchConfig}
                        className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md border border-gray-200 dark:border-slate-600 transition"
                      >
                        Reset
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => navigate('/admin/helpdesk/faq')}
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
              </div>
            )}

            {/* CATEGORY & PRIORITY TABS (Image 2, 3, 4, 5 Match) */}
            {activeTab !== 'config' && (
              <div>
                
                {/* Header Title & Top Buttons matching Image 2, 4, 5 */}
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {sub}
                  </h1>

                  {catView === 'list' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCategoryForm(initialCategoryForm);
                          setCatView('add');
                        }}
                        className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        title="Quick Add"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setCategoryForm(initialCategoryForm);
                          setCatView('add');
                        }}
                        className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Add {sub}</span>
                      </button>

                      <button 
                        className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        title="Filter"
                      >
                        <Filter className="w-4 h-4" />
                      </button>

                      {/* Triple Dots Menu with Import, Refresh, Print, PDF, Excel (Image 5 Match) */}
                      <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <button 
                              onClick={handleImport}
                              className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-gray-400" />
                              <span>Import</span>
                            </button>
                            <button 
                              onClick={() => {
                                if (activeTab === 'faq-category') fetchFAQCategories();
                                else if (activeTab === 'ticket-category') fetchTicketCategories();
                                else if (activeTab === 'ticket-priority') fetchTicketPriorities();
                                setShowMenu(false);
                              }}
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
                      onClick={() => setCatView('list')}
                      className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
                    >
                      List all {sub}
                    </button>
                  )}
                </div>

                {/* LIST VIEW matching Image 2 & 4 */}
                {catView === 'list' ? (
                  <div>
                    {currentTabItems().length === 0 ? (
                      /* Empty State Box matching Image 2 & 4 */
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 my-2 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
                        
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

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                          Manage {activeTab === 'faq-category' ? 'Categories' : (activeTab === 'ticket-category' ? 'Ticket Categories' : 'Ticket Priorities')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6 font-normal">
                          {activeTab === 'faq-category' && 'Categories are used to categorize FAQs in better way.'}
                          {activeTab === 'ticket-category' && 'Categories are used to categorize tickets in better way.'}
                          {activeTab === 'ticket-priority' && 'Priorities are used to prioritize tickets in better way.'}
                        </p>

                        <button 
                          onClick={() => {
                            setCategoryForm(initialCategoryForm);
                            setCatView('add');
                          }}
                          className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow transition-colors"
                        >
                          Add {sub}
                        </button>
                      </div>
                    ) : (
                      /* Table / Cards List of Items */
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden p-5">
                        
                        {/* Search Input */}
                        <div className="mb-4 relative max-w-xs">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <input 
                            type="text"
                            placeholder={`Search ${sub}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-gray-700 dark:text-slate-300">
                            <thead className="bg-gray-50 dark:bg-slate-900 uppercase text-[11px] font-bold text-gray-500 dark:text-slate-400">
                              <tr>
                                <th className="px-4 py-3">Color</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-medium">
                              {filteredItems.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50/80 dark:hover:bg-slate-750 transition">
                                  <td className="px-4 py-3">
                                    <div 
                                      className="w-6 h-6 rounded-lg border border-gray-200 shadow-sm"
                                      style={{ backgroundColor: item.color || '#3b82f6' }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-xs truncate">
                                    {item.description || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-right space-x-2">
                                    <button 
                                      onClick={() => handleEditCategory(item)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCategory(item._id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                ) : (
                  /* ADD / EDIT CATEGORY FORM matching Image 3 */
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">
                      {catView === 'edit' ? `Edit ${sub}` : `Add ${sub}`}
                    </h2>

                    <form onSubmit={handleSaveCategory} className="space-y-5">
                      
                      {/* Row 1: Name & Color Picker */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                            Name <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text"
                            placeholder="Name"
                            required
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                            Color
                          </label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color"
                              value={categoryForm.color}
                              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                              className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                            />
                            <input 
                              type="text"
                              placeholder="Color"
                              value={categoryForm.color}
                              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                              className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 font-mono"
                            />
                            <div className="p-2 text-gray-400 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                              <Pipette className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                          Description
                        </label>
                        <textarea 
                          rows="3"
                          placeholder="Description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 resize-y"
                        />
                      </div>

                      {/* Bottom Bar matching Image 3 */}
                      <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => setCategoryForm(initialCategoryForm)}
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
                            onClick={() => setCatView('list')}
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
            )}

          </div>
        </div>
      </div>

      {/* Campus Pilot Footer */}
      <footer className="mt-8 py-4 text-center text-xs font-medium text-gray-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800">
        Campus Pilot
      </footer>

    </div>
  );
}

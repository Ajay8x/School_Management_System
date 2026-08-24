import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  List, Filter, Settings, Columns, MoreVertical, RefreshCw, 
  Printer, FileText, FileSpreadsheet, Plus, ChevronDown, ChevronUp,
  Search, Trash2, Edit, Check, X, Home, HelpCircle, Tag, AlertCircle, Clock
} from 'lucide-react';
import API from '../../api/axios';
import Footer from '../../components/Footer';

export default function Ticket() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [keepAdding, setKeepAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  const menuRef = useRef(null);
  const editorRef = useRef(null);

  // Dynamic Categories and Priorities from Helpdesk Config API
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);

  // Form State
  const initialForm = {
    _id: '',
    subject: '',
    category: 'General',
    priority: 'Medium',
    status: 'Open',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const statusOptions = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

  useEffect(() => {
    fetchTickets();
    fetchCategoriesAndPriorities();
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

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndPriorities = async () => {
    try {
      const [catRes, prioRes] = await Promise.all([
        API.get('/helpdesk/ticket-categories').catch(() => ({ data: [] })),
        API.get('/helpdesk/ticket-priorities').catch(() => ({ data: [] }))
      ]);

      const catList = catRes.data && catRes.data.length > 0 
        ? catRes.data.map(c => c.name) 
        : ['General', 'IT Support', 'Academic', 'Fee & Accounts', 'Infrastructure', 'Transport'];

      const prioList = prioRes.data && prioRes.data.length > 0 
        ? prioRes.data.map(p => p.name) 
        : ['Low', 'Medium', 'High', 'Urgent'];

      setCategories(catList);
      setPriorities(prioList);
    } catch (err) {
      console.error('Error fetching categories & priorities:', err);
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

  const handleEdit = (ticket) => {
    setFormData({
      _id: ticket._id,
      subject: ticket.subject,
      category: ticket.category || 'General',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open',
      description: ticket.description || ''
    });
    setView('edit');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = ticket.description || '';
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Ticket?')) return;
    try {
      await API.delete(`/tickets/${id}`);
      showToast('Ticket deleted successfully!');
      fetchTickets();
    } catch (err) {
      showToast('Failed to delete Ticket', 'error');
    }
  };

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      await API.put(`/tickets/${ticket._id}`, { status: newStatus });
      showToast(`Ticket status updated to ${newStatus}`);
      fetchTickets();
    } catch (err) {
      showToast('Failed to update ticket status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      showToast('Please enter a Subject', 'error');
      return;
    }
    const currentDescription = editorRef.current ? editorRef.current.innerHTML : formData.description;
    if (!currentDescription.trim() || currentDescription === '<br>') {
      showToast('Please enter a Description', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        subject: formData.subject,
        category: formData.category || 'General',
        priority: formData.priority || 'Medium',
        status: formData.status || 'Open',
        description: currentDescription
      };

      if (formData._id) {
        await API.put(`/tickets/${formData._id}`, payload);
        showToast('Ticket updated successfully!');
      } else {
        await API.post('/tickets', payload);
        showToast('Ticket created successfully!');
      }

      fetchTickets();

      if (keepAdding && !formData._id) {
        handleResetForm();
      } else {
        setView('list');
        handleResetForm();
      }
    } catch (err) {
      console.error('Save Ticket Error:', err);
      showToast('Failed to save Ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Rich Text Editor Commands
  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, description: editorRef.current.innerHTML }));
    }
  };

  // Export & Print Actions
  const handlePrint = () => {
    window.print();
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    if (tickets.length === 0) {
      showToast('No Tickets to export', 'error');
      return;
    }
    const headers = ['Ticket Number', 'Subject', 'Category', 'Priority', 'Status', 'Description', 'Created At'];
    const rows = tickets.map(t => [
      `"${(t.ticketNumber || '').replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.priority || '').replace(/"/g, '""')}"`,
      `"${(t.status || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/<[^>]*>?/gm, '').replace(/"/g, '""')}"`,
      `"${new Date(t.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Helpdesk_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
    showToast('Exported Tickets to Excel / CSV');
  };

  // Filtering Tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.category && ticket.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.priority && ticket.priority.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || ticket.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || ticket.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || ticket.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (prio) => {
    const p = (prio || '').toLowerCase();
    if (p.includes('urgent') || p.includes('high')) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200';
    if (p.includes('medium')) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200';
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Open': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'In Progress': return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300';
      case 'On Hold': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'Resolved': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        {/* Header Breadcrumb & Title Bar matching screenshot 1 */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Helpdesk</span>
            <span>&gt;</span>
            <span className="text-gray-700 dark:text-slate-200">Ticket</span>
            {view !== 'list' && (
              <>
                <span>&gt;</span>
                <span className="text-gray-900 dark:text-white font-bold">{view === 'edit' ? 'Edit Ticket' : 'Add Ticket'}</span>
              </>
            )}
          </nav>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {view === 'list' ? 'Ticket' : (view === 'edit' ? 'Edit Ticket' : 'Add Ticket')}
            </h1>

            {/* Top Right Buttons matching screenshot 1 & 2 */}
            {view === 'list' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleResetForm();
                    setView('add');
                  }}
                  className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Add Ticket</span>
                </button>

                <button 
                  onClick={() => setSelectedCategory(selectedCategory === 'All' ? categories[0] : 'All')}
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition"
                  title="Filter Tickets"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Settings Icon -> Navigates to Helpdesk Config (Image 3 match) */}
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

                {/* Triple Dots Menu matching screenshot 2 */}
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
                        onClick={() => { fetchTickets(); setShowMenu(false); }}
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
                List all Ticket
              </button>
            )}
          </div>
        </div>

        {/* MAIN BODY CONTENT */}
        {view === 'list' ? (
          <div>
            {/* Search & Filters Bar */}
            {tickets.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search ticket #, subject or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700 dark:text-slate-300"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  <select 
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700 dark:text-slate-300"
                  >
                    <option value="All">All Priorities</option>
                    {priorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
                  </select>

                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700 dark:text-slate-300"
                  >
                    <option value="All">All Statuses</option>
                    {statusOptions.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Empty State matching Image 1 & 2 */}
            {tickets.length === 0 && !loading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 my-4 text-center flex flex-col items-center justify-center min-h-[380px] shadow-sm">
                
                {/* Central List Bullet Icon matching screenshot 1 */}
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

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Manage Tickets</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6 font-normal">
                  Tickets are used to track support requests from your employees.
                </p>

                <button 
                  onClick={() => {
                    handleResetForm();
                    setView('add');
                  }}
                  className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow transition-colors"
                >
                  Add Ticket
                </button>
              </div>
            ) : (
              /* Ticket Accordion / Table List View */
              <div className="space-y-3 mb-6">
                {filteredTickets.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700">
                    No tickets match your search criteria.
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isExpanded = expandedTicketId === ticket._id;
                    return (
                      <div 
                        key={ticket._id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200"
                      >
                        {/* Ticket Card Header Bar */}
                        <div 
                          onClick={() => setExpandedTicketId(isExpanded ? null : ticket._id)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-750 transition-colors"
                        >
                          <div className="flex items-center space-x-3 pr-4">
                            <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold shadow-sm">
                              {ticket.ticketNumber || 'HT000'}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 dark:text-white leading-snug">
                                {ticket.subject}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {ticket.category && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                                    {ticket.category}
                                  </span>
                                )}
                                {ticket.priority && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                                    Priority: {ticket.priority}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(ticket.status)}`}>
                                  {ticket.status || 'Open'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Status Change Dropdown */}
                            <select 
                              value={ticket.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(ticket, e.target.value)}
                              className="px-2 py-1 text-[11px] font-semibold bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                            >
                              {statusOptions.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(ticket);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                              title="Edit Ticket"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ticket._id);
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                              title="Delete Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded Ticket Details */}
                        {isExpanded && (
                          <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                            <h5 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Description</h5>
                            <div 
                              className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                              dangerouslySetInnerHTML={{ __html: ticket.description }}
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
          /* ADD / EDIT TICKET FORM */
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Subject & Ticket Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Ticket Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Ticket Priority & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Ticket Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  >
                    <option value="">Select Priority</option>
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  >
                    {statusOptions.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Description with Rich Text Toolbar */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>

                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
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

                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={() => {
                      if (editorRef.current) {
                        setFormData(prev => ({ ...prev, description: editorRef.current.innerHTML }));
                      }
                    }}
                    className="min-h-[180px] max-h-[350px] overflow-y-auto p-3 text-xs text-gray-800 dark:text-slate-200 outline-none leading-relaxed prose dark:prose-invert max-w-none"
                    placeholder="Description"
                  />
                </div>
              </div>

              {/* Form Bottom Bar */}
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



    </div>
  );
}

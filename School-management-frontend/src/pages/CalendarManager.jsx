import { useState, useEffect, useContext, useRef } from 'react';
import { 
  Home, ChevronRight, Plus, Filter, MoreVertical, Search, Edit3, Trash2, X, 
  Calendar as CalendarIcon, ArrowUpDown, CheckCircle, Clock
} from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function CalendarManager({ defaultType = 'holiday' }) {
  const { user } = useContext(AuthContext);
  const isManagement = user?.role === 'admin' || user?.role === 'super-admin';

  // Determine current category: 'holiday', 'celebration', or 'event'
  const [currentType, setCurrentType] = useState(defaultType);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Action Menu Popover per row
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: defaultType,
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    location: '',
    targetAudience: 'all',
    status: 'upcoming'
  });

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setCurrentType(defaultType);
    fetchEvents();
  }, [defaultType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Title formatted: 'Holiday', 'Celebration', 'Event'
  const titleText = currentType.charAt(0).toUpperCase() + currentType.slice(1);

  const handleOpenAddModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        type: item.type || currentType,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : (item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        description: item.description || '',
        location: item.location || '',
        targetAudience: item.targetAudience || 'all',
        status: item.status || 'upcoming'
      });
    } else {
      setEditingItem(null);
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        type: currentType,
        date: todayStr,
        endDate: todayStr,
        description: '',
        location: '',
        targetAudience: 'all',
        status: 'upcoming'
      });
    }
    setShowAddModal(true);
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        type: currentType // Ensure type matches current tab
      };

      if (editingItem) {
        const res = await API.put(`/events/${editingItem._id}`, payload);
        setEvents(events.map(ev => ev._id === editingItem._id ? res.data : ev));
        showToast(`${titleText} updated successfully!`);
      } else {
        const res = await API.post('/events', payload);
        setEvents([res.data, ...events]);
        showToast(`New ${titleText} added successfully!`);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to save:', err);
      showToast(err.response?.data?.message || 'Error saving entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${currentType}?`)) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents(events.filter(ev => ev._id !== id));
      showToast(`${titleText} deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete:', err);
      showToast(`Failed to delete ${currentType}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  // Helper for Duration Calculation
  const calculateDuration = (start, end) => {
    if (!start) return '1 day(s)';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day(s)`;
  };

  // Format Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort Logic
  const filteredList = events
    .filter(item => {
      const matchesType = item.type === currentType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'date' || sortField === 'createdAt' || sortField === 'endDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
        <Home className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-gray-700 dark:hover:text-slate-200">Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span>Calendar</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-800 dark:text-white font-semibold">{titleText}</span>
      </div>

      {/* Page Header Area matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {titleText}
        </h1>

        <div className="flex items-center space-x-2 self-start sm:self-auto relative">
          
          {/* Add Button */}
          {isManagement && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-750 font-semibold text-xs rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 transition flex items-center space-x-1.5"
            >
              <span>Add {titleText}</span>
            </button>
          )}

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`p-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition ${showFilterDropdown ? 'ring-2 ring-teal-500/20 border-teal-500' : ''}`}
            title="Filter options"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* More Options Button */}
          <button
            className="p-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Filter Popover */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 dark:border-slate-700">
                <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Filter List</span>
                <button onClick={() => setShowFilterDropdown(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">Search Name</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Table Card matching screenshot exactly */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto" />
            <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 font-medium">Loading {titleText.toLowerCase()}s...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No {titleText.toLowerCase()} records found</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">There are no items scheduled under {titleText}.</p>
            {isManagement && (
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-4 px-4 py-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900 rounded-xl text-xs font-bold hover:bg-teal-100 transition"
              >
                + Add {titleText}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-[11.5px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-900/30">
                  
                  {/* NAME COLUMN */}
                  <th 
                    onClick={() => handleSort('title')} 
                    className="py-4 px-6 cursor-pointer hover:text-gray-800 dark:hover:text-white transition"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>NAME</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>

                  {/* START DATE COLUMN */}
                  <th 
                    onClick={() => handleSort('date')} 
                    className="py-4 px-6 cursor-pointer hover:text-gray-800 dark:hover:text-white transition"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>START DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>

                  {/* END DATE COLUMN */}
                  <th 
                    onClick={() => handleSort('endDate')} 
                    className="py-4 px-6 cursor-pointer hover:text-gray-800 dark:hover:text-white transition"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>END DATE</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>

                  {/* DURATION COLUMN */}
                  <th className="py-4 px-6">
                    <span>DURATION</span>
                  </th>

                  {/* CREATED AT COLUMN */}
                  <th 
                    onClick={() => handleSort('createdAt')} 
                    className="py-4 px-6 cursor-pointer hover:text-gray-800 dark:hover:text-white transition"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>CREATED AT</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>

                  {/* ACTIONS COLUMN */}
                  <th className="py-4 px-6 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/80 text-xs font-medium text-gray-700 dark:text-slate-200">
                {filteredList.map((row) => (
                  <tr 
                    key={row._id} 
                    className="hover:bg-gray-50/70 dark:hover:bg-slate-750/50 transition-colors"
                  >
                    {/* NAME */}
                    <td className="py-4 px-6 font-semibold text-gray-800 dark:text-white">
                      {row.title}
                    </td>

                    {/* START DATE */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300">
                      {formatDate(row.date)}
                    </td>

                    {/* END DATE */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300">
                      {formatDate(row.endDate || row.date)}
                    </td>

                    {/* DURATION */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300">
                      {calculateDuration(row.date, row.endDate)}
                    </td>

                    {/* CREATED AT */}
                    <td className="py-4 px-6 text-gray-500 dark:text-slate-400">
                      {formatDateTime(row.createdAt || row.date)}
                    </td>

                    {/* ACTIONS (Three Dots Popover Menu matching screenshot) */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === row._id ? null : row._id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Action Dropdown Menu */}
                      {activeMenuId === row._id && (
                        <div className="absolute right-6 top-10 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-30 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                          {isManagement && (
                            <button
                              onClick={() => handleOpenAddModal(row)}
                              className="w-full px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-500" />
                              <span>Edit</span>
                            </button>
                          )}
                          {isManagement && (
                            <button
                              onClick={() => handleDelete(row._id)}
                              className="w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-700 animate-in zoom-in duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingItem ? `Edit ${titleText}` : `Add New ${titleText}`}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${titleText} Name`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? `Update ${titleText}` : `Save ${titleText}`}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

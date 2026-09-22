import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Building, Edit3, Trash2, Eye,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Users, Bed, Layers
} from 'lucide-react';

export default function Hostel({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [viewingHostel, setViewingHostel] = useState(null);

  // Form state (Matches Screenshot 1)
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    contactNumber: '',
    contactEmail: '',
    address: '',
    description: '',
    type: 'Boys'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await API.get('/hostel');
      setHostels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching hostels:', err);
      showToast('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useSchoolRefresh(() => {
    fetchHostels();
  });

  const resetForm = () => {
    setFormData({
      name: '',
      alias: '',
      contactNumber: '',
      contactEmail: '',
      address: '',
      description: '',
      type: 'Boys'
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Hostel Name');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/hostel/${currentEditId}`, formData);
        showToast('Hostel updated successfully!');
      } else {
        await API.post('/hostel', formData);
        showToast('Hostel created successfully!');
      }

      await fetchHostels();

      if (keepAdding) {
        resetForm();
      } else {
        setViewMode('list');
        setCurrentEditId(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving hostel:', err);
      showToast(err.response?.data?.message || 'Error saving hostel');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (h) => {
    setCurrentEditId(h._id);
    setFormData({
      name: h.name || '',
      alias: h.alias || '',
      contactNumber: h.contactNumber || '',
      contactEmail: h.contactEmail || '',
      address: h.address || '',
      description: h.description || '',
      type: h.type || 'Boys'
    });
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Hostel and its related records?')) return;
    try {
      await API.delete(`/hostel/${id}`);
      showToast('Hostel deleted successfully');
      setHostels(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('Error deleting hostel:', err);
      showToast('Failed to delete hostel');
    }
  };

  const filteredHostels = hostels.filter(h => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || h.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredHostels.length / itemsPerPage) || 1;
  const paginatedHostels = filteredHostels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-fade-in text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Hostel</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Hostel</span>
          {viewMode !== 'list' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-semibold">
                {viewMode === 'add' ? 'Add Hostel' : 'Edit Hostel'}
              </span>
            </>
          )}
        </div>

        {/* Header Bar with Sub-Nav Buttons (Matches Screenshot 4) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Hostel' : viewMode === 'add' ? 'Add Hostel' : 'Edit Hostel'}
          </h1>

          {viewMode === 'list' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/hostel/incharge"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Incharge
              </Link>
              <Link
                to="/hostel/floor"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Floor
              </Link>
              <Link
                to="/hostel/room"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Room
              </Link>
              <button
                onClick={() => {
                  resetForm();
                  setViewMode('add');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>Add Hostel</span>
              </button>

              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                title="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        fetchHostels();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setViewMode('list');
                setCurrentEditId(null);
              }}
              className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-2"
            >
              <List className="w-3.5 h-3.5" />
              <span>List all Hostel</span>
            </button>
          )}
        </div>

        {/* VIEW 1: ADD / EDIT HOSTEL FORM (Exact match with Screenshot 1) */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Name, Alias, Contact Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Alias
                  </label>
                  <input
                    type="text"
                    placeholder="Alias"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>
              </div>

              {/* Row 2: Contact Email, Address, Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="Contact Email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={1}
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={1}
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>
              </div>

              {/* Bottom Actions Bar (Exact Screenshot 1 styling) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full text-xs font-medium transition"
                  >
                    Reset
                  </button>

                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepAdding}
                      onChange={(e) => setKeepAdding(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Keep Adding</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setCurrentEditId(null);
                    }}
                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold shadow transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded text-xs font-semibold shadow transition flex items-center gap-1.5"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: HOSTEL LIST / DASHBOARD (Matches Screenshot 4 & Data Table) */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* If 0 hostels, show screenshot 4 empty state card */}
            {hostels.length === 0 && !loading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-4 text-slate-400">
                  <List className="w-12 h-12 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  List all Hostels
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Manage all Hostels
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setViewMode('add');
                  }}
                  className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded text-xs font-semibold shadow transition"
                >
                  Add Hostel
                </button>
              </div>
            ) : (
              /* Hostels Table View */
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search hostels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Total Hostels: <span className="font-semibold text-slate-800 dark:text-white">{filteredHostels.length}</span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">HOSTEL NAME ⇅</th>
                        <th className="py-3.5 px-4 font-semibold">ALIAS</th>
                        <th className="py-3.5 px-4 font-semibold">CONTACT</th>
                        <th className="py-3.5 px-4 font-semibold">INCHARGE</th>
                        <th className="py-3.5 px-4 font-semibold">FLOORS / ROOMS</th>
                        <th className="py-3.5 px-4 font-semibold">CAPACITY</th>
                        <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                            Loading hostels...
                          </td>
                        </tr>
                      ) : paginatedHostels.map((h) => (
                        <tr
                          key={h._id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                        >
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Building className="w-4 h-4 text-indigo-500" />
                            <span>{h.name}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {h.alias || '—'}
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            <div>{h.contactNumber || '—'}</div>
                            {h.contactEmail && (
                              <div className="text-[11px] text-slate-400">{h.contactEmail}</div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {h.inchargeName || 'Not Assigned'}
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {h.floorCount || 0} Floors / {h.roomCount || 0} Rooms
                          </td>

                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            {h.totalOccupancy || 0} / {h.totalCapacity || 0} Beds
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(h)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(h._id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-600"
                                title="Delete"
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

                {/* Pagination Footer */}
                <div className="p-3.5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                  <div>
                    Showing {filteredHostels.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredHostels.length)} of {filteredHostels.length} results
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>

                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        &lt;
                      </button>
                      <span className="px-3 py-1 bg-[#1e293b] text-white font-semibold">
                        {currentPage}
                      </span>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

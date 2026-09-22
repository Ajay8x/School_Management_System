import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Building, Edit3, Trash2, Eye,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Layers, Bed
} from 'lucide-react';

export default function BuildingBlock({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form state
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/asset/building/blocks');
      setBlocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      showToast('Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  useSchoolRefresh(() => {
    fetchBlocks();
  });

  const resetForm = () => {
    setFormData({ name: '', alias: '', description: '' });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Block Name');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/asset/building/blocks/${currentEditId}`, formData);
        showToast('Block updated successfully!');
      } else {
        await API.post('/asset/building/blocks', formData);
        showToast('Block created successfully!');
      }

      await fetchBlocks();

      if (keepAdding) {
        resetForm();
      } else {
        setViewMode('list');
        setCurrentEditId(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving block:', err);
      showToast(err.response?.data?.message || 'Error saving block');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b) => {
    setCurrentEditId(b._id);
    setFormData({
      name: b.name || '',
      alias: b.alias || '',
      description: b.description || ''
    });
    setViewMode('edit');
    setActiveMenuId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Block and all its floors/rooms?')) return;
    try {
      await API.delete(`/asset/building/blocks/${id}`);
      showToast('Block deleted successfully');
      setBlocks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting block:', err);
      showToast('Failed to delete block');
    }
  };

  const filteredBlocks = blocks.filter(b =>
    searchTerm.trim() === '' ||
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage) || 1;
  const paginatedBlocks = filteredBlocks.slice(
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

      {/* Main Container */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb (Matches Screenshot 1) */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Asset</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Building</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-200 font-semibold">
            {viewMode === 'list' ? 'Block' : viewMode === 'add' ? 'Add Block' : 'Edit Block'}
          </span>
        </div>

        {/* Header Bar (Matches Screenshot 1) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Block' : viewMode === 'add' ? 'Add Block' : 'Edit Block'}
          </h1>

          {viewMode === 'list' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/asset/building/floor"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Floor
              </Link>
              <Link
                to="/asset/building/room"
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
                <span>Add Block</span>
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
                        fetchBlocks();
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
              <span>List all Block</span>
            </button>
          )}
        </div>

        {/* VIEW 1: BLOCK LIST TABLE (Matches Screenshot 1) */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div className="text-xs text-slate-500">
                Total Blocks: <span className="font-semibold text-slate-800 dark:text-white">{filteredBlocks.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">NAME ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">ALIAS ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">CREATED AT ⇅</th>
                    <th className="py-3.5 px-4 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading blocks...
                      </td>
                    </tr>
                  ) : paginatedBlocks.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        No building blocks found. Click "Add Block" above.
                      </td>
                    </tr>
                  ) : (
                    paginatedBlocks.map((b) => (
                      <tr
                        key={b._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        {/* NAME */}
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-500" />
                          <span>{b.name}</span>
                        </td>

                        {/* ALIAS */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {b.alias || '—'}
                        </td>

                        {/* CREATED AT */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(b.createdAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        {/* Actions Menu */}
                        <td className="py-3 px-4 text-right relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === b._id ? null : b._id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === b._id && (
                            <div className="absolute right-4 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 text-left text-xs">
                              <button
                                onClick={() => handleEdit(b)}
                                className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-500" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDelete(b._id);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
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

            {/* Pagination Footer */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                Showing {filteredBlocks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredBlocks.length)} of {filteredBlocks.length} results
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

        {/* VIEW 2: ADD / EDIT BLOCK FORM */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Block Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Academic Block, Science Block"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Alias / Short Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aca Block, SB"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Block description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                />
              </div>

              {/* Bottom Actions */}
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
      </div>
    </div>
  );
}

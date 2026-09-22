import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Bed, Edit3, Trash2, Eye,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Building, Layers
} from 'lucide-react';

export default function BuildingRoom({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    block: '',
    floor: '',
    type: 'Classroom',
    capacity: 40,
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [roomRes, blockRes, floorRes] = await Promise.all([
        API.get('/asset/building/rooms'),
        API.get('/asset/building/blocks'),
        API.get('/asset/building/floors')
      ]);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : []);
      setBlocks(Array.isArray(blockRes.data) ? blockRes.data : []);
      setFloors(Array.isArray(floorRes.data) ? floorRes.data : []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      showToast('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useSchoolRefresh(() => {
    fetchAllData();
  });

  const resetForm = () => {
    setFormData({
      name: '',
      alias: '',
      block: '',
      floor: '',
      type: 'Classroom',
      capacity: 40,
      description: ''
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Room Name or Number');
      return;
    }
    if (!formData.block) {
      showToast('Please select a Block');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/asset/building/rooms/${currentEditId}`, formData);
        showToast('Room updated successfully!');
      } else {
        await API.post('/asset/building/rooms', formData);
        showToast('Room created successfully!');
      }

      await fetchAllData();

      if (keepAdding) {
        resetForm();
      } else {
        setViewMode('list');
        setCurrentEditId(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving room:', err);
      showToast(err.response?.data?.message || 'Error saving room');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r) => {
    setCurrentEditId(r._id);
    setFormData({
      name: r.name || '',
      alias: r.alias || '',
      block: r.block?._id || r.block || '',
      floor: r.floor?._id || r.floor || '',
      type: r.type || 'Classroom',
      capacity: r.capacity || 40,
      description: r.description || ''
    });
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Room?')) return;
    try {
      await API.delete(`/asset/building/rooms/${id}`);
      showToast('Room deleted successfully');
      setRooms(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting room:', err);
      showToast('Failed to delete room');
    }
  };

  const filteredFloors = floors.filter(f => !formData.block || String(f.block?._id || f.block) === String(formData.block));

  const filteredRooms = rooms.filter(r =>
    searchTerm.trim() === '' ||
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.blockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.floorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-fade-in text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Asset</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Building</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Room</span>
          {viewMode !== 'list' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-semibold">
                {viewMode === 'add' ? 'Add Room' : 'Edit Room'}
              </span>
            </>
          )}
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Room' : viewMode === 'add' ? 'Add Room' : 'Edit Room'}
          </h1>

          {viewMode === 'list' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/asset/building/block"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Block
              </Link>
              <Link
                to="/asset/building/floor"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Floor
              </Link>
              <button
                onClick={() => {
                  resetForm();
                  setViewMode('add');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>Add Room</span>
              </button>
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
              <span>List all Room</span>
            </button>
          )}
        </div>

        {/* VIEW 1: ADD / EDIT FORM */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Room Name / Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101, Chemistry Lab"
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
                    placeholder="Alias"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Block <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value, floor: '' })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  >
                    <option value="">Select Block</option>
                    {blocks.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Floor
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  >
                    <option value="">Select Floor</option>
                    {filteredFloors.map(f => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Room Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Staff Room">Staff Room</option>
                    <option value="Office">Office</option>
                    <option value="Library">Library</option>
                    <option value="Store Room">Store Room</option>
                    <option value="Hall">Hall</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
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
                  placeholder="Room description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                />
              </div>

              {/* Bottom Actions Bar */}
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

        {/* VIEW 2: LIST TABLE */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div className="text-xs text-slate-500">
                Total Rooms: <span className="font-semibold text-slate-800 dark:text-white">{filteredRooms.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">ROOM NAME ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">ALIAS</th>
                    <th className="py-3.5 px-4 font-semibold">BLOCK</th>
                    <th className="py-3.5 px-4 font-semibold">FLOOR</th>
                    <th className="py-3.5 px-4 font-semibold">TYPE</th>
                    <th className="py-3.5 px-4 font-semibold">CAPACITY</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading rooms...
                      </td>
                    </tr>
                  ) : paginatedRooms.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No rooms found. Click "Add Room" above.
                      </td>
                    </tr>
                  ) : (
                    paginatedRooms.map((r) => (
                      <tr
                        key={r._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Bed className="w-4 h-4 text-indigo-500" />
                          <span>{r.name}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {r.alias || '—'}
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">
                          {r.blockName || r.block?.name || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {r.floorName || r.floor?.name || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {r.type}
                        </td>

                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {r.capacity} seats
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                Showing {filteredRooms.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} results
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
    </div>
  );
}

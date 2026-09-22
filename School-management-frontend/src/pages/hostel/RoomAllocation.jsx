import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Bed, Edit3, Trash2, Eye,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Building, User, Calendar
} from 'lucide-react';

export default function RoomAllocation({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [allocations, setAllocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // Form state (Matches Screenshot 2)
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    room: '',
    student: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    remarks: '',
    status: 'Active'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allocRes, roomRes, studentRes, hostelRes] = await Promise.all([
        API.get('/hostel/allocations'),
        API.get('/hostel/rooms'),
        API.get('/students'),
        API.get('/hostel')
      ]);
      setAllocations(Array.isArray(allocRes.data) ? allocRes.data : []);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : []);
      setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
      setHostels(Array.isArray(hostelRes.data) ? hostelRes.data : []);
    } catch (err) {
      console.error('Error fetching room allocations:', err);
      showToast('Failed to load room allocations');
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
      room: '',
      student: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      remarks: '',
      status: 'Active'
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.room) {
      showToast('Please select a Room');
      return;
    }
    if (!formData.student) {
      showToast('Please select a Student');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/hostel/allocations/${currentEditId}`, formData);
        showToast('Room Allocation updated successfully!');
      } else {
        await API.post('/hostel/allocations', formData);
        showToast('Room Allocation created successfully!');
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
      console.error('Error saving allocation:', err);
      showToast(err.response?.data?.message || 'Error saving room allocation');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (alloc) => {
    setCurrentEditId(alloc._id);
    setFormData({
      room: alloc.room?._id || alloc.room || '',
      student: alloc.student?._id || alloc.student || '',
      startDate: alloc.startDate ? new Date(alloc.startDate).toISOString().split('T')[0] : '',
      endDate: alloc.endDate ? new Date(alloc.endDate).toISOString().split('T')[0] : '',
      remarks: alloc.remarks || '',
      status: alloc.status || 'Active'
    });
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this Room Allocation?')) return;
    try {
      await API.delete(`/hostel/allocations/${id}`);
      showToast('Room Allocation removed successfully');
      setAllocations(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting allocation:', err);
      showToast('Failed to delete allocation');
    }
  };

  const filteredAllocations = allocations.filter(a => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentRoll?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.hostelName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage) || 1;
  const paginatedAllocations = filteredAllocations.slice(
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
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Hostel</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Room Allocation</span>
          {viewMode !== 'list' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-semibold">
                {viewMode === 'add' ? 'Add Room Allocation' : 'Edit Room Allocation'}
              </span>
            </>
          )}
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list'
              ? 'Room Allocation'
              : viewMode === 'add'
              ? 'Add Room Allocation'
              : 'Edit Room Allocation'}
          </h1>

          {viewMode === 'list' ? (
            <button
              onClick={() => {
                resetForm();
                setViewMode('add');
              }}
              className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room Allocation</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setViewMode('list');
                setCurrentEditId(null);
              }}
              className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-2"
            >
              <List className="w-3.5 h-3.5" />
              <span>List all Room Allocation</span>
            </button>
          )}
        </div>

        {/* FORM VIEW (Exact match with Screenshot 2) */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Room, Select Student, Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Room <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  >
                    <option value="">Room</option>
                    {rooms.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.roomNumber} ({r.hostelName || 'Hostel'}) - {r.type} ({r.currentOccupancy || 0}/{r.capacity} beds)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name || `${s.firstName || ''} ${s.lastName || ''}`} (Roll: {s.rollNumber || s.admissionNumber || 'N/A'}) - {s.className || 'Class'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: End Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                />
              </div>

              {/* Bottom Actions Bar (Exact Screenshot 2 styling) */}
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

        {/* LIST TABLE VIEW */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search allocations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div className="text-xs text-slate-500">
                Total Allocations: <span className="font-semibold text-slate-800 dark:text-white">{filteredAllocations.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">STUDENT ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">ROOM & HOSTEL</th>
                    <th className="py-3.5 px-4 font-semibold">START DATE</th>
                    <th className="py-3.5 px-4 font-semibold">END DATE</th>
                    <th className="py-3.5 px-4 font-semibold">STATUS</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading room allocations...
                      </td>
                    </tr>
                  ) : paginatedAllocations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No room allocations found. Click "Add Room Allocation" above.
                      </td>
                    </tr>
                  ) : (
                    paginatedAllocations.map((a) => (
                      <tr
                        key={a._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{a.studentName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Roll: {a.studentRoll || '—'} {a.studentClass && `(${a.studentClass})`}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            Room {a.roomName || a.room?.roomNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {a.hostelName || a.hostel?.name || ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {a.startDate ? new Date(a.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {a.endDate ? new Date(a.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(a)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(a._id)}
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

            {/* Pagination */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                Showing {filteredAllocations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAllocations.length)} of {filteredAllocations.length} results
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

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, UserCheck, Edit3, Trash2, Eye,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Building, Calendar, User
} from 'lucide-react';

export default function HostelIncharge({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [incharges, setIncharges] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
    hostel: '',
    employee: '',
    employeeName: '',
    employeePhone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Present',
    remarks: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [incRes, hRes, tRes] = await Promise.all([
        API.get('/hostel/incharges'),
        API.get('/hostel'),
        API.get('/teachers')
      ]);
      setIncharges(Array.isArray(incRes.data) ? incRes.data : []);
      setHostels(Array.isArray(hRes.data) ? hRes.data : []);
      setTeachers(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (err) {
      console.error('Error fetching hostel incharge data:', err);
      showToast('Failed to load hostel incharge data');
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

  const handleTeacherSelect = (teacherId) => {
    const selected = teachers.find(t => t._id === teacherId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        employee: selected._id,
        employeeName: `${selected.firstName || ''} ${selected.lastName || ''}`.trim() || selected.name,
        employeePhone: selected.phone || selected.mobile || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employee: '',
        employeeName: '',
        employeePhone: ''
      }));
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.hostel) {
      showToast('Please select a Hostel');
      return;
    }
    if (!formData.employeeName.trim()) {
      showToast('Please select or enter Employee Name');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/hostel/incharges/${currentEditId}`, formData);
        showToast('Hostel Incharge updated successfully!');
      } else {
        await API.post('/hostel/incharges', formData);
        showToast('Hostel Incharge assigned successfully!');
      }

      await fetchAllData();

      if (keepAdding) {
        setFormData({
          hostel: '',
          employee: '',
          employeeName: '',
          employeePhone: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Present',
          remarks: ''
        });
      } else {
        setViewMode('list');
        setCurrentEditId(null);
      }
    } catch (err) {
      console.error('Error saving incharge:', err);
      showToast(err.response?.data?.message || 'Error saving incharge');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (inc) => {
    setCurrentEditId(inc._id);
    setFormData({
      hostel: inc.hostel?._id || inc.hostel || '',
      employee: inc.employee?._id || inc.employee || '',
      employeeName: inc.employeeName || '',
      employeePhone: inc.employeePhone || '',
      startDate: inc.startDate ? new Date(inc.startDate).toISOString().split('T')[0] : '',
      endDate: inc.endDate ? new Date(inc.endDate).toISOString().split('T')[0] : '',
      status: inc.status || 'Present',
      remarks: inc.remarks || ''
    });
    setViewMode('edit');
    setActiveMenuId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Incharge assignment?')) return;
    try {
      await API.delete(`/hostel/incharges/${id}`);
      showToast('Hostel Incharge assignment deleted');
      setIncharges(prev => prev.filter(inc => inc._id !== id));
    } catch (err) {
      console.error('Error deleting incharge:', err);
      showToast('Failed to delete incharge record');
    }
  };

  const filteredIncharges = incharges.filter(inc =>
    searchTerm.trim() === '' ||
    inc.hostelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIncharges.length / itemsPerPage) || 1;
  const paginatedIncharges = filteredIncharges.slice(
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
          <span className="text-slate-700 dark:text-slate-200 font-semibold">Hostel Incharge</span>
        </div>

        {/* Header bar (Matches Screenshot 3) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Hostel Incharge' : viewMode === 'add' ? 'Add Hostel Incharge' : 'Edit Hostel Incharge'}
          </h1>

          {viewMode === 'list' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFormData({
                    hostel: '',
                    employee: '',
                    employeeName: '',
                    employeePhone: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'Present',
                    remarks: ''
                  });
                  setViewMode('add');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>Add Hostel Incharge</span>
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
                        fetchAllData();
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
              <span>List all Hostel Incharge</span>
            </button>
          )}
        </div>

        {/* VIEW 1: LIST TABLE (Matches Screenshot 3) */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search incharge records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div className="text-xs text-slate-500">
                Total Records: <span className="font-semibold text-slate-800 dark:text-white">{filteredIncharges.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">HOSTEL</th>
                    <th className="py-3.5 px-4 font-semibold">EMPLOYEE</th>
                    <th className="py-3.5 px-4 font-semibold">PERIOD ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">CREATED AT ⇅</th>
                    <th className="py-3.5 px-4 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading incharge records...
                      </td>
                    </tr>
                  ) : paginatedIncharges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        No hostel incharge assignments found. Click "Add Hostel Incharge" above.
                      </td>
                    </tr>
                  ) : (
                    paginatedIncharges.map((inc) => (
                      <tr
                        key={inc._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        {/* HOSTEL */}
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                          {inc.hostelName || inc.hostel?.name || '—'}
                        </td>

                        {/* EMPLOYEE */}
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                          <div className="font-medium">{inc.employeeName}</div>
                          {inc.employeePhone && (
                            <div className="text-[11px] text-slate-400">{inc.employeePhone}</div>
                          )}
                        </td>

                        {/* PERIOD */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {inc.startDate ? new Date(inc.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                          {' '}-{' '}
                          {inc.endDate ? new Date(inc.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Present'}
                        </td>

                        {/* CREATED AT */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(inc.createdAt).toLocaleString('en-US', {
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
                            onClick={() => setActiveMenuId(activeMenuId === inc._id ? null : inc._id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === inc._id && (
                            <div className="absolute right-4 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 text-left text-xs">
                              <button
                                onClick={() => handleEdit(inc)}
                                className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-500" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDelete(inc._id);
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
                Showing {filteredIncharges.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredIncharges.length)} of {filteredIncharges.length} results
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

        {/* VIEW 2: ADD / EDIT INCHARGE FORM */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hostel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Hostel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                    required
                  >
                    <option value="">-- Select Hostel --</option>
                    {hostels.map(h => (
                      <option key={h._id} value={h._id}>{h.name} {h.alias && `(${h.alias})`}</option>
                    ))}
                  </select>
                </div>

                {/* Employee / Teacher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Select Staff / Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employee}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                  >
                    <option value="">-- Select Employee --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name || `${t.firstName || ''} ${t.lastName || ''}`} ({t.designation || 'Teacher'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Incharge Name (Manual input or auto-filled) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Incharge Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                    required
                  />
                </div>

                {/* Incharge Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.employeePhone}
                    onChange={(e) => setFormData({ ...formData, employeePhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    End Date (Leave blank if Present)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about responsibility or shift..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded transition"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        hostel: '',
                        employee: '',
                        employeeName: '',
                        employeePhone: '',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: '',
                        status: 'Present',
                        remarks: ''
                      });
                    }}
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

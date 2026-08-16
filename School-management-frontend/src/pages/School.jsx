import React, { useState, useEffect, useContext } from 'react';
import { Home, Filter, MoreVertical, Plus, Edit2, Trash2, CheckCircle, AlertCircle, RefreshCw, Check, Building2 } from 'lucide-react';
import { SchoolContext } from '../context/SchoolContext';
import API from '../api/axios';

export default function School({ initialView = 'list' }) {
  const { schools, currentSchool, switchSchool, createSchool, deleteSchool, fetchSchools } = useContext(SchoolContext);
  
  const [view, setView] = useState(initialView); // 'list' or 'add'
  const [organizations, setOrganizations] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    organization: '',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    city: '',
    state: ''
  });
  const [keepAdding, setKeepAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch Organizations for dropdown selection
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const res = await API.get('/organizations');
        setOrganizations(res.data || []);
      } catch (err) {
        console.warn('Could not load organizations list:', err);
      }
    };
    loadOrgs();
    if (fetchSchools) fetchSchools();
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      organization: '',
      email: '',
      phone: '',
      website: '',
      addressLine1: '',
      city: '',
      state: ''
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'School Name is required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        await API.put(`/schools/${editingId}`, formData);
        setMessage({ type: 'success', text: 'School updated successfully!' });
      } else {
        await createSchool(formData);
        setMessage({ type: 'success', text: 'New School added successfully!' });
      }

      if (fetchSchools) await fetchSchools();

      if (keepAdding && !editingId) {
        handleReset();
      } else {
        setTimeout(() => {
          handleReset();
          setView('list');
        }, 1000);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save school'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (school) => {
    setFormData({
      name: school.name || school.appName || '',
      code: school.code || '',
      organization: school.organization || '',
      email: school.email || '',
      phone: school.phone || '',
      website: school.website || '',
      addressLine1: school.addressLine1 || school.address || '',
      city: school.city || '',
      state: school.state || ''
    });
    setEditingId(school._id);
    setView('add');
  };

  const handleDeleteSchool = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name || 'this school'}?`)) return;
    try {
      await deleteSchool(id);
      setMessage({ type: 'success', text: 'School deleted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete school' });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(schools.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'January 29, 2025 9:33 AM';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'January 29, 2025 9:33 AM';
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between">
      <div>
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            {/* Breadcrumb matching screenshots */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
              <Home className="w-3.5 h-3.5" />
              <span>&gt;</span>
              <span>Dashboard</span>
              <span>&gt;</span>
              <span 
                className={`cursor-pointer hover:text-gray-800 dark:hover:text-slate-200 ${view === 'list' ? 'text-gray-700 dark:text-slate-300 font-bold' : ''}`}
                onClick={() => setView('list')}
              >
                School
              </span>
              {view === 'add' && (
                <>
                  <span>&gt;</span>
                  <span className="text-gray-700 dark:text-slate-300 font-bold">
                    {editingId ? 'Edit School' : 'Add School'}
                  </span>
                </>
              )}
            </div>
            
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {view === 'add' ? (editingId ? 'Edit School' : 'Add School') : 'School'}
            </h1>
          </div>

          {/* Top Right Action Buttons (Screenshot 1 Match) */}
          <div className="flex items-center space-x-3">
            {view === 'list' ? (
              <>
                <button
                  onClick={() => {
                    handleReset();
                    setView('add');
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition text-sm font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add School
                </button>
                <button 
                  onClick={fetchSchools}
                  className="w-9 h-9 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                  title="Filter / Refresh"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button 
                  className="w-9 h-9 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-750 transition"
                  title="More actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleReset();
                  setView('list');
                }}
                className="px-5 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl shadow-md transition text-sm font-semibold"
              >
                List all School
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* VIEW 1: LIST SCHOOLS (Screenshot 1 Match) */}
        {view === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-3 w-10">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={schools.length > 0 && selectedIds.length === schools.length}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 uppercase">NAME ⇅</th>
                    <th className="py-3 px-4 uppercase">ORGANIZATION</th>
                    <th className="py-3 px-4 uppercase">USER</th>
                    <th className="py-3 px-4 uppercase">CREATED AT ⇅</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm">
                  {schools.map((school) => {
                    const isActive = currentSchool && currentSchool._id === school._id;
                    const schoolName = school.name || school.appName || 'School';
                    const schoolCode = school.code || 'DIS001';

                    return (
                      <tr 
                        key={school._id} 
                        className={`hover:bg-gray-50/70 dark:hover:bg-slate-700/40 transition cursor-pointer ${
                          isActive ? 'bg-teal-50/30 dark:bg-teal-950/20' : ''
                        }`}
                        onClick={() => switchSchool(school)}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(school._id)}
                            onChange={() => handleToggleSelect(school._id)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* NAME + Blue/Teal Checkmark Badge */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 dark:text-white text-[15px]">
                              {schoolName}
                            </span>

                            {/* Blue/Teal Checkmark Icon matching Screenshot 1 */}
                            {isActive && (
                              <span 
                                title="Active Selected School"
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] shadow-sm flex-shrink-0"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-slate-400 font-mono mt-0.5">
                            {schoolCode}
                          </div>
                        </td>

                        {/* ORGANIZATION */}
                        <td className="py-4 px-4 text-gray-600 dark:text-slate-300">
                          {school.organization || '-'}
                        </td>

                        {/* USER */}
                        <td className="py-4 px-4">
                          <div className="text-xs text-gray-800 dark:text-slate-200 font-semibold">
                            {school.adminName || 'Admin'} <span className="text-gray-500 font-normal">({school.email || 'admin@campuspilot.in'})</span>
                          </div>
                          <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-slate-400 tracking-wider mt-0.5">
                            ADMIN
                          </div>
                        </td>

                        {/* CREATED AT */}
                        <td className="py-4 px-4 text-xs text-gray-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(school.createdAt)}
                        </td>

                        {/* Actions menu */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            {isActive ? (
                              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={() => switchSchool(school)}
                                className="text-xs font-semibold text-gray-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                              >
                                Switch
                              </button>
                            )}

                            <button 
                              onClick={() => handleEdit(school)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchool(school._id, schoolName)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: ADD / EDIT SCHOOL FORM */}
        {view === 'add' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 transition-colors duration-300">
            <form onSubmit={handleSubmit}>
              {/* 3-Column Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="School Name"
                    required
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 2. Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Code (e.g. DIS001)"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 3. Organization Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Organization
                  </label>
                  <select
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition cursor-pointer"
                  >
                    <option value="" className="dark:bg-slate-800">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org.name} className="dark:bg-slate-800">
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 5. Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 6. Website */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Website"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 7. Address Line 1 */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 8. City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 9. State */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    State / Region
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                {/* Left side: Reset & Keep Adding */}
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-lg transition"
                  >
                    Reset
                  </button>

                  {!editingId && (
                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span>Keep Adding</span>
                    </label>
                  )}
                </div>

                {/* Right side: Cancel & Save */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleReset();
                      setView('list');
                    }}
                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Campus pilot Footer Branding */}
      <div className="mt-8 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-4">
        Campus pilot
      </div>
    </div>
  );
}

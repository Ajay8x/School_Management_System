import React, { useState, useEffect } from 'react';
import { Home, List, Filter, MoreVertical, Plus, Edit2, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../api/axios';

export default function Organization({ initialView = 'list' }) {
  const [view, setView] = useState(initialView); // 'list' or 'add'
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactNumber: '',
    email: '',
    website: '',
    address: ''
  });
  const [keepAdding, setKeepAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch Organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/organizations');
      setOrganizations(res.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
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
      contactNumber: '',
      email: '',
      website: '',
      address: ''
    });
    setEditingId(null);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Organization Name is required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        await API.put(`/organizations/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Organization updated successfully!' });
      } else {
        await API.post('/organizations', formData);
        setMessage({ type: 'success', text: 'Organization created successfully!' });
      }

      await fetchOrganizations();

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
        text: err.response?.data?.message || 'Failed to save organization'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (org) => {
    setFormData({
      name: org.name || '',
      code: org.code || '',
      contactNumber: org.contactNumber || '',
      email: org.email || '',
      website: org.website || '',
      address: org.address || ''
    });
    setEditingId(org._id);
    setView('add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      await API.delete(`/organizations/${id}`);
      setMessage({ type: 'success', text: 'Organization deleted successfully!' });
      fetchOrganizations();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete organization' });
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
                Organization
              </span>
              {view === 'add' && (
                <>
                  <span>&gt;</span>
                  <span className="text-gray-700 dark:text-slate-300 font-bold">
                    {editingId ? 'Edit Organization' : 'Add Organization'}
                  </span>
                </>
              )}
            </div>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {view === 'add' ? (editingId ? 'Edit Organization' : 'Add Organization') : 'Organization'}
            </h1>
          </div>

          {/* Top Right Action Buttons */}
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
                  Add Organization
                </button>
                <button
                  onClick={fetchOrganizations}
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
                List all Organization
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 text-sm font-medium ${message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* VIEW 1: LIST ORGANIZATIONS */}
        {view === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 transition-colors duration-300">
            {loading ? (
              <div className="py-20 text-center text-gray-400 dark:text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-500" />
                <span>Loading organizations...</span>
              </div>
            ) : organizations.length === 0 ? (
              /* Screenshot 1 Match: Empty State */
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 border border-gray-100 dark:border-slate-600">
                  <List className="w-8 h-8 stroke-[2]" />
                </div>

                <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  List all organizations
                </h3>

                <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-6">
                  Organizations are running bodies of your institute. Manage your organizations here.
                </p>

                <button
                  onClick={() => {
                    handleReset();
                    setView('add');
                  }}
                  className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  Add Organization
                </button>
              </div>
            ) : (
              /* Datatable when Organizations exist */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700 text-xs uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Contact Number</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm">
                    {organizations.map((org) => (
                      <tr key={org._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4 font-bold text-gray-800 dark:text-white">{org.name}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300 font-mono text-xs">{org.code || '-'}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300">{org.contactNumber || '-'}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300">{org.email || '-'}</td>
                        <td className="py-3.5 px-4 text-teal-600 dark:text-teal-400 truncate max-w-[150px]">{org.website || '-'}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300 truncate max-w-[200px]">{org.address || '-'}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(org)}
                            className="p-1.5 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(org._id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
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
            )}
          </div>
        )}

        {/* VIEW 2: ADD / EDIT ORGANIZATION FORM (Screenshot 2 Match) */}
        {view === 'add' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 transition-colors duration-300">
            <form onSubmit={handleSubmit}>
              {/* 3-Column Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
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
                    placeholder="Code"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>

                {/* 3. Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Contact Number"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
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

                {/* 5. Website */}
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

                {/* 6. Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full px-3.5 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 transition"
                  />
                </div>
              </div>

              {/* Form Footer Actions (Screenshot 2 Match) */}
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

      {/* Campus Pilot Footer Branding */}
      <div className="mt-8 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-4">
        Campus Pilot
      </div>
    </div>
  );
}

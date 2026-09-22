import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Layers, Edit3, Trash2,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Building, List
} from 'lucide-react';

export default function HostelFloor({ initialView = 'list' }) {
  const [viewMode, setViewMode] = useState(initialView);
  const [floors, setFloors] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    hostel: '',
    name: '',
    floorNumber: 1,
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [floorRes, hRes] = await Promise.all([
        API.get('/hostel/floors'),
        API.get('/hostel')
      ]);
      setFloors(Array.isArray(floorRes.data) ? floorRes.data : []);
      setHostels(Array.isArray(hRes.data) ? hRes.data : []);
    } catch (err) {
      console.error('Error fetching floors:', err);
      showToast('Failed to load hostel floors');
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

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.hostel) {
      showToast('Please select a Hostel');
      return;
    }
    if (!formData.name.trim()) {
      showToast('Please enter Floor Name/Number');
      return;
    }

    try {
      setSaving(true);
      await API.post('/hostel/floors', formData);
      showToast('Floor created successfully!');
      await fetchAllData();
      setViewMode('list');
      setFormData({ hostel: '', name: '', floorNumber: 1, description: '' });
    } catch (err) {
      showToast('Error saving floor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Floor?')) return;
    try {
      await API.delete(`/hostel/floors/${id}`);
      showToast('Floor deleted');
      setFloors(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      showToast('Failed to delete floor');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-fade-in text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Hostel</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-200 font-semibold">Hostel Floor</span>
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Hostel Floor' : 'Add Hostel Floor'}
          </h1>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
            className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-2"
          >
            {viewMode === 'list' ? <Plus className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            <span>{viewMode === 'list' ? 'Add Hostel Floor' : 'List all Hostel Floor'}</span>
          </button>
        </div>

        {viewMode === 'add' ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Hostel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Floor Name (e.g. Ground Floor, 1st Floor) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Floor Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => setFormData({ ...formData, floorNumber: Number(e.target.value) })}
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
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">FLOOR NAME</th>
                  <th className="py-3.5 px-4 font-semibold">HOSTEL</th>
                  <th className="py-3.5 px-4 font-semibold">FLOOR NUMBER</th>
                  <th className="py-3.5 px-4 font-semibold">DESCRIPTION</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">Loading floors...</td>
                  </tr>
                ) : floors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">No floors found. Click "Add Hostel Floor" above.</td>
                  </tr>
                ) : (
                  floors.map(f => (
                    <tr key={f._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{f.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{f.hostelName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{f.floorNumber}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{f.description || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

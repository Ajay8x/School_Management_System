import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Bed, Edit3, Trash2,
  Check, X, RotateCcw, ChevronRight, RefreshCw, AlertCircle, Building, List
} from 'lucide-react';

export default function HostelRoom({ initialView = 'list' }) {
  const [viewMode, setViewMode] = useState(initialView);
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    hostel: '',
    floor: '',
    roomNumber: '',
    type: 'Non-AC',
    capacity: 2,
    costPerBed: 0,
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [roomRes, hRes, fRes] = await Promise.all([
        API.get('/hostel/rooms'),
        API.get('/hostel'),
        API.get('/hostel/floors')
      ]);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : []);
      setHostels(Array.isArray(hRes.data) ? hRes.data : []);
      setFloors(Array.isArray(fRes.data) ? fRes.data : []);
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

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.hostel) {
      showToast('Please select a Hostel');
      return;
    }
    if (!formData.roomNumber.trim()) {
      showToast('Please enter Room Number/Name');
      return;
    }

    try {
      setSaving(true);
      await API.post('/hostel/rooms', {
        ...formData,
        capacity: Number(formData.capacity) || 2,
        costPerBed: Number(formData.costPerBed) || 0
      });
      showToast('Room created successfully!');
      await fetchAllData();
      setViewMode('list');
      setFormData({
        hostel: '',
        floor: '',
        roomNumber: '',
        type: 'Non-AC',
        capacity: 2,
        costPerBed: 0,
        description: ''
      });
    } catch (err) {
      showToast('Error saving room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Room?')) return;
    try {
      await API.delete(`/hostel/rooms/${id}`);
      showToast('Room deleted');
      setRooms(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      showToast('Failed to delete room');
    }
  };

  const filteredFloors = floors.filter(f => !formData.hostel || String(f.hostel) === String(formData.hostel));

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
          <span className="text-slate-700 dark:text-slate-200 font-semibold">Hostel Room</span>
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Hostel Room' : 'Add Hostel Room'}
          </h1>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
            className="px-5 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-md text-xs font-semibold shadow transition flex items-center gap-2"
          >
            {viewMode === 'list' ? <Plus className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            <span>{viewMode === 'list' ? 'Add Hostel Room' : 'List all Hostel Room'}</span>
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
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value, floor: '' })}
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
                    Room Number / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101, Room A"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  />
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
                    <option value="Non-AC">Non-AC</option>
                    <option value="AC">AC</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Dormitory">Dormitory</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cost Per Bed (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.costPerBed}
                    onChange={(e) => setFormData({ ...formData, costPerBed: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>
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
                  <th className="py-3.5 px-4 font-semibold">ROOM NUMBER</th>
                  <th className="py-3.5 px-4 font-semibold">HOSTEL</th>
                  <th className="py-3.5 px-4 font-semibold">FLOOR</th>
                  <th className="py-3.5 px-4 font-semibold">TYPE</th>
                  <th className="py-3.5 px-4 font-semibold">OCCUPANCY / CAPACITY</th>
                  <th className="py-3.5 px-4 font-semibold">COST (₹)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">Loading rooms...</td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No rooms found. Click "Add Hostel Room" above.</td>
                  </tr>
                ) : (
                  rooms.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Bed className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{r.roomNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{r.hostelName || r.hostel?.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.floorName || '—'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.type}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.currentOccupancy || 0} / {r.capacity} beds</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">₹{r.costPerBed || 0}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(r._id)}
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

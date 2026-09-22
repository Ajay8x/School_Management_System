import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Truck, Edit3, Trash2, Eye,
  Check, X, RotateCcw, Calendar, Fuel, User, Phone, Mail, MapPin,
  ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';

export default function Vehicle({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View state: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [viewingVehicle, setViewingVehicle] = useState(null);

  // Form state
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    registrationPlace: '',
    registrationDate: '',
    type: 'Bus',
    engineNumber: '',
    chassisNumber: '',
    cubicCapacity: '',
    color: '',
    modelNumber: '',
    make: '',
    vehicleClass: '',
    seatingCapacity: 40,
    maxSeatingAllowed: 45,
    fuelType: 'Diesel',
    fuelCapacity: '',
    // Owner Info
    ownership: 'School Owned',
    ownershipDate: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    status: 'Active'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await API.get('/transport/vehicles');
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      showToast('Failed to load transport vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useSchoolRefresh(() => {
    fetchVehicles();
  });

  const resetForm = () => {
    setFormData({
      name: '',
      registrationNumber: '',
      registrationPlace: '',
      registrationDate: '',
      type: 'Bus',
      engineNumber: '',
      chassisNumber: '',
      cubicCapacity: '',
      color: '',
      modelNumber: '',
      make: '',
      vehicleClass: '',
      seatingCapacity: 40,
      maxSeatingAllowed: 45,
      fuelType: 'Diesel',
      fuelCapacity: '',
      ownership: 'School Owned',
      ownershipDate: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      ownerAddress: '',
      status: 'Active'
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Vehicle Name');
      return;
    }
    if (!formData.registrationNumber.trim()) {
      showToast('Please enter Registration Number');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        seatingCapacity: Number(formData.seatingCapacity) || 40,
        maxSeatingAllowed: Number(formData.maxSeatingAllowed) || 45,
        registrationDate: formData.registrationDate ? new Date(formData.registrationDate) : null,
        ownershipDate: formData.ownershipDate ? new Date(formData.ownershipDate) : null
      };

      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/transport/vehicles/${currentEditId}`, payload);
        showToast('Vehicle updated successfully!');
      } else {
        await API.post('/transport/vehicles', payload);
        showToast('Vehicle created successfully!');
      }

      await fetchVehicles();

      if (keepAdding) {
        resetForm();
      } else {
        setViewMode('list');
        setCurrentEditId(null);
        resetForm();
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      showToast(err.response?.data?.message || 'Error saving vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    setCurrentEditId(v._id);
    setFormData({
      name: v.name || '',
      registrationNumber: v.registrationNumber || '',
      registrationPlace: v.registrationPlace || '',
      registrationDate: v.registrationDate ? new Date(v.registrationDate).toISOString().split('T')[0] : '',
      type: v.type || 'Bus',
      engineNumber: v.engineNumber || '',
      chassisNumber: v.chassisNumber || '',
      cubicCapacity: v.cubicCapacity || '',
      color: v.color || '',
      modelNumber: v.modelNumber || '',
      make: v.make || '',
      vehicleClass: v.vehicleClass || '',
      seatingCapacity: v.seatingCapacity || 40,
      maxSeatingAllowed: v.maxSeatingAllowed || 45,
      fuelType: v.fuelType || 'Diesel',
      fuelCapacity: v.fuelCapacity || '',
      ownership: v.ownership || 'School Owned',
      ownershipDate: v.ownershipDate ? new Date(v.ownershipDate).toISOString().split('T')[0] : '',
      ownerName: v.ownerName || '',
      ownerPhone: v.ownerPhone || '',
      ownerEmail: v.ownerEmail || '',
      ownerAddress: v.ownerAddress || '',
      status: v.status || 'Active'
    });
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Vehicle?')) return;
    try {
      await API.delete(`/transport/vehicles/${id}`);
      showToast('Vehicle deleted successfully');
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      showToast('Failed to delete vehicle');
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = filteredVehicles.slice(
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
          <span>Transport</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Vehicle</span>
          {viewMode !== 'list' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-200 font-semibold">
                {viewMode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
              </span>
            </>
          )}
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list'
              ? 'Transport Vehicle'
              : viewMode === 'add'
              ? 'Add Vehicle'
              : 'Edit Vehicle'}
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
              <span>Add Vehicle</span>
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
              <span>List all Vehicle</span>
            </button>
          )}
        </div>

        {/* FORM VIEW (Exact match with Screenshot 5) */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Top 3-Column Vehicle Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {/* Row 1 */}
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
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Registration Number"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Registration Place
                  </label>
                  <input
                    type="text"
                    placeholder="Registration Place"
                    value={formData.registrationPlace}
                    onChange={(e) => setFormData({ ...formData, registrationPlace: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                {/* Row 2 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Registration Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  >
                    <option value="Bus">Bus</option>
                    <option value="Mini Bus">Mini Bus</option>
                    <option value="Van">Van</option>
                    <option value="Auto">Auto</option>
                    <option value="Car">Car</option>
                    <option value="Cruiser">Cruiser</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    placeholder="Engine Number"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    placeholder="Chassis Number"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cubic Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="Cubic Capacity"
                    value={formData.cubicCapacity}
                    onChange={(e) => setFormData({ ...formData, cubicCapacity: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                {/* Row 4 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="Model Number"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    placeholder="Make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    placeholder="Class"
                    value={formData.vehicleClass}
                    onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                {/* Row 5 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Seating Capacity"
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Max Seating Allowed
                  </label>
                  <input
                    type="number"
                    placeholder="Max Seating Allowed"
                    value={formData.maxSeatingAllowed}
                    onChange={(e) => setFormData({ ...formData, maxSeatingAllowed: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Row 6 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fuel Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="Fuel Capacity"
                    value={formData.fuelCapacity}
                    onChange={(e) => setFormData({ ...formData, fuelCapacity: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                  />
                </div>
              </div>

              {/* Owner Info Fieldset (Exact match with Screenshot 5) */}
              <fieldset className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 pt-3 mt-6">
                <legend className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
                  Owner Info
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-2">
                  {/* Ownership */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Ownership
                    </label>
                    <select
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    >
                      <option value="School Owned">School Owned</option>
                      <option value="Rented">Rented</option>
                      <option value="Leased">Leased</option>
                      <option value="Contract">Contract</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  {/* Ownership Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Ownership Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.ownershipDate}
                        onChange={(e) => setFormData({ ...formData, ownershipDate: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                      />
                    </div>
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="Owner Name"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>

                  {/* Owner Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Owner Phone
                    </label>
                    <input
                      type="text"
                      placeholder="Owner Phone"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      placeholder="Owner Email"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>

                  {/* Owner Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Owner Address
                    </label>
                    <textarea
                      rows={1}
                      placeholder="Owner Address"
                      value={formData.ownerAddress}
                      onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 focus:border-indigo-600 focus:outline-none dark:text-white rounded-t transition"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Bottom Actions Bar (Exact Screenshot 5 styling) */}
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
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Types</option>
                  <option value="Bus">Bus</option>
                  <option value="Mini Bus">Mini Bus</option>
                  <option value="Van">Van</option>
                  <option value="Auto">Auto</option>
                  <option value="Car">Car</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">NAME & REG NO ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">TYPE</th>
                    <th className="py-3.5 px-4 font-semibold">SEATING</th>
                    <th className="py-3.5 px-4 font-semibold">FUEL</th>
                    <th className="py-3.5 px-4 font-semibold">OWNERSHIP</th>
                    <th className="py-3.5 px-4 font-semibold">STATUS</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading vehicles...
                      </td>
                    </tr>
                  ) : paginatedVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No vehicles found. Click "Add Vehicle" above to register a new vehicle.
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((v) => (
                      <tr
                        key={v._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{v.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                            {v.registrationNumber}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {v.type}
                        </td>

                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {v.seatingCapacity} / {v.maxSeatingAllowed} seats
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {v.fuelType} {v.fuelCapacity && `(${v.fuelCapacity})`}
                        </td>

                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <div>{v.ownership}</div>
                          {v.ownerName && (
                            <div className="text-[11px] text-slate-500">{v.ownerName}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : v.status === 'Under Maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                          >
                            {v.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingVehicle(v)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-indigo-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(v)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v._id)}
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
                Showing {filteredVehicles.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} results
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

        {/* MODAL: VIEW VEHICLE DETAILS */}
        {viewingVehicle && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  {viewingVehicle.name} ({viewingVehicle.registrationNumber})
                </h3>
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Vehicle Specs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-md">
                  <div>
                    <span className="text-slate-400 block">Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registration Place:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.registrationPlace || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Seating Capacity:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.seatingCapacity} / {viewingVehicle.maxSeatingAllowed} seats</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fuel Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.fuelType} ({viewingVehicle.fuelCapacity || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Engine Number:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.engineNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Chassis Number:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.chassisNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Make & Model:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.make || ''} {viewingVehicle.modelNumber || ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Color:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingVehicle.color || '—'}</span>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="border border-slate-200 dark:border-slate-700 p-3.5 rounded-md">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-[11px]">
                    Owner Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Ownership:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{viewingVehicle.ownership}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Owner Name:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{viewingVehicle.ownerName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{viewingVehicle.ownerPhone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{viewingVehicle.ownerEmail || '—'}</span>
                    </div>
                  </div>
                  {viewingVehicle.ownerAddress && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block">Address:</span>
                      <p className="text-slate-700 dark:text-slate-300">{viewingVehicle.ownerAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 mt-8">
        Campus Tracker
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { SchoolContext } from '../../context/SchoolContext';
import { useSchoolRefresh } from '../../hooks/useSchoolRefresh';
import {
  Home, Plus, Search, Filter, Settings as SettingsIcon, Columns,
  MoreVertical, List, Truck, Edit3, Trash2, Eye,
  Check, X, RotateCcw, Calendar, Clock, MapPin,
  ChevronRight, RefreshCw, Printer, Download, Users, AlertCircle, ChevronDown
} from 'lucide-react';

export default function TransportRoute({ initialView = 'list' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentSchool } = useContext(SchoolContext) || {};

  // View Mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState(initialView);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Data states
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stoppages, setStoppages] = useState([]);
  const [circles, setCircles] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Popover toggles
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewingRoute, setViewingRoute] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [keepAdding, setKeepAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    routeType: 'Round Trip',
    vehicle: '',
    vehicleName: '',
    vehicleNumber: '',
    startTime: '5:30 AM',
    endTime: '1:15 PM',
    maxCapacity: 45,
    incharge: '',
    inchargePhone: '',
    stoppages: [],
    circle: '',
    circleName: '',
    feePlan: '',
    description: '',
    status: 'Active'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [routeRes, vehicleRes, stopRes, circleRes, feeRes] = await Promise.all([
        API.get('/transport/routes'),
        API.get('/transport/vehicles'),
        API.get('/transport/stoppages'),
        API.get('/transport/circles'),
        API.get('/transport/fees')
      ]);
      setRoutes(Array.isArray(routeRes.data) ? routeRes.data : []);
      setVehicles(Array.isArray(vehicleRes.data) ? vehicleRes.data : []);
      setStoppages(Array.isArray(stopRes.data) ? stopRes.data : []);
      setCircles(Array.isArray(circleRes.data) ? circleRes.data : []);
      setFeePlans(Array.isArray(feeRes.data) ? feeRes.data : []);
    } catch (err) {
      console.error('Error fetching transport route data:', err);
      showToast('Failed to load transport routes');
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

  // Handle vehicle selection in form
  const handleVehicleChange = (vId) => {
    const selected = vehicles.find(v => v._id === vId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        vehicle: selected._id,
        vehicleName: selected.name,
        vehicleNumber: selected.registrationNumber,
        maxCapacity: selected.seatingCapacity || selected.maxSeatingAllowed || 45
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        vehicle: '',
        vehicleName: '',
        vehicleNumber: ''
      }));
    }
  };

  // Handle circle selection
  const handleCircleChange = (cId) => {
    const selected = circles.find(c => c._id === cId);
    setFormData(prev => ({
      ...prev,
      circle: cId,
      circleName: selected ? selected.name : ''
    }));
  };

  // Add / remove stoppage inside route
  const toggleStoppageSelection = (stoppage) => {
    const exists = formData.stoppages.find(s => s.stoppageId === stoppage._id);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        stoppages: prev.stoppages.filter(s => s.stoppageId !== stoppage._id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        stoppages: [
          ...prev.stoppages,
          {
            stoppageId: stoppage._id,
            stoppageName: stoppage.name,
            pickupTime: formData.startTime || '6:00 AM',
            dropTime: formData.endTime || '2:00 PM',
            order: prev.stoppages.length + 1
          }
        ]
      }));
    }
  };

  const handleSaveRoute = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Route Name');
      return;
    }

    try {
      setSaving(true);
      if (viewMode === 'edit' && currentEditId) {
        await API.put(`/transport/routes/${currentEditId}`, formData);
        showToast('Transport Route updated successfully!');
      } else {
        await API.post('/transport/routes', formData);
        showToast('Transport Route created successfully!');
      }

      await fetchAllData();

      if (keepAdding) {
        setFormData({
          name: '',
          routeType: 'Round Trip',
          vehicle: '',
          vehicleName: '',
          vehicleNumber: '',
          startTime: '5:30 AM',
          endTime: '1:15 PM',
          maxCapacity: 45,
          incharge: '',
          inchargePhone: '',
          stoppages: [],
          circle: '',
          circleName: '',
          feePlan: '',
          description: '',
          status: 'Active'
        });
      } else {
        setViewMode('list');
        setCurrentEditId(null);
      }
    } catch (err) {
      console.error('Error saving route:', err);
      showToast(err.response?.data?.message || 'Error saving transport route');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (route) => {
    setCurrentEditId(route._id);
    setFormData({
      name: route.name || '',
      routeType: route.routeType || 'Round Trip',
      vehicle: route.vehicle?._id || route.vehicle || '',
      vehicleName: route.vehicleName || '',
      vehicleNumber: route.vehicleNumber || '',
      startTime: route.startTime || '5:30 AM',
      endTime: route.endTime || '1:15 PM',
      maxCapacity: route.maxCapacity || 45,
      incharge: route.incharge || '',
      inchargePhone: route.inchargePhone || '',
      stoppages: route.stoppages || [],
      circle: route.circle?._id || route.circle || '',
      circleName: route.circleName || '',
      feePlan: route.feePlan?._id || route.feePlan || '',
      description: route.description || '',
      status: route.status || 'Active'
    });
    setViewMode('edit');
    setActiveMenuId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Transport Route?')) return;
    try {
      await API.delete(`/transport/routes/${id}`);
      showToast('Transport Route deleted successfully');
      setRoutes(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting route:', err);
      showToast('Failed to delete transport route');
    }
  };

  // Filter & Pagination
  const filteredRoutes = routes.filter(r => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.incharge?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage) || 1;
  const paginatedRoutes = filteredRoutes.slice(
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
          <span className="text-slate-700 dark:text-slate-200 font-semibold">
            {viewMode === 'list' ? 'Transport Route' : viewMode === 'add' ? 'Add Transport Route' : 'Edit Transport Route'}
          </span>
        </div>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'list' ? 'Transport Route' : viewMode === 'add' ? 'Add Transport Route' : 'Edit Transport Route'}
          </h1>

          {viewMode === 'list' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/transport/stoppage"
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition"
              >
                Transport Stoppage
              </Link>
              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    routeType: 'Round Trip',
                    vehicle: '',
                    vehicleName: '',
                    vehicleNumber: '',
                    startTime: '5:30 AM',
                    endTime: '1:15 PM',
                    maxCapacity: 45,
                    incharge: '',
                    inchargePhone: '',
                    stoppages: [],
                    circle: '',
                    circleName: '',
                    feePlan: '',
                    description: '',
                    status: 'Active'
                  });
                  setViewMode('add');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>Add Transport Route</span>
              </button>

              {/* Action tool icons */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                  title="Filter"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 z-30 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                    {['All', 'Active', 'Inactive', 'Suspended'].map(st => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs rounded ${statusFilter === st ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSettingsModal(!showSettingsModal)}
                className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => fetchAllData()}
                className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                title="Columns"
              >
                <Columns className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 shadow-xs"
                  title="More"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        window.print();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print List
                    </button>
                    <button
                      onClick={() => {
                        fetchAllData();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
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
              <span>List all Transport Route</span>
            </button>
          )}
        </div>

        {/* VIEW 1: LIST TABLE (Matches Screenshot 1) */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div className="text-xs text-slate-500">
                Total Routes: <span className="font-semibold text-slate-800 dark:text-white">{filteredRoutes.length}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">NAME ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">VEHICLE</th>
                    <th className="py-3.5 px-4 font-semibold">TIME</th>
                    <th className="py-3.5 px-4 font-semibold">MAX CAPACITY ⇅</th>
                    <th className="py-3.5 px-4 font-semibold">TRANSPORT STOPPAGE</th>
                    <th className="py-3.5 px-4 font-semibold">INCHARGE</th>
                    <th className="py-3.5 px-4 font-semibold">CREATED AT ⇅</th>
                    <th className="py-3.5 px-4 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading transport routes...
                      </td>
                    </tr>
                  ) : paginatedRoutes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        No transport routes found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRoutes.map((route) => (
                      <tr
                        key={route._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition"
                      >
                        {/* Name & Route Type */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {route.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {route.routeType || 'Round Trip'}
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {route.vehicleName || route.vehicle?.name || '—'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                            {route.vehicleNumber || route.vehicle?.registrationNumber || ''}
                          </div>
                        </td>

                        {/* Time */}
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <div>{route.startTime || '5:30 AM'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {route.endTime || '1:15 PM'}
                          </div>
                        </td>

                        {/* Max Capacity */}
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {route.currentOccupancy || 0}/{route.maxCapacity || 45}
                        </td>

                        {/* Stoppage count */}
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {route.stoppages?.length || 1}
                        </td>

                        {/* Incharge */}
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <div>{route.incharge || '—'}</div>
                          {route.inchargePhone && (
                            <div className="text-[11px] text-slate-500">{route.inchargePhone}</div>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(route.createdAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        {/* Action Menu */}
                        <td className="py-3 px-4 text-right relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === route._id ? null : route._id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === route._id && (
                            <div className="absolute right-4 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 text-left text-xs">
                              <button
                                onClick={() => handleEdit(route)}
                                className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-500" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setViewingRoute(route);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-500" /> View
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDelete(route._id);
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
                Showing {filteredRoutes.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRoutes.length)} of {filteredRoutes.length} results
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
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
                    <option value={100}>100 per page</option>
                  </select>
                </div>

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

        {/* VIEW 2: ADD / EDIT ROUTE FORM */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSaveRoute} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Route Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Route Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mini Bus, Route 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                    required
                  />
                </div>

                {/* Route Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Route Type
                  </label>
                  <select
                    value={formData.routeType}
                    onChange={(e) => setFormData({ ...formData, routeType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  >
                    <option value="Round Trip">Round Trip</option>
                    <option value="One Way">One Way</option>
                    <option value="Morning Pickup">Morning Pickup</option>
                    <option value="Evening Drop">Evening Drop</option>
                  </select>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Assign Vehicle
                  </label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.registrationNumber}) - {v.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Pickup Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="5:30 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Drop End Time
                  </label>
                  <input
                    type="text"
                    placeholder="1:15 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Max Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                {/* Incharge Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Route Incharge / Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.incharge}
                    onChange={(e) => setFormData({ ...formData, incharge: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                {/* Incharge Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Incharge Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.inchargePhone}
                    onChange={(e) => setFormData({ ...formData, inchargePhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                {/* Circle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Transport Circle
                  </label>
                  <select
                    value={formData.circle}
                    onChange={(e) => handleCircleChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                  >
                    <option value="">-- Select Transport Circle --</option>
                    {circles.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stoppages Checklist */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Assign Stoppages ({formData.stoppages.length} selected)
                  </h3>
                  <Link
                    to="/transport/stoppage"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Manage Stoppages
                  </Link>
                </div>

                {stoppages.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No stoppages created yet. Please create stoppages first.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {stoppages.map(stop => {
                      const isChecked = formData.stoppages.some(s => s.stoppageId === stop._id);
                      return (
                        <label
                          key={stop._id}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition text-xs ${isChecked ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 text-indigo-900 dark:text-indigo-200 font-semibold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStoppageSelection(stop)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{stop.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description / Route Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter route details or special instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>

              {/* Form Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: '',
                        routeType: 'Round Trip',
                        vehicle: '',
                        vehicleName: '',
                        vehicleNumber: '',
                        startTime: '5:30 AM',
                        endTime: '1:15 PM',
                        maxCapacity: 45,
                        incharge: '',
                        inchargePhone: '',
                        stoppages: [],
                        circle: '',
                        circleName: '',
                        feePlan: '',
                        description: '',
                        status: 'Active'
                      });
                    }}
                    className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs font-medium transition"
                  >
                    Reset
                  </button>

                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
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

        {/* VIEW MODAL: VIEW ROUTE DETAILS */}
        {viewingRoute && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  {viewingRoute.name} ({viewingRoute.routeType})
                </h3>
                <button
                  onClick={() => setViewingRoute(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md">
                  <div>
                    <span className="text-slate-400 block">Vehicle:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingRoute.vehicleName || '—'}</span>
                    <span className="text-slate-500 block">{viewingRoute.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Capacity:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingRoute.currentOccupancy || 0} / {viewingRoute.maxCapacity || 45}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Timing:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{viewingRoute.startTime} – {viewingRoute.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Incharge:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{viewingRoute.incharge || '—'} {viewingRoute.inchargePhone && `(${viewingRoute.inchargePhone})`}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Stoppages ({viewingRoute.stoppages?.length || 0}):</span>
                  {viewingRoute.stoppages?.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-md">
                      {viewingRoute.stoppages.map((st, i) => (
                        <li key={i} className="px-3 py-1.5 flex items-center justify-between">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{i + 1}. {st.stoppageName}</span>
                          <span className="text-slate-400">{st.pickupTime || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic">No stoppages specified</p>
                  )}
                </div>

                {viewingRoute.description && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Description:</span>
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded">{viewingRoute.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingRoute(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

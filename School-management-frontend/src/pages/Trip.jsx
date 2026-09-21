import { useState, useEffect, useRef, useContext } from 'react';
import API from '../api/axios';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, Edit, Search, RefreshCw, Printer, FileSpreadsheet,
  Filter, MoreVertical, Settings, ChevronRight, Home, CheckCircle2, AlertCircle,
  Eye, Copy, ChevronDown, Clock, X, MapPin, Users, Calendar, DollarSign,
  Compass, Award, UserCheck, ShieldAlert, ArrowUpDown, Check, FileText
} from 'lucide-react';

export default function Trip({ initialView = 'list' }) {
  const { user: currentUser } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTripType, setFilterTripType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Column Visibility Settings
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    tripType: true,
    title: true,
    startDate: true,
    endDate: true,
    fee: true,
    audience: true,
    createdAt: true,
    actions: true
  });

  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Dropdown menus
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // View modes: 'list' | 'add' | 'edit' | 'duplicate'
  const [viewMode, setViewMode] = useState(initialView);
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [selectedTripParticipants, setSelectedTripParticipants] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  // Participant Form in Modal
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const initialParticipantForm = {
    role: 'student',
    studentId: '',
    teacherId: '',
    name: '',
    rollNo: '',
    className: '',
    batchName: '',
    departmentName: '',
    contactNumber: '',
    emergencyContact: '',
    paymentStatus: 'Paid',
    feeAmount: '',
    paymentMethod: 'Cash',
    consentReceived: true,
    remarks: ''
  };
  const [participantFormData, setParticipantFormData] = useState(initialParticipantForm);
  const [participantSubmitting, setParticipantSubmitting] = useState(false);

  // Initial Trip Form
  const initialForm = {
    tripType: 'Educational Trip',
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    fee: 0,
    audience: ['Batch Wise Student', 'Department Wise Employee'],
    batches: [],
    departments: [],
    incharge: '',
    inchargeContact: '',
    maxParticipants: '',
    description: '',
    itinerary: '',
    guidelines: '',
    status: 'Upcoming'
  };

  const [formData, setFormData] = useState(initialForm);

  // Format Helpers
  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '-', time: '' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      
      const datePart = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return { date: datePart, time: timePart };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  const formatCreatedAt = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Convert Date to ISO-like local datetime for input type="datetime-local"
  const toInputDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, teachersRes, batchesRes, deptsRes, studentsRes] = await Promise.allSettled([
        API.get('/trips'),
        API.get('/teachers'),
        API.get('/batches'),
        API.get('/departments'),
        API.get('/students')
      ]);

      if (tripsRes.status === 'fulfilled' && Array.isArray(tripsRes.value.data)) {
        setTrips(tripsRes.value.data);
      }
      if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value.data)) {
        setTeachersList(teachersRes.value.data);
      }
      if (batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value.data)) {
        setBatchesList(batchesRes.value.data);
      }
      if (deptsRes.status === 'fulfilled' && Array.isArray(deptsRes.value.data)) {
        setDepartmentsList(deptsRes.value.data);
      }
      if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value.data)) {
        setStudentsList(studentsRes.value.data);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching trip data:', err);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (!event.target.closest('.row-menu-container')) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers for Add / Edit / Duplicate
  const handleOpenAdd = () => {
    setEditingTrip(null);
    setFormData({
      ...initialForm,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setViewMode('add');
  };

  const handleOpenEdit = (item) => {
    setOpenRowMenuId(null);
    setEditingTrip(item);
    setFormData({
      tripType: item.tripType || 'Educational Trip',
      title: item.title || '',
      destination: item.destination || '',
      startDate: toInputDateTime(item.startDate),
      endDate: toInputDateTime(item.endDate),
      fee: item.fee !== undefined ? item.fee : 0,
      audience: Array.isArray(item.audience) ? item.audience : ['Batch Wise Student'],
      batches: item.batches || [],
      departments: item.departments || [],
      incharge: item.incharge || '',
      inchargeContact: item.inchargeContact || '',
      maxParticipants: item.maxParticipants || '',
      description: item.description || '',
      itinerary: item.itinerary || '',
      guidelines: item.guidelines || '',
      status: item.status || 'Upcoming'
    });
    setViewMode('edit');
  };

  const handleOpenDuplicate = (item) => {
    setOpenRowMenuId(null);
    setEditingTrip(null);
    setFormData({
      tripType: item.tripType || 'Educational Trip',
      title: item.title ? `${item.title} (Copy)` : '',
      destination: item.destination || '',
      startDate: toInputDateTime(item.startDate),
      endDate: toInputDateTime(item.endDate),
      fee: item.fee !== undefined ? item.fee : 0,
      audience: Array.isArray(item.audience) ? item.audience : ['Batch Wise Student'],
      batches: item.batches || [],
      departments: item.departments || [],
      incharge: item.incharge || '',
      inchargeContact: item.inchargeContact || '',
      maxParticipants: item.maxParticipants || '',
      description: item.description || '',
      itinerary: item.itinerary || '',
      guidelines: item.guidelines || '',
      status: 'Upcoming'
    });
    setViewMode('duplicate');
  };

  const handleToggleAudience = (aud) => {
    setFormData(prev => {
      const exists = prev.audience.includes(aud);
      const updated = exists ? prev.audience.filter(a => a !== aud) : [...prev.audience, aud];
      return { ...prev, audience: updated };
    });
  };

  const handleSubmitTripForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Trip title is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start date and End date are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...formData,
        fee: Number(formData.fee) || 0,
        maxParticipants: Number(formData.maxParticipants) || 0
      };

      if (viewMode === 'edit' && editingTrip) {
        const res = await API.put(`/trips/${editingTrip._id}`, payload);
        setTrips(prev => prev.map(t => (t._id === editingTrip._id ? res.data : t)));
        setSuccessMsg('Trip updated successfully!');
      } else {
        const res = await API.post('/trips', payload);
        setTrips(prev => [res.data, ...prev]);
        setSuccessMsg('Trip created successfully!');
      }

      if (keepAdding) {
        setFormData({
          ...initialForm,
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
        setEditingTrip(null);
        setViewMode('add');
      } else {
        setViewMode('list');
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError(err.response?.data?.message || 'Failed to save trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = (trip) => {
    setOpenRowMenuId(null);
    setConfirmModal({
      title: 'Delete Trip',
      message: `Are you sure you want to delete "${trip.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await API.delete(`/trips/${trip._id}`);
          setTrips(prev => prev.filter(t => t._id !== trip._id));
          setSuccessMsg('Trip deleted successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          console.error('Delete error:', err);
          setError('Failed to delete trip');
        }
      }
    });
  };

  // Manage Participants Modal Handlers
  const handleOpenParticipants = (trip) => {
    setOpenRowMenuId(null);
    setSelectedTripParticipants(trip);
    setShowAddParticipantForm(false);
    setParticipantFormData({
      ...initialParticipantForm,
      feeAmount: trip.fee || 0
    });
  };

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const student = studentsList.find(s => s._id === sId);
    if (student) {
      setParticipantFormData(prev => ({
        ...prev,
        studentId: student._id,
        name: student.name || '',
        rollNo: student.rollNumber || student.rollNo || '',
        className: student.className || '',
        batchName: student.batchName || student.section || '',
        contactNumber: student.contact || student.phone || '',
        emergencyContact: student.emergencyContact || student.parentContact || ''
      }));
    } else {
      setParticipantFormData(prev => ({
        ...prev,
        studentId: '',
        name: '',
        rollNo: '',
        className: '',
        batchName: '',
        contactNumber: '',
        emergencyContact: ''
      }));
    }
  };

  const handleAddParticipantSubmit = async (e) => {
    e.preventDefault();
    if (!participantFormData.name.trim()) {
      setError('Participant name is required');
      return;
    }

    try {
      setParticipantSubmitting(true);
      const res = await API.post(`/trips/${selectedTripParticipants._id}/participants`, participantFormData);
      setSelectedTripParticipants(res.data);
      setTrips(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
      setShowAddParticipantForm(false);
      setParticipantFormData({
        ...initialParticipantForm,
        feeAmount: selectedTripParticipants.fee || 0
      });
      setSuccessMsg('Participant registered successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Participant add error:', err);
      setError(err.response?.data?.message || 'Failed to register participant');
    } finally {
      setParticipantSubmitting(false);
    }
  };

  const handleTogglePaymentStatus = async (p) => {
    try {
      const nextStatus = p.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      const res = await API.put(`/trips/${selectedTripParticipants._id}/participants/${p._id}`, {
        paymentStatus: nextStatus
      });
      setSelectedTripParticipants(res.data);
      setTrips(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleRemoveParticipant = async (pId) => {
    if (!window.confirm('Remove this participant from the trip?')) return;
    try {
      const res = await API.delete(`/trips/${selectedTripParticipants._id}/participants/${pId}`);
      setSelectedTripParticipants(res.data);
      setTrips(prev => prev.map(t => (t._id === res.data._id ? res.data : t)));
      setSuccessMsg('Participant removed');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  // Export to Excel
  const handleExportExcelAction = () => {
    setIsHeaderMenuOpen(false);
    if (trips.length === 0) {
      setError('No trips to export');
      return;
    }

    try {
      const exportData = filteredTrips.map((item, index) => {
        const start = formatDateTime(item.startDate);
        const end = formatDateTime(item.endDate);
        return {
          '#': index + 1,
          'Trip Type': item.tripType || '',
          'Title': item.title || '',
          'Destination / Location': item.destination || '',
          'Start Date': `${start.date} ${start.time}`,
          'End Date': `${end.date} ${end.time}`,
          'Fee (₹)': item.fee || 0,
          'Audience': Array.isArray(item.audience) ? item.audience.join(', ') : item.audience || '',
          'In-charge': item.incharge || '',
          'Status': item.status || 'Upcoming',
          'Registered Participants': item.participants?.length || 0,
          'Max Capacity': item.maxParticipants || 'Unlimited',
          'Created At': formatCreatedAt(item.createdAt)
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
      XLSX.writeFile(workbook, `School_Trips_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccessMsg('Exported trips to Excel successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export to Excel');
    }
  };

  // Filter & Search & Sort
  const filteredTrips = trips
    .filter(trip => {
      const matchesSearch = 
        !searchTerm.trim() ||
        (trip.title && trip.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.incharge && trip.incharge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trip.tripType && trip.tripType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTripType = filterTripType === 'All' || trip.tripType === filterTripType;
      const matchesStatus = filterStatus === 'All' || trip.status === filterStatus;
      
      const matchesAudience = 
        filterAudience === 'All' ||
        (Array.isArray(trip.audience) && trip.audience.includes(filterAudience)) ||
        trip.audience === filterAudience;

      let matchesDate = true;
      if (filterFromDate) {
        matchesDate = matchesDate && new Date(trip.startDate) >= new Date(filterFromDate);
      }
      if (filterToDate) {
        const to = new Date(filterToDate);
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(trip.startDate) <= to;
      }

      return matchesSearch && matchesTripType && matchesStatus && matchesAudience && matchesDate;
    })
    .sort((a, b) => {
      if (sortField === 'createdAt') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'startDate') {
        const timeA = new Date(a.startDate || 0).getTime();
        const timeB = new Date(b.startDate || 0).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'fee') {
        return sortOrder === 'asc' ? (a.fee || 0) - (b.fee || 0) : (b.fee || 0) - (a.fee || 0);
      }
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  // Pagination
  const totalResults = filteredTrips.length;
  const totalPages = Math.ceil(totalResults / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTrips = filteredTrips.slice(startIndex, startIndex + perPage);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterTripType('All');
    setFilterAudience('All');
    setFilterStatus('All');
    setFilterFromDate('');
    setFilterToDate('');
  };

  const tripTypeOptions = [
    'Educational Trip',
    'Excursion Trip',
    'Field Visit',
    'Historical Tour',
    'Industrial Visit',
    'Adventure Camp',
    'Sports Tour',
    'Science & Nature Exploration',
    'Cultural Exchange',
    'Other'
  ];

  const audienceOptions = [
    'Batch Wise Student',
    'Department Wise Employee',
    'All Students',
    'All Teachers & Staff',
    'Hostel Students',
    'Open to All'
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f6f9] dark:bg-slate-900 font-sans print:p-0 print:bg-white text-slate-800 dark:text-slate-100">
      
      {/* Printable Area Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-trip-area, #printable-trip-area * {
            visibility: visible;
          }
          #printable-trip-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl w-full mx-auto space-y-5">
        
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-400 dark:text-slate-400 mb-1">
              <a href="/admin/dashboard" className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition">
                <Home className="w-3.5 h-3.5 mr-1" /> Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <span className="hover:text-teal-600 dark:hover:text-teal-400 transition">Activity</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
              <button 
                onClick={() => setViewMode('list')} 
                className="hover:text-teal-600 dark:hover:text-teal-400 transition font-semibold text-gray-600 dark:text-slate-300"
              >
                Trip
              </button>
              {viewMode !== 'list' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {viewMode === 'add' ? 'Add Trip' : viewMode === 'edit' ? 'Edit Trip' : 'Duplicate Trip'}
                  </span>
                </>
              )}
            </nav>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === 'list' ? 'Trip' : viewMode === 'add' ? 'Add Trip' : viewMode === 'edit' ? 'Edit Trip' : 'Duplicate Trip'}
            </h1>
          </div>

          {/* Top Right Header Action Buttons matching Screenshot 2 */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {viewMode === 'list' ? (
              <>
                {/* Add Trip Button */}
                <button 
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  Add Trip
                </button>

                {/* Filter Toggle Button */}
                <button 
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  title="Filter"
                  className={`p-2.5 bg-white dark:bg-slate-800 border ${showFilterBar ? 'border-teal-500 text-teal-600 dark:border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'} rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Settings / Column Customizer Button */}
                <button 
                  onClick={() => setShowColumnModal(true)}
                  title="Column Settings"
                  className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* 3-Dots Header Menu */}
                <div className="relative" ref={headerMenuRef}>
                  <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    title="More options"
                    className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isHeaderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={async () => {
                          setIsHeaderMenuOpen(false);
                          await fetchData();
                          setSuccessMsg('Trips refreshed successfully!');
                          setTimeout(() => setSuccessMsg(''), 3000);
                        }}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-teal-600" />
                        Refresh List
                      </button>
                      <button 
                        onClick={() => {
                          setIsHeaderMenuOpen(false);
                          window.print();
                        }}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-blue-600" />
                        Print Page
                      </button>
                      <button 
                        onClick={handleExportExcelAction}
                        className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Export to Excel
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                Back to List
              </button>
            )}
          </div>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center justify-between text-rose-700 dark:text-rose-300 text-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Collapsible Filter Bar */}
        {showFilterBar && viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700/80 shadow-xs space-y-4 no-print animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700/60">
              <span className="text-sm font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                Filter & Search Trips
              </span>
              <button 
                onClick={resetFilters}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search Box */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Title, Destination, Incharge..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Trip Type Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Trip Type
                </label>
                <select
                  value={filterTripType}
                  onChange={(e) => { setFilterTripType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                >
                  <option value="All">All Types</option>
                  {tripTypeOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Audience Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Audience
                </label>
                <select
                  value={filterAudience}
                  onChange={(e) => { setFilterAudience(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                >
                  <option value="All">All Audiences</option>
                  {audienceOptions.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Date From
                </label>
                <input 
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => { setFilterFromDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: LIST (Main Table matching Screenshot 2) */}
        {viewMode === 'list' && (
          <div id="printable-trip-area" className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
            
            {/* Table wrapper */}
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-800/60 text-[11px] sm:text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                    {visibleColumns.tripType && (
                      <th className="px-5 py-3.5">TRIP TYPE</th>
                    )}
                    {visibleColumns.title && (
                      <th className="px-5 py-3.5">TITLE</th>
                    )}
                    {visibleColumns.startDate && (
                      <th className="px-5 py-3.5">START DATE</th>
                    )}
                    {visibleColumns.endDate && (
                      <th className="px-5 py-3.5">END DATE</th>
                    )}
                    {visibleColumns.fee && (
                      <th className="px-5 py-3.5">FEE</th>
                    )}
                    {visibleColumns.audience && (
                      <th className="px-5 py-3.5">AUDIENCE</th>
                    )}
                    {visibleColumns.createdAt && (
                      <th 
                        className="px-5 py-3.5 cursor-pointer select-none hover:text-gray-600 dark:hover:text-slate-200 transition"
                        onClick={() => {
                          if (sortField === 'createdAt') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField('createdAt');
                            setSortOrder('desc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>CREATED AT</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="px-5 py-3.5 text-right w-14 no-print"></th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                          <span>Loading trips...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTrips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Compass className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                          <p className="font-semibold text-gray-600 dark:text-slate-300">No trip records found</p>
                          <p className="text-xs text-gray-400">Click &quot;Add Trip&quot; to create the first educational or excursion trip.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTrips.map((trip) => {
                      const start = formatDateTime(trip.startDate);
                      const end = formatDateTime(trip.endDate);
                      const audiences = Array.isArray(trip.audience) ? trip.audience : (trip.audience ? [trip.audience] : []);
                      const isMenuOpen = openRowMenuId === trip._id;

                      return (
                        <tr 
                          key={trip._id} 
                          className="hover:bg-gray-50/70 dark:hover:bg-slate-750/50 transition duration-150"
                        >
                          {/* TRIP TYPE */}
                          {visibleColumns.tripType && (
                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-slate-200 whitespace-nowrap">
                              <span className="text-gray-900 dark:text-slate-100 font-medium">
                                {trip.tripType || 'Educational Trip'}
                              </span>
                            </td>
                          )}

                          {/* TITLE & LOCATION */}
                          {visibleColumns.title && (
                            <td className="px-5 py-4">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white leading-tight">
                                  {trip.title}
                                </div>
                                {trip.destination && (
                                  <div className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                                    {trip.destination}
                                  </div>
                                )}
                              </div>
                            </td>
                          )}

                          {/* START DATE */}
                          {visibleColumns.startDate && (
                            <td className="px-5 py-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-slate-100">{start.date}</div>
                              {start.time && (
                                <div className="text-xs text-gray-400 dark:text-slate-400">{start.time}</div>
                              )}
                            </td>
                          )}

                          {/* END DATE */}
                          {visibleColumns.endDate && (
                            <td className="px-5 py-4 text-gray-700 dark:text-slate-300 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-slate-100">{end.date}</div>
                              {end.time && (
                                <div className="text-xs text-gray-400 dark:text-slate-400">{end.time}</div>
                              )}
                            </td>
                          )}

                          {/* FEE */}
                          {visibleColumns.fee && (
                            <td className="px-5 py-4 font-medium text-gray-900 dark:text-slate-100 whitespace-nowrap">
                              {trip.fee !== undefined && trip.fee > 0 ? `₹${trip.fee}` : 'Free'}
                            </td>
                          )}

                          {/* AUDIENCE */}
                          {visibleColumns.audience && (
                            <td className="px-5 py-4 text-gray-700 dark:text-slate-300">
                              <div className="space-y-0.5">
                                {audiences.length > 0 ? (
                                  audiences.map((aud, idx) => (
                                    <div key={idx} className="text-xs text-gray-800 dark:text-slate-200 font-normal">
                                      {aud}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">All</span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* CREATED AT */}
                          {visibleColumns.createdAt && (
                            <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                              {formatCreatedAt(trip.createdAt)}
                            </td>
                          )}

                          {/* ACTIONS */}
                          {visibleColumns.actions && (
                            <td className="px-5 py-4 text-right relative row-menu-container no-print">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenRowMenuId(isMenuOpen ? null : trip._id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-5 top-10 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                                  <button 
                                    onClick={() => {
                                      setOpenRowMenuId(null);
                                      setSelectedTripDetails(trip);
                                    }}
                                    className="w-full px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 text-teal-600" />
                                    View Details
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleOpenParticipants(trip)}
                                    className="w-full px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                                  >
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Manage Registrations ({trip.participants?.length || 0})
                                  </button>

                                  <button 
                                    onClick={() => handleOpenEdit(trip)}
                                    className="w-full px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 text-indigo-600" />
                                    Edit Trip
                                  </button>

                                  <button 
                                    onClick={() => handleOpenDuplicate(trip)}
                                    className="w-full px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                                  >
                                    <Copy className="w-4 h-4 text-amber-600" />
                                    Duplicate Trip
                                  </button>

                                  <div className="my-1 border-t border-gray-100 dark:border-slate-700" />

                                  <button 
                                    onClick={() => handleDeleteTrip(trip)}
                                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer font-medium"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Trip
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination matching Screenshot 2 */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 no-print">
              <div>
                Showing {totalResults === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + perPage, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-3">
                {/* Per page dropdown */}
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 pr-8 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>

                {/* Page Navigator */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    &lt;
                  </button>
                  <span className="px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-xs">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: ADD / EDIT / DUPLICATE FORM */}
        {viewMode !== 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/80 shadow-xs p-6 sm:p-8 no-print">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {viewMode === 'add' ? 'Create New Trip' : viewMode === 'edit' ? 'Edit Trip Details' : 'Duplicate Trip'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  Enter trip details, destination, dates, audience, fee, and coordinator information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTripForm} className="space-y-6">
              
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Trip Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Trip Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.tripType}
                    onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    required
                  >
                    {tripTypeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Trip Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Visit to Science City Museum"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    required
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Destination / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g. Science City, Kolkata"
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Start Date & Time */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Start Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    required
                  />
                </div>

                {/* End Date & Time */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    End Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    required
                  />
                </div>

                {/* Fee */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Fee per Participant (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="350"
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Max Participants / Capacity */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Max Capacity (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="e.g. 60"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Trip Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Target Audience Checkboxes */}
              <div className="p-4 bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700/80 space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
                  Target Audience (Select Applicable Groups)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {audienceOptions.map(aud => {
                    const isChecked = formData.audience.includes(aud);
                    return (
                      <label 
                        key={aud} 
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${isChecked ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500 text-teal-800 dark:text-teal-200' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAudience(aud)}
                          className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                        <span className="text-xs sm:text-sm font-medium">{aud}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Incharge / Coordinators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Teacher In-Charge / Coordinator
                  </label>
                  <input
                    type="text"
                    list="teachers-datalist"
                    value={formData.incharge}
                    onChange={(e) => setFormData({ ...formData, incharge: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                  <datalist id="teachers-datalist">
                    {teachersList.map(t => (
                      <option key={t._id} value={t.name}>{t.subject ? `${t.name} (${t.subject})` : t.name}</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    In-Charge Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.inchargeContact}
                    onChange={(e) => setFormData({ ...formData, inchargeContact: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Description & Itinerary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Objectives & Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about the trip learning objectives, destination highlights..."
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Itinerary & Schedule
                  </label>
                  <textarea
                    rows={3}
                    value={formData.itinerary}
                    onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                    placeholder="Day 1: Departure at 8 AM, Visit museum... Day 2: Return journey..."
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Guidelines / Safety instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Guidelines & Instructions for Students / Parents
                </label>
                <textarea
                  rows={2}
                  value={formData.guidelines}
                  onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                  placeholder="Dress code, items to carry, safety protocols, parent consent requirements..."
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {viewMode === 'add' && (
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Keep adding more trips</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {viewMode === 'edit' ? 'Update Trip' : 'Save Trip'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* VIEW TRIP DETAILS MODAL */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-teal-600 text-white flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-white/20 text-white text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                  {selectedTripDetails.tripType || 'Educational Trip'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">{selectedTripDetails.title}</h3>
                {selectedTripDetails.destination && (
                  <p className="text-teal-100 text-xs sm:text-sm flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4" /> {selectedTripDetails.destination}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedTripDetails(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase">Fee</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedTripDetails.fee > 0 ? `₹${selectedTripDetails.fee}` : 'Free'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase">Status</span>
                  <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {selectedTripDetails.status || 'Upcoming'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase">Registrations</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedTripDetails.participants?.length || 0} {selectedTripDetails.maxParticipants > 0 ? `/ ${selectedTripDetails.maxParticipants}` : ''}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase">Coordinator</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {selectedTripDetails.incharge || 'Staff In-charge'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="p-4 bg-gray-50/70 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-teal-600" /> Start:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {formatCreatedAt(selectedTripDetails.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-rose-500" /> End:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    {formatCreatedAt(selectedTripDetails.endDate)}
                  </span>
                </div>
              </div>

              {/* Audience */}
              <div>
                <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Target Audience</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedTripDetails.audience) ? selectedTripDetails.audience : [selectedTripDetails.audience]).map((aud, i) => (
                    <span key={i} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-200 rounded-lg text-xs font-semibold">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {selectedTripDetails.description && (
                <div>
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">Objectives & Description</span>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedTripDetails.description}
                  </p>
                </div>
              )}

              {/* Itinerary */}
              {selectedTripDetails.itinerary && (
                <div>
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">Itinerary & Schedule</span>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                    {selectedTripDetails.itinerary}
                  </p>
                </div>
              )}

              {/* Guidelines */}
              {selectedTripDetails.guidelines && (
                <div>
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block mb-1">Guidelines & Instructions</span>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedTripDetails.guidelines}
                  </p>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => {
                  const t = selectedTripDetails;
                  setSelectedTripDetails(null);
                  handleOpenParticipants(t);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" /> Manage Registrations ({selectedTripDetails.participants?.length || 0})
              </button>

              <button
                onClick={() => setSelectedTripDetails(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANAGE PARTICIPANTS / REGISTRATIONS MODAL */}
      {selectedTripParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Registrations for: {selectedTripParticipants.title}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                  Fee: ₹{selectedTripParticipants.fee || 0} • Total Registered: {selectedTripParticipants.participants?.length || 0}
                  {selectedTripParticipants.maxParticipants > 0 ? ` / ${selectedTripParticipants.maxParticipants}` : ''}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTripParticipants(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Top Action / Add Participant Toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddParticipantForm(!showAddParticipantForm)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showAddParticipantForm ? 'Cancel Registration Form' : 'Register New Participant'}
                </button>

                {selectedTripParticipants.participants?.length > 0 && (
                  <button
                    onClick={() => {
                      const data = selectedTripParticipants.participants.map((p, i) => ({
                        '#': i + 1,
                        'Name': p.name,
                        'Role': p.role,
                        'Roll No': p.rollNo || '-',
                        'Class / Batch': `${p.className || ''} ${p.batchName || ''}`.trim() || '-',
                        'Contact': p.contactNumber || '-',
                        'Emergency Contact': p.emergencyContact || '-',
                        'Payment Status': p.paymentStatus,
                        'Fee Paid (₹)': p.feeAmount || 0,
                        'Consent Received': p.consentReceived ? 'Yes' : 'No',
                        'Registered Date': formatCreatedAt(p.registeredAt)
                      }));
                      const ws = XLSX.utils.json_to_sheet(data);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Participants');
                      XLSX.writeFile(wb, `${selectedTripParticipants.title}_Participants.xlsx`);
                    }}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Sheet
                  </button>
                )}
              </div>

              {/* Add Participant Form */}
              {showAddParticipantForm && (
                <form onSubmit={handleAddParticipantSubmit} className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">
                    Participant Registration Form
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Quick Select Student */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Select Existing Student (Optional Quick Fill)
                      </label>
                      <select
                        onChange={handleStudentSelect}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">-- Choose student or type manually below --</option>
                        {studentsList.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.rollNumber || s.rollNo || 'No Roll'} - {s.className || 'Class'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Participant Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participantFormData.name}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, name: e.target.value })}
                        placeholder="e.g. Aarav Kumar"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Role
                      </label>
                      <select
                        value={participantFormData.role}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="student">Student</option>
                        <option value="employee">Employee / Teacher</option>
                        <option value="guardian">Guardian / Parent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Roll No */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Roll No / ID
                      </label>
                      <input
                        type="text"
                        value={participantFormData.rollNo}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, rollNo: e.target.value })}
                        placeholder="R001"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Class / Batch */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Class / Section / Batch
                      </label>
                      <input
                        type="text"
                        value={participantFormData.className}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, className: e.target.value })}
                        placeholder="Class 1 - A"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={participantFormData.contactNumber}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, contactNumber: e.target.value })}
                        placeholder="9000000001"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={participantFormData.emergencyContact}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, emergencyContact: e.target.value })}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Payment Status
                      </label>
                      <select
                        value={participantFormData.paymentStatus}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, paymentStatus: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Waived">Waived</option>
                      </select>
                    </div>

                    {/* Fee Amount */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={participantFormData.feeAmount}
                        onChange={(e) => setParticipantFormData({ ...participantFormData, feeAmount: e.target.value })}
                        placeholder="350"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Consent Form Check */}
                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={participantFormData.consentReceived}
                          onChange={(e) => setParticipantFormData({ ...participantFormData, consentReceived: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                        <span>Parent Consent Signed</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddParticipantForm(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={participantSubmitting}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      {participantSubmitting ? 'Registering...' : 'Save Registration'}
                    </button>
                  </div>
                </form>
              )}

              {/* Registered Participants Table */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">NAME & ROLL</th>
                      <th className="px-4 py-3">CLASS / ROLE</th>
                      <th className="px-4 py-3">CONTACT</th>
                      <th className="px-4 py-3">PAYMENT</th>
                      <th className="px-4 py-3">CONSENT</th>
                      <th className="px-4 py-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {!selectedTripParticipants.participants || selectedTripParticipants.participants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                          No participants registered yet. Click &quot;Register New Participant&quot; above.
                        </td>
                      </tr>
                    ) : (
                      selectedTripParticipants.participants.map((p, idx) => (
                        <tr key={p._id || idx} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/40">
                          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                            {p.rollNo && <div className="text-[11px] text-gray-400">Roll: {p.rollNo}</div>}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                            <div>{p.className || '-'}</div>
                            <div className="text-[11px] text-gray-400 capitalize">{p.role}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                            <div>{p.contactNumber || '-'}</div>
                            {p.emergencyContact && <div className="text-[11px] text-gray-400">Emerg: {p.emergencyContact}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleTogglePaymentStatus(p)}
                              title="Click to toggle Paid/Pending"
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'}`}
                            >
                              {p.paymentStatus || 'Pending'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {p.consentReceived ? (
                              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
                                <Check className="w-3.5 h-3.5" /> Received
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveParticipant(p._id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remove Participant"
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

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedTripParticipants(null)}
                className="px-5 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COLUMN VISIBILITY CUSTOMIZATION MODAL */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-600" />
                Customize Columns
              </h3>
              <button onClick={() => setShowColumnModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5">
              {[
                { key: 'tripType', label: 'Trip Type' },
                { key: 'title', label: 'Title & Location' },
                { key: 'startDate', label: 'Start Date' },
                { key: 'endDate', label: 'End Date' },
                { key: 'fee', label: 'Fee' },
                { key: 'audience', label: 'Audience' },
                { key: 'createdAt', label: 'Created At' }
              ].map(col => (
                <label key={col.key} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200">{col.label}</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              {confirmModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${confirmModal.confirmColor || 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {confirmModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { 
  Plus, Filter, MoreVertical, RefreshCw, Printer, FileText, Download, 
  Eye, Edit, Copy, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, 
  Home, Check, X, Shield, CreditCard, ChevronDown
} from 'lucide-react';

export default function PaymentMethod({ initialView = 'list' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode from props or URL path
  const isCreateRoute = location.pathname.includes('/create') || initialView === 'add';
  const isEditRoute = location.pathname.includes('/edit');
  
  const [view, setView] = useState(isCreateRoute ? 'add' : 'list'); // 'list' | 'add' | 'edit'
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table & Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalResults, setTotalResults] = useState(0);

  // Active Dropdowns
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Selected item for Show modal / Edit
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModalItem, setShowModalItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    code: '',
    isPaymentGateway: false,
    hasInstrumentNumber: false,
    hasInstrumentDate: false,
    hasClearingDate: false,
    hasBankDetail: false,
    hasBranchDetail: false,
    hasReferenceNumber: false,
    hasCardProvider: false,
    description: ''
  });

  const [keepAdding, setKeepAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync route path changes
  useEffect(() => {
    if (location.pathname.includes('/create')) {
      setView('add');
      resetForm();
    } else if (!isEditRoute) {
      setView('list');
    }
  }, [location.pathname]);

  // Fetch Payment Methods
  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        name: searchQuery || filterName,
        page,
        limit,
        sortBy: sortField,
        sortOrder
      };
      const res = await API.get('/payment-methods', { params });
      if (res.data.success) {
        setPaymentMethods(res.data.data);
        setTotalResults(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to fetch payment methods.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchPaymentMethods();
    }
  }, [view, page, limit, sortField, sortOrder, searchQuery]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(filterName);
    setPage(1);
  };

  const handleFilterCancel = () => {
    setFilterName('');
    setSearchQuery('');
    setPage(1);
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      name: '',
      code: '',
      isPaymentGateway: false,
      hasInstrumentNumber: false,
      hasInstrumentDate: false,
      hasClearingDate: false,
      hasBankDetail: false,
      hasBranchDetail: false,
      hasReferenceNumber: false,
      hasCardProvider: false,
      description: ''
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setView('add');
    setShowHeaderMenu(false);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      _id: item._id,
      name: item.name || '',
      code: item.code || '',
      isPaymentGateway: !!item.isPaymentGateway,
      hasInstrumentNumber: !!item.hasInstrumentNumber,
      hasInstrumentDate: !!item.hasInstrumentDate,
      hasClearingDate: !!item.hasClearingDate,
      hasBankDetail: !!item.hasBankDetail,
      hasBranchDetail: !!item.hasBranchDetail,
      hasReferenceNumber: !!item.hasReferenceNumber,
      hasCardProvider: !!item.hasCardProvider,
      description: item.description || ''
    });
    setView('edit');
    setActiveMenuId(null);
  };

  const handleDuplicate = async (item) => {
    try {
      const res = await API.post(`/payment-methods/${item._id}/duplicate`);
      if (res.data.success) {
        setSuccess('Payment method duplicated successfully!');
        fetchPaymentMethods();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to duplicate payment method.');
    }
    setActiveMenuId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await API.delete(`/payment-methods/${id}`);
      if (res.data.success) {
        setSuccess('Payment method deleted successfully!');
        fetchPaymentMethods();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete payment method.');
    }
    setActiveMenuId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Payment Method Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (view === 'edit' && formData._id) {
        const res = await API.put(`/payment-methods/${formData._id}`, formData);
        if (res.data.success) {
          setSuccess('Payment method updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
          setView('list');
        }
      } else {
        const res = await API.post('/payment-methods', formData);
        if (res.data.success) {
          setSuccess('Payment method added successfully!');
          setTimeout(() => setSuccess(''), 3000);
          if (keepAdding) {
            resetForm();
          } else {
            setView('list');
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save payment method.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Export functions
  const handleExportExcel = () => {
    const csvHeader = "NAME,CODE,CREATED AT\n";
    const csvRows = paymentMethods.map(pm => 
      `"${pm.name}","${pm.code || ''}","${formatDate(pm.createdAt)}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_methods_${Date.now()}.csv`;
    a.click();
    setShowHeaderMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowHeaderMenu(false);
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f4f6f9] dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-100">
      
      {/* Notifications */}
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-between shadow-sm">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* VIEW: LIST */}
      {view === 'list' && (
        <div className="space-y-4">
          
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>Finance</span>
                <span>&gt;</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">Payment Method</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Payment Method
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-2 transition"
              >
                <span>Add Payment Method</span>
              </button>

              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`p-2 rounded-lg border shadow-sm transition ${
                  showFilter 
                    ? 'bg-teal-50 border-teal-300 text-teal-600 dark:bg-slate-700 dark:border-teal-500' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle Filters"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Header Menu 3 dots */}
              <div className="relative">
                <button
                  onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showHeaderMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1">
                    <button
                      onClick={fetchPaymentMethods}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <Printer className="w-4 h-4 text-slate-400" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Generate PDF</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Export to Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Card */}
          {showFilter && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200">
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="max-w-md">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleFilterCancel}
                    className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium text-white bg-[#1e293b] hover:bg-[#0f172a] dark:bg-teal-600 dark:hover:bg-teal-700 rounded-lg shadow-sm transition"
                  >
                    Filter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Data Table Container */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th 
                      onClick={() => handleSort('name')}
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center space-x-1">
                        <span>NAME</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('code')}
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center space-x-1">
                        <span>CODE</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <div className="flex items-center space-x-1">
                        <span>CREATED AT</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mb-2"></div>
                        <p className="text-xs font-medium">Loading payment methods...</p>
                      </td>
                    </tr>
                  ) : paymentMethods.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No Payment Methods Found</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Add Payment Method" to create your first payment gateway or cash option.</p>
                      </td>
                    </tr>
                  ) : (
                    paymentMethods.map((pm) => (
                      <tr 
                        key={pm._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                          {pm.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {pm.code || ''}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                          {formatDate(pm.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === pm._id ? null : pm._id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === pm._id && (
                            <div className="absolute right-4 top-10 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 text-left">
                              <button
                                onClick={() => {
                                  setShowModalItem(pm);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>Show</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(pm)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDuplicate(pm)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => handleDelete(pm._id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
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
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {totalResults === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalResults)} of {totalResults} results
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-[#1e293b] text-white rounded font-medium text-xs">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * limit >= totalResults}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4">
            Campus Tracker
          </div>
        </div>
      )}

      {/* VIEW: ADD OR EDIT FORM */}
      {(view === 'add' || view === 'edit') && (
        <div className="space-y-4 max-w-6xl mx-auto">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>Finance</span>
                <span>&gt;</span>
                <span className="cursor-pointer hover:underline" onClick={() => setView('list')}>Payment Method</span>
                <span>&gt;</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  {view === 'edit' ? 'Edit Payment Method' : 'Add Payment Method'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {view === 'edit' ? 'Edit Payment Method' : 'Add Payment Method'}
              </h1>
            </div>

            <div>
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white font-medium text-xs rounded-lg shadow-sm transition"
              >
                List all Payment Method
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Row 1: Name, Code, Is Payment Gateway */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    placeholder="Code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Is Payment Gateway
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPaymentGateway: !formData.isPaymentGateway })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPaymentGateway ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isPaymentGateway ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Row 2: Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Instrument Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasInstrumentNumber: !formData.hasInstrumentNumber })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasInstrumentNumber ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasInstrumentNumber ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Instrument Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasInstrumentDate: !formData.hasInstrumentDate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasInstrumentDate ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasInstrumentDate ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Clearing Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasClearingDate: !formData.hasClearingDate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasClearingDate ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasClearingDate ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Row 3: Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Bank Detail
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasBankDetail: !formData.hasBankDetail })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasBankDetail ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasBankDetail ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Branch Detail
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasBranchDetail: !formData.hasBranchDetail })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasBranchDetail ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasBranchDetail ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Reference Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasReferenceNumber: !formData.hasReferenceNumber })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasReferenceNumber ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasReferenceNumber ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Row 4: Card Provider */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Has Card Provider
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasCardProvider: !formData.hasCardProvider })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.hasCardProvider ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasCardProvider ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                ></textarea>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition"
                  >
                    Reset
                  </button>

                  {view === 'add' && (
                    <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepAdding}
                        onChange={(e) => setKeepAdding(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Keep Adding</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-5 py-2 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#1e293b] hover:bg-[#0f172a] dark:bg-teal-600 dark:hover:bg-teal-700 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

            </form>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4">
            Campus Tracker
          </div>
        </div>
      )}

      {/* SHOW MODAL */}
      {showModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => setShowModalItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {showModalItem.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Code: {showModalItem.code || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-700">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Created At:</span>
                <span className="font-semibold">{formatDate(showModalItem.createdAt)}</span>
              </div>
              
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className={`px-2 py-0.5 rounded font-medium ${showModalItem.isPaymentGateway ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {showModalItem.isPaymentGateway ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>Instrument Number: <b>{showModalItem.hasInstrumentNumber ? 'Yes' : 'No'}</b></div>
                <div>Instrument Date: <b>{showModalItem.hasInstrumentDate ? 'Yes' : 'No'}</b></div>
                <div>Clearing Date: <b>{showModalItem.hasClearingDate ? 'Yes' : 'No'}</b></div>
                <div>Bank Detail: <b>{showModalItem.hasBankDetail ? 'Yes' : 'No'}</b></div>
                <div>Branch Detail: <b>{showModalItem.hasBranchDetail ? 'Yes' : 'No'}</b></div>
                <div>Reference Number: <b>{showModalItem.hasReferenceNumber ? 'Yes' : 'No'}</b></div>
                <div>Card Provider: <b>{showModalItem.hasCardProvider ? 'Yes' : 'No'}</b></div>
              </div>

              {showModalItem.description && (
                <div className="pt-3">
                  <span className="text-slate-500 block mb-1">Description:</span>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg">
                    {showModalItem.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModalItem(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

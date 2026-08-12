import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import {
  Filter, MoreVertical, Search, Home, ChevronRight, RefreshCw,
  Trash2, Calendar, Shield, User, Monitor, Globe, Clock, ArrowUpDown, ChevronLeft
} from 'lucide-react';

export default function ActivityLog() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(15);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activityType, setActivityType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        role: roleFilter,
        activityType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const res = await API.get(`/activity-logs?${params.toString()}`);
      if (res.data.success) {
        let fetchedData = res.data.data;
        if (sortOrder === 'asc') {
          fetchedData = [...fetchedData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
          fetchedData = [...fetchedData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setLogs(fetchedData);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, roleFilter, activityType, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setActivityType('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Format date like: "August 12, 2026 7:41 PM"
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumb matching image: Dashboard > Activity Log */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 mb-1 font-medium">
            <Home className="w-4 h-4 text-gray-400" />
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-700 dark:text-slate-200 font-semibold">Activity Log</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Activity Log
          </h1>
        </div>

        {/* Top Right Filter & Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${showFilters || roleFilter !== 'all' || activityType !== 'all' || search
              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400'
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750'
              }`}
            title="Toggle Filter Options"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750 transition"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-500' : ''}`} />
          </button>

          <div className="relative group">
            <button
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 transition"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl py-1 hidden group-hover:block z-20">
              <button
                onClick={handleResetFilters}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Clear All Filters
              </button>
              {user?.role === 'super-admin' && (
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear ALL activity logs? This action cannot be undone.')) {
                      await API.delete('/activity-logs/clear');
                      fetchLogs();
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Logs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Search Log</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="User, activity, IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">User Role</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="guardian">Guardian / Parent</option>
                <option value="accountant">Accountant</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>

            {/* Activity Type Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Activity Action</label>
              <select
                value={activityType}
                onChange={(e) => { setActivityType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Actions</option>
                <option value="login">User logged in.</option>
                <option value="logout">User logged out.</option>
                <option value="updated">User updated.</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-sm transition shadow-sm"
              >
                Apply Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Activity Log Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700/80 bg-gray-50/50 dark:bg-slate-800/60">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  USER
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  ACTIVITY
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  IP
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  BROWSER
                </th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                  OS
                </th>
                <th
                  onClick={toggleSort}
                  className="py-4 px-6 text-[12px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600 transition flex items-center space-x-1"
                >
                  <span>DATE & TIME</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                      <span className="text-sm font-medium">Loading activity logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                      <p className="text-base font-semibold text-gray-700 dark:text-slate-300">No activity logs found</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">Logins, logouts, and user updates will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-750/50 transition-colors"
                  >
                    {/* USER */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 dark:text-white text-[14px]">
                        {log.userName}
                      </div>
                    </td>

                    {/* ACTIVITY */}
                    <td className="py-4 px-6">
                      <span className="text-gray-700 dark:text-slate-300 text-[14px] font-medium">
                        {log.activity}
                      </span>
                    </td>

                    {/* IP */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-400 text-[14px] font-mono">
                      {log.ip || '172.68.164.32'}
                    </td>

                    {/* BROWSER */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-400 text-[14px]">
                      {log.browser || 'Chrome 151'}
                    </td>

                    {/* OS */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-400 text-[14px]">
                      {log.os || 'Windows 10'}
                    </td>

                    {/* DATE & TIME */}
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 text-[14px]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-slate-800/40">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-gray-800 dark:text-white">{logs.length}</span> of <span className="font-bold text-gray-800 dark:text-white">{total}</span> activity records
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 px-2">
                Page {page} of {pages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page >= pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

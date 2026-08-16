import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Key, ShieldAlert, CheckCircle2, RotateCcw, Search } from 'lucide-react';

export default function UserCredentials() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/credentials');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${name} to default (123456 / Serial Number)?`)) {
      return;
    }

    setResettingId(userId);
    setError('');
    setSuccessMsg('');

    try {
      await API.put(`/users/${userId}/reset-password`);
      setSuccessMsg(`Password for ${name} has been reset to default.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email !== 'superadmin@school.com' && (
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Key className="h-8 w-8 text-teal-500" />
          User Credentials Management
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          View all user accounts, default passwords, and reset passwords if users forget them.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Security Warning */}
      <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
        <h3 className="text-amber-800 dark:text-amber-500 font-bold mb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Security Notice
        </h3>
        <p className="text-amber-700 dark:text-amber-400/80 text-sm">
          The default password is <strong>123456</strong> (or Serial Number). Users can change their own password after logging in. Passwords are encrypted using one-way hashing algorithms. If a user changes their password, you will not be able to see it. If they forget it, you can reset it back to the default password.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium border-b border-gray-100 dark:border-slate-700">Name</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100 dark:border-slate-700">Role</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100 dark:border-slate-700">User ID (Email)</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100 dark:border-slate-700">Default Password</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100 dark:border-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 dark:text-white">{u.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        u.role === 'super-admin' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                        u.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                        u.role === 'teacher' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                        'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-sm text-gray-800 dark:text-slate-200">
                        {u.serialNumber || '123456'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleResetPassword(u._id, u.name)}
                        disabled={resettingId === u._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {resettingId === u._id ? (
                          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        )}
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

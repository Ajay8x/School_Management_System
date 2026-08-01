import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
  ShieldCheck, Users as UsersIcon, UserCog, Search, Filter, 
  MoreVertical, Edit, Trash2, ShieldAlert,
  ChevronRight, RefreshCw, X,
  GraduationCap, UserCheck, Wallet, Library
} from 'lucide-react';

const ROLE_CONFIG = {
  'super-admin': { label: 'Super Admin', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: ShieldCheck },
  'admin': { label: 'Admin', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: ShieldCheck },
  'teacher': { label: 'Teacher', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: UsersIcon },
  'student': { label: 'Student', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: GraduationCap },
  'parent': { label: 'Parent', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: UserCheck },
  'accountant': { label: 'Accountant', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Wallet },
  'librarian': { label: 'Librarian', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Library },
};

export default function Users() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load users. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setUpdating(true);
      await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', password: '' });
  const [addingUser, setAddingUser] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const payload = { ...newUser };
      if (!payload.password) delete payload.password; // backend might use default if empty or we can leave it
      await API.post('/auth/register', payload);
      alert('User added successfully');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'student', password: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const roleStats = Object.keys(ROLE_CONFIG).reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length;
    return acc;
  }, {});

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-teal-500" />
            User Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage all system users and their account statuses.</p>
        </div>
        <div className="flex gap-2">
          {currentUser?.role === 'super-admin' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <UserCog className="w-4 h-4" />
              Add User
            </button>
          )}
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>
      </div>

      {/* Role Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(ROLE_CONFIG).map(([id, config]) => {
          const RoleIcon = config.icon;
          return (
            <div 
              key={id}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-default group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${config.color.split(' ')[0]}`}>
                <RoleIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">{config.label}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{roleStats[id] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden relative">
        {/* Table Controls */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-800/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 dark:text-slate-300"
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Roles</option>
              {Object.keys(ROLE_CONFIG).map(role => (
                <option key={role} value={role}>{ROLE_CONFIG[role].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Current Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    <UsersIcon className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => {
                  const RoleIcon = ROLE_CONFIG[user.role]?.icon;
                  return (
                    <tr key={user._id} className="group hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-slate-700 flex items-center justify-center border border-teal-100 dark:border-slate-600">
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ROLE_CONFIG[user.role]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {RoleIcon && <span className="opacity-70"><RoleIcon className="w-3.5 h-3.5" /></span>}
                          {ROLE_CONFIG[user.role]?.label || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentUser?.role === 'super-admin' && (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                              title="Change Role"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        )}
                        <MoreVertical className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:hidden ml-auto" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/30">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-700 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-700 dark:text-white">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="font-semibold text-gray-700 dark:text-white">{filteredUsers.length}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-teal-500" />
                Change User Role
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                  {editingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{editingUser.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{editingUser.email}</p>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Select New Role</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(ROLE_CONFIG).map(([id, config]) => {
                  const RoleIcon = config.icon;
                  return (
                    <button
                      key={id}
                      onClick={() => handleUpdateRole(editingUser._id, id)}
                      disabled={updating}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        editingUser.role === id 
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20' 
                          : 'border-gray-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-slate-300">{config.label}</span>
                      </div>
                      {editingUser.role === id && <ShieldCheck className="w-5 h-5 text-teal-500" />}
                      {editingUser.role !== id && updating && editingUser.role === id && <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
               <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mr-auto italic">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Updating will change system permissions immediately.
               </div>
               <button 
                onClick={() => setEditingUser(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-teal-500" />
                Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  {Object.entries(ROLE_CONFIG).map(([id, config]) => (
                    <option key={id} value={id}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Password (Optional)</label>
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Leave blank for default"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                  type="submit"
                  disabled={addingUser}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                 >
                   {addingUser && <RefreshCw className="w-4 h-4 animate-spin" />}
                   Add User
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

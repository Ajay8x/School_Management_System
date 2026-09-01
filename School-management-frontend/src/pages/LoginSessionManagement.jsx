import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Shield, Clock, Monitor, RefreshCw, XCircle, User, Activity, AlertCircle, Save, Edit2, Check, X } from 'lucide-react';

export default function LoginSessionManagement() {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [timeouts, setTimeouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Timeout Config State
  const [editingRole, setEditingRole] = useState(null);
  const [editDuration, setEditDuration] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const availableRoles = [
    'student', 'admin', 'super-admin', 'accountant', 'librarian',
    'attendance-assistant', 'exam-incharge', 'guardian', 'hostel-incharge', 
    'inventory-incharge', 'manager', 'mess-incharge', 'observer', 'principal', 
    'receptionist', 'staff', 'transport-incharge', 'user', 'vice-principal'
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, timeoutsRes] = await Promise.all([
        API.get('/login-sessions'),
        (user?.role === 'super-admin' || user?.role === 'admin') ? API.get('/login-sessions/timeouts') : Promise.resolve({ data: [] })
      ]);
      setSessions(sessionsRes.data);
      setTimeouts(timeoutsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load login sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) return;
    
    try {
      await API.put(`/login-sessions/${id}/revoke`);
      setSuccessMsg('Session revoked successfully.');
      setSessions(sessions.map(s => s._id === id ? { ...s, isActive: false } : s));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error revoking session:', err);
      setError('Failed to revoke session.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSaveTimeout = async (role, durationMinutes) => {
    try {
      await API.put('/login-sessions/timeouts', { role, durationMinutes: Number(durationMinutes) });
      setSuccessMsg(`Timeout for ${role} updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditingRole(null);
      setNewRole('');
      setNewDuration('');
      fetchData();
    } catch (err) {
      console.error('Error updating timeout:', err);
      setError('Failed to update timeout.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} Days`;
    if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} Hours`;
    return `${minutes} Minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-500" />
            Login Session Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Monitor active login sessions and set role-based session timeouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'super-admin' || user?.role === 'admin') && (
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${showConfig ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 border' : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200'}`}
            >
              <Clock className="w-4 h-4" />
              Configure Timeouts
            </button>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 rounded-r-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm text-rose-800 dark:text-rose-200 font-medium">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500 rounded-r-xl flex items-center gap-3">
          <Shield className="w-5 h-5 text-teal-500" />
          <p className="text-sm text-teal-800 dark:text-teal-200 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && (user?.role === 'super-admin' || user?.role === 'admin') && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm p-6 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Role-Based Session Timeouts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRoles.map(role => {
              const configuredTimeout = timeouts.find(t => t.role === role);
              const isEditing = editingRole === role;
              
              return (
                <div key={role} className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${configuredTimeout ? 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300 capitalize">{role.replace('-', ' ')}</span>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveTimeout(role, editDuration)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-1 rounded transition"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded transition"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingRole(role); setEditDuration(configuredTimeout ? configuredTimeout.durationMinutes : ''); }} 
                        className="text-gray-400 hover:text-teal-500 transition p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                        title="Set Session Timeout"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={editDuration} 
                        onChange={e => setEditDuration(e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded outline-none focus:border-teal-500" 
                        placeholder="Minutes (e.g. 60)"
                        autoFocus
                      />
                      <span className="text-xs text-gray-500 font-medium">mins</span>
                    </div>
                  ) : (
                    <div className={`text-lg font-mono ${configuredTimeout ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500 text-sm'}`}>
                      {configuredTimeout ? formatDuration(configuredTimeout.durationMinutes) : 'Default (30 Days)'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-teal-500" />
            <p className="text-sm font-medium">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-700">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Sessions Found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no recent login sessions to display.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device & IP</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Login Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{session.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 uppercase">{session.user?.role || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-slate-300 truncate max-w-[200px]" title={session.deviceInfo}>
                          {session.deviceInfo?.split(' ')[0] || 'Unknown Device'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        IP: {session.ipAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-slate-300">{formatDate(session.loginTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(session.lastActivity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {session.isActive && (
                        <button
                          onClick={() => handleRevoke(session._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-lg text-xs font-bold transition-colors"
                          title="Revoke Session"
                        >
                          <XCircle className="w-4 h-4" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

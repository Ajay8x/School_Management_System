import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  Users, Search, Plus, Save, RefreshCw, X, 
  UserCheck, LogIn, LogOut, Clock, Phone,
  ShieldCheck, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    purpose: '',
    visitTo: '',
    idNumber: '',
    note: ''
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reception/visitors');
      setVisitors(res.data);
    } catch (err) {
      console.error('Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reception/visitors', formData);
      fetchVisitors();
      setIsModalOpen(false);
      setFormData({ name: '', contact: '', purpose: '', visitTo: '', idNumber: '', note: '' });
    } catch (err) {
      alert('Failed to save visitor log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await API.patch(`/reception/visitors/${id}/out`);
      fetchVisitors();
    } catch (err) {
      alert('Failed to check out visitor');
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.visitTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-emerald-500" />
            Visitor Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Track and authorize campus entries for enhanced security.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-emerald-500/30 transition-all font-black active:scale-95"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Visitor Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Today's Visitors</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">{visitors.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Now</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{visitors.filter(v => !v.outTime).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Average Wait</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">12m</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unauthorized</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">0</p>
        </div>
      </div>

      {/* List Area */}
      <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by visitor or host name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
          <button onClick={fetchVisitors} className="p-3 text-gray-400 hover:text-emerald-500 transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5">Visitor Details</th>
                <th className="px-8 py-5">Meeting With</th>
                <th className="px-8 py-5">Time In / Out</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto text-emerald-500" /></td></tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-400 font-bold">No visitor records today.</td>
                </tr>
              ) : filteredVisitors.map((v) => (
                <tr key={v._id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight">{v.name}</p>
                        <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-0.5">{v.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-300" />
                      {v.visitTo}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        IN: {new Date(v.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        OUT: {v.outTime ? new Date(v.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      v.outTime ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600 animate-pulse'
                    }`}>
                      {v.outTime ? 'Checked Out' : 'On Campus'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {!v.outTime && (
                      <button 
                        onClick={() => handleCheckOut(v._id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Visitor Entry</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Register new visitor at the gate.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div>
                <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Visitor Name *</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Contact Number *</label>
                <input 
                  type="text" required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Visiting Whom? *</label>
                <input 
                  type="text" required
                  value={formData.visitTo}
                  onChange={(e) => setFormData({...formData, visitTo: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">ID Proof Number</label>
                <input 
                  type="text"
                  placeholder="Aadhar / License"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Purpose of Visit *</label>
                <textarea 
                  required rows="3"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                ></textarea>
              </div>
            </form>

            <div className="p-10 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex gap-6">
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="flex-1 px-8 py-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-[24px] font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] px-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <LogIn className="w-5 h-5" />
                {submitting ? 'Recording...' : 'Record Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

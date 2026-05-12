import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  AlertTriangle, Search, Plus, Save, RefreshCw, X, 
  Flag, MessageSquare, User, Phone, 
  CheckCircle2, ChevronRight, Filter, AlertCircle
} from 'lucide-react';

export default function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    complaintType: 'General',
    source: 'Parent',
    complainantName: '',
    contact: '',
    description: '',
    actionTaken: '',
    assignedTo: '',
    status: 'Pending'
  });

  const complaintTypes = ['Academic', 'Infrastructure', 'Behavioral', 'Financial', 'General'];
  const sources = ['Parent', 'Student', 'Staff', 'External'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reception/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reception/complaints', formData);
      fetchComplaints();
      setIsModalOpen(false);
      setFormData({ complaintType: 'General', source: 'Parent', complainantName: '', contact: '', description: '', actionTaken: '', assignedTo: '', status: 'Pending' });
    } catch (err) {
      alert('Failed to save complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/reception/complaints/${id}`, { status });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.complaintType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
            Complaint Redressal
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Monitor and resolve grievances from parents, students, and staff.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-rose-500/30 transition-all font-black active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Complaint
        </button>
      </div>

      {/* Grid of Complaints */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 animate-spin text-rose-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => (
            <div key={c._id} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-xl border border-gray-100 dark:border-slate-700 hover:border-rose-500/30 transition-all group overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                  c.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                  'bg-rose-50 text-rose-600 animate-pulse'
                }`}>
                  {c.status}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.complaintType}</span>
              </div>

              <div className="mb-6">
                <h3 className="font-black text-gray-800 dark:text-white uppercase leading-tight mb-1">{c.complainantName}</h3>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500">{c.source} • {new Date(c.date).toLocaleDateString()}</p>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 font-medium line-clamp-3 mb-6 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                "{c.description}"
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-slate-700">
                <div className="flex gap-2">
                  {c.status !== 'Resolved' && (
                    <button 
                      onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Mark as Resolved"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                  {c.status === 'Pending' && (
                    <button 
                      onClick={() => handleStatusUpdate(c._id, 'In Progress')}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      title="Start Working"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1 group">
                  View Details
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Log Complaint</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Formalize a new grievance for tracking.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Complaint Type *</label>
                  <select 
                    value={formData.complaintType}
                    onChange={(e) => setFormData({...formData, complaintType: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {complaintTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Source *</label>
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Complainant Name *</label>
                  <input 
                    type="text" required
                    value={formData.complainantName}
                    onChange={(e) => setFormData({...formData, complainantName: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Contact Number</label>
                  <input 
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Description *</label>
                <textarea 
                  required rows="4"
                  placeholder="Detail the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[28px] text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none"
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
                className="flex-[2] px-8 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-rose-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Flag className="w-5 h-5" />
                {submitting ? 'Logging...' : 'Log Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

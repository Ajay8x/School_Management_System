import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { 
  UserPlus, Search, Plus, Save, RefreshCw, X, 
  MessageSquare, User, Phone, Mail, Calendar,
  Target, Users, FileText, CheckCircle2, ChevronRight,
  Filter
} from 'lucide-react';

export default function Enquiry() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'add'
  
  const [formData, setFormData] = useState({
    purpose: 'Admission',
    name: '',
    contact: '',
    email: '',
    description: '',
    source: 'Walk-in',
    status: 'Pending'
  });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reception/enquiries');
      setEnquiries(res.data);
    } catch (err) {
      console.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reception/enquiries', formData);
      fetchEnquiries();
      setViewMode('list');
      setFormData({ purpose: 'Admission', name: '', contact: '', email: '', description: '', source: 'Walk-in', status: 'Pending' });
    } catch (err) {
      alert('Failed to save enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.contact.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-indigo-500" />
            Admission Enquiry
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Manage and track prospective student enquiries and walk-ins.</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
            className={`px-8 py-4 rounded-2xl flex items-center shadow-xl transition-all font-black active:scale-95 ${
              viewMode === 'list' 
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30' 
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-white border border-gray-100 dark:border-slate-700'
            }`}
          >
            {viewMode === 'list' ? (
              <><Plus className="w-5 h-5 mr-2" /> Add New Enquiry</>
            ) : (
              <><ChevronRight className="w-5 h-5 mr-2 rotate-180" /> Back to List</>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Enquiries</p>
                <p className="text-2xl font-black text-gray-800 dark:text-white">{enquiries.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Follow-ups</p>
                <p className="text-2xl font-black text-gray-800 dark:text-white">{enquiries.filter(e => e.status === 'Pending').length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Converted/Resolved</p>
                <p className="text-2xl font-black text-gray-800 dark:text-white">{enquiries.filter(e => e.status === 'Resolved').length}</p>
              </div>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
              <button onClick={fetchEnquiries} className="p-3 text-gray-400 hover:text-indigo-500 transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-8 py-5">Person Details</th>
                    <th className="px-8 py-5">Purpose</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Source</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {loading ? (
                    <tr><td colSpan="6" className="py-20 text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></td></tr>
                  ) : filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-100 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No enquiries found.</p>
                      </td>
                    </tr>
                  ) : filteredEnquiries.map((enq) => (
                    <tr key={enq._id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                            {enq.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight">{enq.name}</p>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-0.5">{enq.contact}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider">
                          {enq.purpose}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-500 dark:text-slate-400">
                        {new Date(enq.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-500 dark:text-slate-400">
                        {enq.source}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          enq.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                          enq.status === 'Follow-up' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-gray-50 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-500">
          <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Add Enquiry Details</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Please fill in the information provided by the visitor.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Enquiry Purpose *</label>
                    <div className="flex gap-4">
                      {['Admission', 'General', 'Feedback'].map(p => (
                        <button
                          key={p} type="button"
                          onClick={() => setFormData({...formData, purpose: p})}
                          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                            formData.purpose === p 
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                            : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-700 hover:border-indigo-500/30'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Full Name *</label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300" />
                      <input 
                        type="text" required
                        placeholder="Visitor's Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-16 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Contact Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300" />
                        <input 
                          type="text" required
                          placeholder="Phone Number"
                          value={formData.contact}
                          onChange={(e) => setFormData({...formData, contact: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300" />
                        <input 
                          type="email"
                          placeholder="Optional"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Enquiry Source</label>
                    <select 
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-700 dark:text-slate-300"
                    >
                      <option>Walk-in</option>
                      <option>Social Media</option>
                      <option>Website</option>
                      <option>Referral</option>
                      <option>Advertisement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Description / Remarks</label>
                    <div className="relative">
                      <FileText className="w-5 h-5 absolute left-6 top-6 text-gray-300" />
                      <textarea 
                        rows="6"
                        placeholder="Add details about the enquiry..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[32px] text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-6">
                <button 
                  type="button" onClick={() => setViewMode('list')}
                  className="px-10 py-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-[24px] font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="px-12 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  {submitting ? 'Saving...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

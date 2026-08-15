import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import { 
  Wallet, Search, Plus, Trash2, Edit, 
  CreditCard, Banknote, Receipt, CheckCircle2,
  AlertCircle, RefreshCw, X, Save, ChevronRight,
  Filter, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

export default function Fees() {
  const { user: currentUser } = useContext(AuthContext);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student: '',
    feeType: 'Tuition Fee',
    amount: '',
    paidAmount: '',
    dueDate: '',
    paymentMethod: 'Cash'
  });

  const feeTypes = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Other'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes] = await Promise.all([
        API.get('/fees'),
        API.get('/students')
      ]);
      setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching fee data:', err);
      setError('Failed to load fee data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSchoolRefresh(fetchData);

  const handleOpenModal = (fee = null) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        student: fee.student?._id || fee.student,
        feeType: fee.feeType,
        amount: fee.amount,
        paidAmount: fee.paidAmount,
        dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
        paymentMethod: fee.paymentMethod || 'Cash'
      });
    } else {
      setEditingFee(null);
      setFormData({ student: '', feeType: 'Tuition Fee', amount: '', paidAmount: '', dueDate: '', paymentMethod: 'Cash' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Determine status based on paid amount
      let status = 'Pending';
      const amt = parseFloat(formData.amount);
      const paid = parseFloat(formData.paidAmount || 0);
      if (paid >= amt) status = 'Paid';
      else if (paid > 0) status = 'Partial';

      const payload = { ...formData, status };

      if (editingFee) {
        await API.put(`/fees/${editingFee._id}`, payload);
      } else {
        await API.post('/fees', payload);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save fee record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await API.delete(`/fees/${id}`);
      setFees(fees.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const filteredFees = fees.filter(f => {
    const studentName = f.student?.name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         f.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totals = fees.reduce((acc, f) => ({
    total: acc.total + f.amount,
    collected: acc.collected + f.paidAmount,
    pending: acc.pending + (f.amount - f.paidAmount)
  }), { total: 0, collected: 0, pending: 0 });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-teal-500" />
            Fees & Billing
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Track student tuition, handle payments, and manage financial records.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-teal-500/30 transition-all font-black active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Fee Invoice
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-[60px] flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8 text-teal-500" />
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Collected</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{totals.collected.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-[10px] font-bold text-teal-500 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full w-fit">
            Realized Revenue
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[60px] flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingDown className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Pending Due</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{totals.pending.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full w-fit">
            Outstanding Balance
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[60px] flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Invoiced</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{totals.total.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit">
            Academic Year Target
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Filters */}
        <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by student or fee type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            {['All', 'Paid', 'Partial', 'Pending'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedStatus === status 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                  : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-100 dark:border-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5">Student Information</th>
                <th className="px-8 py-5">Fee Type</th>
                <th className="px-8 py-5">Amount (Total/Paid)</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Due Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto text-teal-500" /></td></tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Receipt className="w-16 h-16 text-gray-100 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No fee records found.</p>
                  </td>
                </tr>
              ) : filteredFees.map((fee) => (
                <tr key={fee._id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black">
                        {fee.student?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight">{fee.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-0.5">{fee.student?.rollNumber || 'No ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider">
                      {fee.feeType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 dark:text-white">₹{fee.paidAmount.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-gray-400">of ₹{fee.amount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                      fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      fee.status === 'Partial' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                      {fee.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {fee.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500 dark:text-slate-400">
                    {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleOpenModal(fee)} className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(fee._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment/Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  {editingFee ? 'Update Payment' : 'New Fee Invoice'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Manage student financial transactions and dues.</p>
              </div>
              <button onClick={handleCloseModal} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Student *</label>
                  <select 
                    required disabled={!!editingFee}
                    value={formData.student}
                    onChange={(e) => setFormData({...formData, student: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300 disabled:opacity-50"
                  >
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Fee Type *</label>
                  <select 
                    required
                    value={formData.feeType}
                    onChange={(e) => setFormData({...formData, feeType: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {feeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Total Amount *</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      type="number" required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Amount Paid</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-black text-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Due Date</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Payment Method</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </form>

            <div className="p-10 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex gap-6">
              <button 
                type="button" onClick={handleCloseModal}
                className="flex-1 px-8 py-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-[20px] font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] px-8 py-5 bg-teal-500 hover:bg-teal-600 text-white rounded-[20px] font-black text-sm shadow-2xl shadow-teal-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" />
                {submitting ? 'Processing...' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

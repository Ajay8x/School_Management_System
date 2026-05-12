import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart3, Plus, Trash2, Edit, Search, 
  TrendingUp, TrendingDown, Landmark, 
  RefreshCw, X, Save, FileText, Calendar,
  ArrowUpRight, ArrowDownRight, IndianRupee,
  Briefcase, UtilityPole, Wrench, Book, GraduationCap, Gift,
  Filter
} from 'lucide-react';

export default function Accounts() {
  const { user: currentUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Income',
    category: 'Other',
    paymentMethod: 'Cash',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    Income: ['Fee Payment', 'Events', 'Library', 'Other'],
    Expense: ['Salary', 'Infrastructure', 'Utilities', 'Maintenance', 'Library', 'Events', 'Other']
  };

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/accounts');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingTransaction(tx);
      setFormData({
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'Other',
        paymentMethod: tx.paymentMethod || 'Cash',
        description: tx.description || '',
        date: new Date(tx.date).toISOString().split('T')[0]
      });
    } else {
      setEditingTransaction(null);
      setFormData({ 
        title: '', amount: '', type: 'Income', category: 'Other', 
        paymentMethod: 'Cash', description: '', 
        date: new Date().toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await API.put(`/accounts/${editingTransaction._id}`, formData);
      } else {
        await API.post('/accounts', formData);
      }
      fetchTransactions();
      handleCloseModal();
    } catch (err) {
      alert('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await API.delete(`/accounts/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || t.type === selectedType;
    return matchesSearch && matchesType;
  });

  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'Income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Fee Payment': return <GraduationCap className="w-4 h-4" />;
      case 'Salary': return <Briefcase className="w-4 h-4" />;
      case 'Utilities': return <UtilityPole className="w-4 h-4" />;
      case 'Maintenance': return <Wrench className="w-4 h-4" />;
      case 'Library': return <Book className="w-4 h-4" />;
      case 'Events': return <Gift className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
            Financial Accounts
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Manage school-wide income, expenses, and overall financial health.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-indigo-500/30 transition-all font-black active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        )}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-xs font-black uppercase tracking-widest mb-2 text-indigo-100">Net Balance</p>
          <h3 className="text-4xl font-black mb-4 flex items-center gap-2">
            <IndianRupee className="w-8 h-8" />
            {(summary.income - summary.expense).toLocaleString()}
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-100">
            <Landmark className="w-4 h-4" />
            Total School Liquidity
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-widest">Total Income</span>
          </div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{summary.income.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full uppercase tracking-widest">Total Expense</span>
          </div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white">₹{summary.expense.toLocaleString()}</h3>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            {['All', 'Income', 'Expense'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedType === type 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-100 dark:border-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-5">Transaction Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-100 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">No transactions found.</p>
                  </td>
                </tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx._id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                        tx.type === 'Income' 
                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' 
                        : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'
                      }`}>
                        {tx.type === 'Income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-white uppercase leading-tight">{tx.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-0.5">{tx.paymentMethod}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-xl text-xs font-black w-fit">
                      {getCategoryIcon(tx.category)}
                      {tx.category}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-base font-black ${
                      tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleOpenModal(tx)} className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(tx._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
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

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Keep track of school revenue and expenditures.</p>
              </div>
              <button onClick={handleCloseModal} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Transaction Title *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Monthly Electricity Bill"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      type="number" required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Type *</label>
                  <div className="flex gap-4">
                    {['Income', 'Expense'].map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setFormData({...formData, type: t, category: categories[t][0]})}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                          formData.type === t 
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' 
                          : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-700 hover:border-indigo-500/30'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Category *</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {categories[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Transaction Date</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Payment Method</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Description (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Additional notes about this transaction..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                ></textarea>
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
                className="flex-[2] px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-2xl shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" />
                {submitting ? 'Recording...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

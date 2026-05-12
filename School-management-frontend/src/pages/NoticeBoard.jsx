import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Bell, Plus, Trash2, Edit, Search, 
  Calendar, User, Tag, X, Save, RefreshCw,
  Megaphone, AlertTriangle, Info, PartyPopper, BookOpen,
  Filter
} from 'lucide-react';

export default function NoticeBoard() {
  const { user: currentUser } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All'
  });

  const categories = ['All', 'General', 'Urgent', 'Holiday', 'Event', 'Academic'];
  const audiences = ['All', 'Students', 'Teachers', 'Parents'];

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices');
      setNotices(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (notice = null) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        targetAudience: notice.targetAudience
      });
    } else {
      setEditingNotice(null);
      setFormData({ title: '', content: '', category: 'General', targetAudience: 'All' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingNotice) {
        await API.put(`/notices/${editingNotice._id}`, formData);
      } else {
        await API.post('/notices', formData);
      }
      fetchNotices();
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await API.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Urgent': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Holiday': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Event': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Academic': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'Holiday': return <Info className="w-4 h-4" />;
      case 'Event': return <PartyPopper className="w-4 h-4" />;
      case 'Academic': return <BookOpen className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-teal-500 animate-bounce" />
            Notice Board
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Stay updated with the latest school announcements and news.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl flex items-center shadow-lg shadow-teal-500/20 transition-all font-black active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Notice
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search notices..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 font-bold">Loading notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[40px] border border-dashed border-gray-200 dark:border-slate-700">
          <Megaphone className="w-16 h-16 text-gray-100 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-slate-500 font-black text-xl">No notices found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredNotices.map((notice) => (
            <div key={notice._id} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-slate-700 hover:border-teal-500/30 transition-all group relative overflow-hidden">
              {/* Category Ribbon */}
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${getCategoryStyles(notice.category)}`}>
                {getCategoryIcon(notice.category)}
                {notice.category}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-slate-500 mb-3">
                  <Calendar className="w-3 h-3" />
                  {new Date(notice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span className="mx-2">•</span>
                  <Tag className="w-3 h-3" />
                  To: {notice.targetAudience}
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white leading-tight group-hover:text-teal-500 transition-colors">{notice.title}</h2>
              </div>

              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-8 whitespace-pre-wrap line-clamp-4">
                {notice.content}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{notice.postedBy}</span>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => handleOpenModal(notice)}
                      className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(notice._id)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  {editingNotice ? 'Edit Announcement' : 'New Announcement'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Post school-wide updates and information.</p>
              </div>
              <button onClick={handleCloseModal} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Notice Title *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Annual Sports Meet 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Target Audience</label>
                <select 
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
                >
                  {audiences.map(aud => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Notice Content *</label>
                <textarea 
                  required rows="5"
                  placeholder="Type the detailed announcement here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-6">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="flex-1 px-8 py-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-[20px] font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex-[2] px-8 py-5 bg-teal-500 hover:bg-teal-600 text-white rounded-[20px] font-black text-sm shadow-2xl shadow-teal-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <Megaphone className="w-5 h-5" />
                  {submitting ? 'Publishing...' : (editingNotice ? 'Update Announcement' : 'Publish Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

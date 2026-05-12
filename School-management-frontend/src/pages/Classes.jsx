import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  BookOpen, Plus, Trash2, Edit, Search, Users, 
  DoorOpen, UserCheck, X, Save, RefreshCw, MoreVertical,
  ChevronRight
} from 'lucide-react';

export default function Classes() {
  const { user: currentUser } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    roomNumber: '',
    teacher: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        API.get('/classes'),
        API.get('/teachers')
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load classes and teachers data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        section: cls.section,
        roomNumber: cls.roomNumber || '',
        teacher: cls.teacher?._id || cls.teacher || ''
      });
    } else {
      setEditingClass(null);
      setFormData({ name: '', section: '', roomNumber: '', teacher: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ name: '', section: '', roomNumber: '', teacher: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClass) {
        await API.put(`/classes/${editingClass._id}`, formData);
      } else {
        await API.post('/classes', formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await API.delete(`/classes/${id}`);
      setClasses(classes.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.teacher?.name && c.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-500" />
            Class Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Manage school classes, sections, and teacher assignments.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl flex items-center shadow-lg shadow-teal-500/20 transition-all font-bold active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Class
          </button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Classes</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{classes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Active Sections</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">
                {new Set(classes.map(c => c.section)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Teachers Assigned</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">
                {classes.filter(c => c.teacher).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by class, section or teacher..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
            />
          </div>
          <button onClick={fetchData} className="p-3 text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50/30 dark:bg-slate-800/30">
                <th className="px-8 py-4">Class & Section</th>
                <th className="px-8 py-4">Class Teacher</th>
                <th className="px-8 py-4">Room Number</th>
                <th className="px-8 py-4">Students</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-500" /></td></tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <DoorOpen className="w-16 h-16 text-gray-100 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-gray-400 dark:text-slate-500 font-bold">No classes found.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((cls) => (
                  <tr key={cls._id} className="group hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-lg">
                          {cls.name.match(/\d+/) || cls.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-white uppercase">{cls.name}</p>
                          <p className="text-xs font-bold text-gray-400 dark:text-slate-500">Section {cls.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-gray-600 dark:text-slate-300">
                      {cls.teacher ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-teal-500" />
                          {cls.teacher.name || cls.teacher}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-600 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-slate-400">
                      {cls.roomNumber || 'TBD'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-full text-xs font-black">
                        {cls.studentsCount || 0} Students
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => handleOpenModal(cls)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cls._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      <MoreVertical className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:hidden ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/30">
            <p className="text-sm font-bold text-gray-400 dark:text-slate-500">
              Showing <span className="text-gray-800 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="text-gray-800 dark:text-white">{Math.min(indexOfLastItem, filteredClasses.length)}</span> of <span className="text-gray-800 dark:text-white">{filteredClasses.length}</span> classes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                      : 'text-gray-400 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Fill in the details below to save the class.</p>
              </div>
              <button onClick={handleCloseModal} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Class Name *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Class 10"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Section *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. A"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Room Number</label>
                <input 
                  type="text"
                  placeholder="e.g. 204B"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Assign Class Teacher</label>
                <select 
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
                >
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex-[2] px-6 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {submitting ? 'Saving...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

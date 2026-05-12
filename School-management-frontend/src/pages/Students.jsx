import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit, Search, Eye } from 'lucide-react';

export default function Students() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      setDeleteMsg('');
      await API.delete(`/students/${deleteTarget._id}`);
      setStudents(prev => prev.filter(s => s._id !== deleteTarget._id));
      setDeleteMsg('Student deleted successfully!');
      setTimeout(() => {
        setDeleteTarget(null);
        setDeleting(false);
        setDeleteMsg('');
      }, 1000);
    } catch (error) {
      console.error('Failed to delete student', error);
      const msg = error.response?.data?.message || 'Failed to delete. Check permissions.';
      setDeleteMsg(`Error: ${msg}`);
      setDeleting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">Students</h1>
          <p className="text-gray-500 dark:text-slate-400 text-[15px] mt-1 transition-colors duration-300">Manage student enrollments and records.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
          <Link 
            to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/students/add`}
            className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Student
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50 transition-colors duration-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name & Parent</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Roll No & Class</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No students found.</td></tr>
            ) : filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-teal-50/30 dark:hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#fff4ed] dark:bg-[#ff8a4c]/20 flex items-center justify-center text-[#ff8a4c] font-bold mr-4">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <Link 
                        to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/students/${student._id}`}
                        className="text-sm font-bold text-gray-800 dark:text-white hover:text-teal-600 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{student.parentName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{student.rollNumber}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 bg-gray-100 dark:bg-slate-700 inline-block px-2 py-0.5 rounded-md">{student.className}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700 dark:text-slate-300">{student.contact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => {
                      const prefix = (user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`;
                      navigate(`${prefix}/students/${student._id}`);
                    }}
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 mr-3 p-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md inline-block transition-colors duration-300"
                    title="View Profile"
                  >
                    <Eye className="w-4 h-4"/>
                  </button>
                  <button 
                    onClick={() => {
                      const prefix = (user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`;
                      navigate(`${prefix}/students/edit/${student._id}`);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md inline-block transition-colors duration-300"
                    title="Edit Student"
                  >
                    <Edit className="w-4 h-4"/>
                  </button>
                  <button 
                    onClick={() => { setDeleteTarget(student); setDeleteMsg(''); }}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors duration-300"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Student?</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong className="text-gray-700 dark:text-white">{deleteTarget.name}</strong>? This action cannot be undone.
              </p>

              {deleteMsg && (
                <div className={`w-full p-3 rounded-lg mb-4 text-sm font-medium ${
                  deleteMsg.startsWith('Error') 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                }`}>
                  {deleteMsg}
                </div>
              )}

              <div className="flex items-center space-x-3 w-full">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleting(false); setDeleteMsg(''); }}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

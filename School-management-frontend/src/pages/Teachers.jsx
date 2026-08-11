import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import { Plus, Trash2, Edit, Search, Eye, ChevronRight } from 'lucide-react';

export default function Teachers() {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTeachers();
  }, []);

  useSchoolRefresh(fetchTeachers);

  const fetchTeachers = async () => {
    try {
      const res = await API.get('/teachers');
      setTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const deleteTeacher = async (id) => {
    if(window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await API.delete(`/teachers/${id}`);
        fetchTeachers();
      } catch (error) {
        console.error('Failed to delete teacher', error);
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">Teachers</h1>
          <p className="text-gray-500 dark:text-slate-400 text-[15px] mt-1 transition-colors duration-300">Manage teaching staff details and records.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter teachers..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
          <Link 
            to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/teachers/add`}
            className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Teacher
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50 transition-colors duration-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Teacher Profile</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
            {currentItems.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No teachers found.</td></tr>
            ) : currentItems.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-teal-50/30 dark:hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#f0f4ff] dark:bg-[#4361ee]/20 flex items-center justify-center text-[#4361ee] font-bold mr-4">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-white">{teacher.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{teacher.employeeId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 inline-block px-2 py-0.5 rounded-md">{teacher.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700 dark:text-slate-300">{teacher.contact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/teachers/${teacher._id}`} className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 mr-3 p-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md inline-block transition-colors duration-300"><Eye className="w-4 h-4"/></Link>
                  <Link to={`${(user.role === 'super-admin' || user.role === 'admin') ? '/admin' : `/${user.role}`}/teachers/edit/${teacher._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md inline-block transition-colors duration-300"><Edit className="w-4 h-4"/></Link>
                  <button onClick={() => deleteTeacher(teacher._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors duration-300"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/30">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-700 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-700 dark:text-white">{Math.min(indexOfLastItem, filteredTeachers.length)}</span> of <span className="font-semibold text-gray-700 dark:text-white">{filteredTeachers.length}</span> teachers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 text-teal-500" />
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
                <ChevronRight className="w-4 h-4 text-teal-500" />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import { ChevronDown, Filter, Settings, List, Grid, MoreVertical, ExternalLink, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Plus, UserX } from 'lucide-react';

export default function Students() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const routePrefix = (user?.role === 'super-admin' || user?.role === 'admin') ? '/admin' : `/${user?.role || 'admin'}`;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/students');
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) {
        const dummy = getDummyStudents();
        setStudents(dummy);
        setFilteredStudents(dummy);
      } else {
        setStudents(data);
        setFilteredStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
      const dummy = getDummyStudents();
      setStudents(dummy);
      setFilteredStudents(dummy);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Re-fetch when active school changes
  useSchoolRefresh(fetchStudents);


  // Safe filter effect
  useEffect(() => {
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      setFilteredStudents(students.filter(s => {
        const name = s?.name ? String(s.name).toLowerCase() : '';
        const roll = s?.rollNumber ? String(s.rollNumber).toLowerCase() : '';
        const className = s?.className ? String(s.className).toLowerCase() : '';
        return name.includes(q) || roll.includes(q) || className.includes(q);
      }));
    } else {
      setFilteredStudents(students);
    }
    setCurrentPage(1);
  }, [searchQuery, students]);

  // Safe pagination calculation
  const safeFilteredList = Array.isArray(filteredStudents) ? filteredStudents : [];
  const totalPages = Math.max(1, Math.ceil(safeFilteredList.length / itemsPerPage));
  const currentStudents = safeFilteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name || 'this student'}?`)) return;
    try {
      await API.delete(`/students/${id}`);
      alert('Student deleted successfully');
      fetchStudents(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to delete student');
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to={`${routePrefix}/dashboard`} className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Students</span>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Students</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage and view student records</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="text" 
              placeholder="Search Name / Roll No" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded shadow-sm text-sm focus:outline-none focus:border-teal-500 w-full md:w-auto"
            />
            <button className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded shadow-sm text-sm font-semibold text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
              More <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-sm text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-sm text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-sm overflow-hidden hidden md:flex">
              <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border-l border-gray-200 dark:border-slate-600">
                <Grid className="w-4 h-4" />
              </button>
            </div>
            
            {(user?.role === 'admin' || user?.role === 'super-admin') && (
              <Link 
                to={`${routePrefix}/students/add`}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm text-sm font-semibold transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Student
              </Link>
            )}
          </div>
        </div>

        {/* Loading Skeleton or Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 animate-pulse flex">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 mr-4"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : safeFilteredList.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center border border-gray-200 dark:border-slate-700 mb-6">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200">No Students Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Try adjusting your search criteria or add a new student.</p>
          </div>
        ) : (
          /* Student Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {currentStudents.map((student, idx) => {
              const studentName = student?.name || 'Unnamed Student';
              const initial = studentName.charAt(0).toUpperCase();

              return (
                <div key={student?._id || idx} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 flex relative">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    {student?.avatar ? (
                      <img src={student.avatar} alt={studentName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${getAvatarColor(idx)}`}>
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <Link 
                        to={`${routePrefix}/students/${student?._id || ''}`}
                        className="text-sm font-bold text-gray-800 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 truncate flex items-center pr-2"
                      >
                        <span className="truncate">{studentName}</span> {student?.rollNumber && <span className="ml-1 text-xs text-gray-500 dark:text-slate-400">({student.rollNumber})</span>}
                        <ExternalLink className="w-3 h-3 ml-1 text-gray-400 flex-shrink-0" />
                      </Link>
                      
                      {(user?.role === 'admin' || user?.role === 'super-admin') && (
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === student?._id ? null : student?._id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenuId === student?._id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg border border-gray-200 dark:border-slate-600 z-50 py-1">
                              <Link 
                                to={`${routePrefix}/students/edit/${student?._id}`}
                                className="block px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                              >
                                Edit
                              </Link>
                              <button 
                                onClick={() => {
                                  handleDelete(student?._id, studentName);
                                  setActiveMenuId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">{student?.className || 'N/A'} {student?.section || ''}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">{student?.parentName || student?.guardians?.[0]?.name || 'Parent: N/A'}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{student?.contact || 'No contact'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {safeFilteredList.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, safeFilteredList.length)} to {Math.min(currentPage * itemsPerPage, safeFilteredList.length)} of {safeFilteredList.length} results
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1 border border-transparent rounded bg-slate-800 text-white text-xs font-medium">
                {currentPage}
              </button>
              {currentPage < totalPages && (
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  {currentPage + 1}
                </button>
              )}
              <span className="px-2 text-gray-400">/ {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Scroll Buttons */}
        <div className="flex justify-center -mb-10 mt-4 relative z-10">
          <div className="flex space-x-2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="w-8 h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helpers for UI
function getAvatarColor(index) {
  const colors = [
    'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
    'bg-rose-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  return colors[index % colors.length];
}

function getDummyStudents() {
  return [
    { _id: '1', name: 'Aaina Rohan Choudhary', rollNumber: 'SM158', className: 'VI', section: 'Section A', parentName: 'Dhanuk Choudhary', contact: '7032145694', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=fde047' },
    { _id: '2', name: 'Aarav Kumar Sharma', rollNumber: 'SM063', className: 'Class 10', section: 'Section A', parentName: 'Rajesh Kumar', contact: '9876543210' },
    { _id: '3', name: 'Aarav Sharma', rollNumber: 'SM058', className: 'UKG', section: 'Section A', parentName: 'Rajesh Sharma', contact: '9876543210' },
    { _id: '4', name: 'Aarna Inaaya Contractor', rollNumber: 'SM212', className: 'XI', section: 'Section A', parentName: 'Bhamini Contractor', contact: '7032145682' },
    { _id: '5', name: 'Aarush Nitara Khalsa', rollNumber: 'SM167', className: 'VII', section: 'Section A', parentName: 'Samar Khalsa', contact: '7032145682' },
    { _id: '6', name: 'Aastha Singh', rollNumber: 'SM243', className: 'LKG', section: 'Section A', parentName: 'Monoj', contact: '09935332556' },
  ];
}

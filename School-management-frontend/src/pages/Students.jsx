import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useSchoolRefresh } from '../hooks/useSchoolRefresh';
import { ChevronDown, Filter, Settings, List, Grid, MoreVertical, ExternalLink, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function Students() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchStudents();
  }, []);

  // Re-fetch when active school changes
  useSchoolRefresh(fetchStudents);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      // Adding some dummy data for layout if API returns empty
      if (res.data.length === 0) {
        const dummy = getDummyStudents();
        setStudents(dummy);
        setFilteredStudents(dummy);
      } else {
        setStudents(res.data);
        setFilteredStudents(res.data);
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

  // Filter effect
  useEffect(() => {
    if (searchQuery) {
      setFilteredStudents(students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
    } else {
      setFilteredStudents(students);
    }
    setCurrentPage(1);
  }, [searchQuery, students]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
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
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Students</span>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Students</h1>
          
          <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0">
            <input 
              type="text" 
              placeholder="Search Name / Roll No" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded shadow-sm text-sm focus:outline-none focus:border-blue-500 w-full md:w-auto"
            />
            <button className="flex items-center bg-white px-4 py-2 border border-gray-200 rounded shadow-sm text-sm font-semibold text-gray-600 hover:bg-gray-50">
              More <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded shadow-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded shadow-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex bg-white border border-gray-200 rounded shadow-sm overflow-hidden hidden md:flex">
              <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-100 text-gray-800 border-l border-gray-200">
                <Grid className="w-4 h-4" />
              </button>
            </div>
            {/* The global 'MoreVertical' can remain a placeholder for now as it's not tied to a single student */}
            <button className="p-2 bg-white border border-gray-200 rounded shadow-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {currentStudents.map((student, idx) => (
            <div key={student._id || idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex">
              <div className="mr-4 mt-1">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${getAvatarColor(idx)}`}>
                    {student.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <Link 
                    to={`/admin/students/${student._id}`}
                    className="text-sm font-bold text-gray-800 hover:text-blue-600 truncate flex items-center"
                  >
                    {student.name} {student.rollNumber && `(${student.rollNumber})`}
                    <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === student._id ? null : student._id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenuId === student._id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <Link 
                          to={`/admin/students/edit/${student._id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => {
                            handleDelete(student._id, student.name);
                            setActiveMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">{student.className} {student.section}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{student.parentName}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{student.contact}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-xs text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} results
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-gray-200 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 border border-transparent rounded bg-slate-800 text-white text-xs font-medium">
              {currentPage}
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded bg-white text-gray-600 text-xs font-medium hover:bg-gray-50">
              {currentPage + 1}
            </button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-3 py-1 border border-gray-200 rounded bg-white text-gray-600 text-xs font-medium hover:bg-gray-50">
              {totalPages}
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-gray-200 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

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
    'bg-yellow-400', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
    'bg-red-400', 'bg-red-500', 'bg-purple-400', 'bg-indigo-500',
    'bg-emerald-500', 'bg-blue-400', 'bg-red-400', 'bg-red-400'
  ];
  return colors[index % colors.length];
}

function getDummyStudents() {
  return [
    { _id: '1', name: 'Aaina Rohan Choudhary', rollNumber: 'SM158', className: 'VI', section: 'Section A', parentName: 'Dhanuk Choudhary', contact: '7032145694', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=fde047' },
    { _id: '2', name: 'Aarav Kumar Sharma', rollNumber: 'SM063', className: 'I', section: 'Section A', parentName: 'Rajesh Kumar', contact: '9876543210' },
    { _id: '3', name: 'Aarav Sharma', rollNumber: 'SM058', className: 'UKG', section: 'Section A', parentName: 'Rajesh Sharma', contact: '9876543210' },
    { _id: '4', name: 'Aarna Inaaya Contractor', rollNumber: 'SM212', className: 'XI', section: 'Section A', parentName: 'Bhamini Contractor', contact: '7032145682' },
    { _id: '5', name: 'Aarush Nitara Khalsa', rollNumber: 'SM167', className: 'VII', section: 'Section A', parentName: 'Samar Khalsa', contact: '7032145682' },
    { _id: '6', name: 'Aastha Singh', rollNumber: 'SM243', className: 'LKG', section: 'Section A', parentName: 'Monoj', contact: '09935332556' },
    { _id: '7', name: 'Adarsh kumar', rollNumber: 'SM259', className: 'V', section: 'Section A', parentName: '', contact: '99999999' },
    { _id: '8', name: 'Adarsh pandey', rollNumber: 'SM258', className: 'VI', section: 'Section A', parentName: '', contact: '888888888' },
    { _id: '9', name: 'Aditi', rollNumber: 'SM043', className: 'V', section: 'Section A', parentName: 'Parvin', contact: '9989766675', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditi&backgroundColor=c0aede' },
    { _id: '10', name: 'Advait Raj Singh', rollNumber: 'SM065', className: 'I', section: 'Section A', parentName: 'Mahesh Sharma', contact: '8054321098' },
    { _id: '11', name: 'Akarsh Samiha Kumer', rollNumber: 'SM163', className: 'VI', section: 'Section A', parentName: 'Alisha Kumer', contact: '7032145678' },
    { _id: '12', name: 'Alia Ishaan Loyal', rollNumber: 'SM127', className: 'III', section: 'Section A', parentName: 'Heer Loyal', contact: '9988776655' },
  ];
}

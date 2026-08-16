import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, XCircle, Search, Upload } from 'lucide-react';
import API from '../../api/axios';

export default function Photo() {
  const [batch, setBatch] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sortBy, setSortBy] = useState('Student Name');
  const [orderBy, setOrderBy] = useState('Ascending');
  const [periodWise, setPeriodWise] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students');
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let result = [...students];
    
    if (batch) {
      result = result.filter(s => s.period === batch || s.className?.includes(batch));
    }
    
    if (studentName) {
      result = result.filter(s => 
        s.name?.toLowerCase().includes(studentName.toLowerCase()) || 
        s.rollNumber?.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      let valA = sortBy === 'Student Name' ? (a.name || '') : (a.rollNumber || '');
      let valB = sortBy === 'Student Name' ? (b.name || '') : (b.rollNumber || '');
      
      if (orderBy === 'Ascending') {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    });

    setFilteredStudents(result);
  };

  const handlePhotoUpload = async (studentId, file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploadingId(studentId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await API.put(`/students/${studentId}`, { avatar: base64String });
        setFilteredStudents(prev => prev.map(s => s._id === studentId ? { ...s, avatar: res.data.avatar } : s));
        setStudents(prev => prev.map(s => s._id === studentId ? { ...s, avatar: res.data.avatar } : s));
      } catch (err) {
        console.error('Failed to upload photo', err);
        alert('Failed to upload photo');
      } finally {
        setUploadingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Photo</span>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Photo Management</h1>

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Batch / Class</label>
              <select 
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-700 dark:text-slate-200"
              >
                <option value="">All Batches</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Name or Roll No</label>
              <input 
                type="text" 
                placeholder="Search..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-700 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-700 dark:text-slate-200"
              >
                <option value="Student Name">Student Name</option>
                <option value="Roll Number">Roll Number</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Order By</label>
              <select 
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-700 dark:text-slate-200"
              >
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={() => { setBatch(''); setStudentName(''); setFilteredStudents(students); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors">
              Reset
            </button>
            <button onClick={handleFilter} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md transition-colors flex items-center">
              <Search className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        {/* Update Photo Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Student Photos</h3>
            <span className="text-xs text-gray-500">{filteredStudents.length} students found</span>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm font-medium border border-red-100">
                  <XCircle className="w-5 h-5 mr-2" />
                  No students found matching your criteria.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Roll No</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Class</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Current Photo</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredStudents.map(student => (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{student.rollNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300 font-semibold">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{student.className} {student.section}</td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-600 bg-white flex items-center justify-center">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <label className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                            uploadingId === student._id 
                              ? 'bg-gray-200 text-gray-500' 
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                          }`}>
                            <Upload className="w-3 h-3 mr-2" />
                            {uploadingId === student._id ? 'Uploading...' : 'Upload New'}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              disabled={uploadingId === student._id}
                              onChange={(e) => handlePhotoUpload(student._id, e.target.files[0])}
                            />
                          </label>
                          <div className="text-[10px] text-gray-400 mt-1 mr-1">Max 2MB</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          Campus Pilot
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, XCircle } from 'lucide-react';

export default function ElectiveSubject() {
  const [batch, setBatch] = useState('');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('');

  // Designing the empty state based on the mockup
  const noRecordFound = true;

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Elective Subject</span>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Elective Subject</h1>

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Batch</label>
              <select 
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500 appearance-none"
              >
                <option value="">Select Batch</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500 appearance-none"
              >
                <option value="">Subject</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Name</label>
              <input 
                type="text" 
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500 appearance-none pr-8"
                >
                  <option value="">Sort By</option>
                  <option value="Student Name">Student Name</option>
                  <option value="Roll Number">Roll Number</option>
                </select>
                <button onClick={() => setSortBy('')} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Order By</label>
              <div className="relative">
                <select 
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500 appearance-none pr-8"
                >
                  <option value="">Order By</option>
                  <option value="Ascending">Ascending</option>
                  <option value="Descending">Descending</option>
                </select>
                <button onClick={() => setOrderBy('')} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors">
              Cancel
            </button>
            <div className="flex rounded-md overflow-hidden">
              <button className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition-colors">
                Filter
              </button>
              <button className="px-2 py-2 bg-slate-800 border-l border-slate-700 hover:bg-slate-900 text-white transition-colors flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Assign Student Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Assign Student</h3>
          </div>

          <div className="p-4">
            {noRecordFound && (
              <div className="bg-red-500 text-white p-3 rounded flex items-center text-sm font-medium">
                <XCircle className="w-4 h-4 mr-2" />
                No record found.
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

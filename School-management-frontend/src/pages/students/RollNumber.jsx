import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, XCircle } from 'lucide-react';

export default function RollNumber() {
  const [batch, setBatch] = useState('');
  const [sortBy, setSortBy] = useState('Student Name');
  const [orderBy, setOrderBy] = useState('Ascending');
  const [listAll, setListAll] = useState(true);
  const [startRollNumber, setStartRollNumber] = useState('1');

  // We are designing the empty state based on the mockup
  const noRecordFound = true;

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Roll Number</span>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Roll Number</h1>

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800 appearance-none pr-8"
                >
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
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800 appearance-none pr-8"
                >
                  <option value="Ascending">Ascending</option>
                  <option value="Descending">Descending</option>
                </select>
                <button onClick={() => setOrderBy('')} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">List all Student</label>
            <div 
              className={`w-12 h-6 flex items-center bg-slate-800 rounded-full p-1 cursor-pointer transition-colors`}
              onClick={() => setListAll(!listAll)}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${listAll ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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

        {/* Update Roll Number Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Update Roll Number</h3>
            <div className="flex items-center space-x-4">
              <input 
                type="text" 
                value={startRollNumber}
                onChange={(e) => setStartRollNumber(e.target.value)}
                className="w-24 px-2 py-1 border-b border-gray-300 dark:border-slate-600 bg-transparent text-sm text-center focus:outline-none focus:border-blue-500"
              />
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-md transition-colors">
                Auto Assign
              </button>
            </div>
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MoreVertical, List } from 'lucide-react';

export default function Attendance() {
  const [method, setMethod] = useState('Batch Wise');
  const [batch, setBatch] = useState('');
  const [dateOfAttendance, setDateOfAttendance] = useState('2026-06-22');
  const [detail, setDetail] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Attendance</span>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <div className="flex space-x-3 items-center">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Migrate Attendance
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-full shadow-sm transition">
              List Student
            </button>
            <button className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm flex items-center justify-center">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Method</label>
              <div className="relative">
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800 appearance-none pr-8"
                >
                  <option value="Batch Wise">Batch Wise</option>
                  <option value="Student Wise">Student Wise</option>
                </select>
                <button onClick={() => setMethod('')} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Batch</label>
              <select 
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500 appearance-none"
              >
                <option value="">Batch</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Date of Attendance</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dateOfAttendance}
                  onChange={(e) => setDateOfAttendance(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Detail</label>
            <div 
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${detail ? 'bg-slate-800' : 'bg-gray-200 border border-gray-300'}`}
              onClick={() => setDetail(!detail)}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${detail ? 'translate-x-6' : ''}`}></div>
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

        {/* Empty State List Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center py-24">
          <div className="text-gray-400 mb-6 flex flex-col items-center">
            <List className="w-20 h-20 mb-4 stroke-[3] text-slate-500" />
            <Link to="#" className="text-slate-500 hover:text-slate-700 text-[15px] font-medium mb-3">
              List all Attendances
            </Link>
            <Link to="#" className="text-slate-400 hover:text-slate-600 text-sm">
              Manage all Attendances
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

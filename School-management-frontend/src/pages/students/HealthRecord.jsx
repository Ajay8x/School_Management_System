import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, XCircle } from 'lucide-react';

export default function HealthRecord() {
  const [date, setDate] = useState('');
  const [batch, setBatch] = useState('');
  const [recordVision, setRecordVision] = useState(false);
  const [recordChest, setRecordChest] = useState(false);
  const [recordDental, setRecordDental] = useState(false);

  // We are designing the empty state based on the mockup
  const noRecordFound = true;
  const batchError = batch === ''; // Show error when empty as per mockup

  return (
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">Health Record</span>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Health Record</h1>

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-blue-500 text-sm text-gray-500"
              />
            </div>
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
              {batchError && <p className="text-red-500 text-xs mt-1">The batch field is required.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Record Vision</label>
              <div 
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${recordVision ? 'bg-slate-800' : 'bg-gray-200 border border-gray-300'}`}
                onClick={() => setRecordVision(!recordVision)}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${recordVision ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Record Chest</label>
              <div 
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${recordChest ? 'bg-slate-800' : 'bg-gray-200 border border-gray-300'}`}
                onClick={() => setRecordChest(!recordChest)}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${recordChest ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Record Dental</label>
              <div 
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${recordDental ? 'bg-slate-800' : 'bg-gray-200 border border-gray-300'}`}
                onClick={() => setRecordDental(!recordDental)}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${recordDental ? 'translate-x-6' : ''}`}></div>
              </div>
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

        {/* Update Health Record Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Update Health Record</h3>
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

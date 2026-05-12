import { useState, useEffect, useContext } from 'react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Hash, Search, Save, RefreshCw, User, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RollNumber() {
  const { user: currentUser } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Track local changes to roll numbers
  const [tempRollNumbers, setTempRollNumbers] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await API.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchStudents = async (className) => {
    if (!className) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await API.get('/students');
      const filtered = res.data.filter(s => s.className === className);
      // Sort by name for logical roll number assignment
      const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(sorted);
      
      // Initialize temp roll numbers
      const rollMap = {};
      sorted.forEach(s => {
        rollMap[s._id] = s.rollNumber || '';
      });
      setTempRollNumbers(rollMap);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const val = e.target.value;
    setSelectedClass(val);
    fetchStudents(val);
  };

  const handleRollChange = (id, val) => {
    setTempRollNumbers(prev => ({ ...prev, [id]: val }));
  };

  const autoGenerateRollNumbers = () => {
    const newRollMap = { ...tempRollNumbers };
    students.forEach((s, index) => {
      // e.g. CLASS-SEC-01
      const prefix = selectedClass.replace(/\s+/g, '-').toUpperCase();
      const num = (index + 1).toString().padStart(2, '0');
      newRollMap[s._id] = `${prefix}-${num}`;
    });
    setTempRollNumbers(newRollMap);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const updates = Object.keys(tempRollNumbers).map(id => ({
        id,
        rollNumber: tempRollNumbers[id]
      }));
      
      await API.post('/students/roll-numbers', { updates });
      setSuccess('Roll numbers updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update roll numbers. Ensure all are unique.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <Hash className="w-8 h-8 text-teal-500" />
            Roll Number Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Bulk assign or update student roll numbers by class.</p>
        </div>
      </div>

      {/* Class Selection Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1">
            <label className="block text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">Select Class *</label>
            <select 
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-gray-700 dark:text-slate-300"
            >
              <option value="">Choose a class...</option>
              {classes.map(c => (
                <option key={c._id} value={c.name}>{c.name} - Section {c.section}</option>
              ))}
            </select>
          </div>
          
          <button 
            disabled={!selectedClass || loading}
            onClick={() => fetchStudents(selectedClass)}
            className="px-8 py-4 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reload List
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      {selectedClass && (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
            <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              Students in {selectedClass}
              <span className="ml-2 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 text-xs rounded-full">{students.length} Total</span>
            </h3>
            
            <button 
              onClick={autoGenerateRollNumbers}
              className="text-xs font-black text-teal-500 hover:text-teal-600 uppercase tracking-widest flex items-center gap-1 group"
            >
              Auto-Generate
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4">Current ID</th>
                  <th className="px-8 py-4">Roll Number Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-white">{student.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{student.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-400">
                      {student._id.substring(0, 8)}...
                    </td>
                    <td className="px-8 py-5">
                      <input 
                        type="text" 
                        value={tempRollNumbers[student._id] || ''}
                        onChange={(e) => handleRollChange(student._id, e.target.value)}
                        placeholder="e.g. R-101"
                        className="w-full max-w-[200px] px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50/30 dark:bg-slate-800/30 border-t border-gray-50 dark:border-slate-700 flex justify-end">
            <button 
              disabled={submitting || students.length === 0}
              onClick={handleSave}
              className="px-10 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Saving Changes...' : 'Save Roll Numbers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

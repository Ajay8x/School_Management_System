import { useState, useEffect, useContext } from 'react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  HeartPulse, Search, Plus, Save, RefreshCw, X, 
  Activity, Thermometer, User, Phone, ShieldAlert,
  ChevronRight, Stethoscope
} from 'lucide-react';

export default function HealthRecord() {
  const { user: currentUser } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    medicalConditions: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, recordsRes] = await Promise.all([
        API.get('/students'),
        API.get('/health-records')
      ]);
      setStudents(studentsRes.data);
      
      // Map records by student ID for easy lookup
      const recordMap = {};
      recordsRes.data.forEach(r => {
        recordMap[r.student._id || r.student] = r;
      });
      setRecords(recordMap);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    const existing = records[student._id];
    if (existing) {
      setFormData({
        bloodGroup: existing.bloodGroup || '',
        height: existing.height || '',
        weight: existing.weight || '',
        allergies: (existing.allergies || []).join(', '),
        medicalConditions: (existing.medicalConditions || []).join(', '),
        emergencyContact: existing.emergencyContact || { name: '', phone: '', relation: '' }
      });
    } else {
      setFormData({
        bloodGroup: '', height: '', weight: '',
        allergies: '', medicalConditions: '',
        emergencyContact: { name: '', phone: '', relation: '' }
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        student: selectedStudent._id,
        ...formData,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medicalConditions: formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
      };
      
      const res = await API.post('/health-records', payload);
      setRecords(prev => ({ ...prev, [selectedStudent._id]: res.data }));
      handleCloseModal();
    } catch (err) {
      alert('Failed to save health record');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[32px] font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-rose-500 animate-pulse" />
            Health Records
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium italic">Monitor and manage student medical information and vitals.</p>
        </div>
        
        <button onClick={fetchData} className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-700 mb-8">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
          />
        </div>
      </div>

      {/* Grid of Student Health Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 animate-spin text-rose-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const record = records[student._id];
            return (
              <div key={student._id} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-xl border border-gray-100 dark:border-slate-700 hover:border-rose-500/30 transition-all group overflow-hidden relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 text-xl font-black">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 dark:text-white uppercase leading-tight">{student.name}</h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500">{student.rollNumber} • {student.className}</p>
                  </div>
                </div>

                {record ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-2xl border border-rose-100/50 dark:border-rose-800/30">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Blood Group</p>
                        <p className="text-sm font-black text-rose-600 dark:text-rose-400">{record.bloodGroup || 'N/A'}</p>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Vitals (H/W)</p>
                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">{record.height || '-'}/{record.weight || '-'}</p>
                      </div>
                    </div>
                    
                    {record.allergies?.length > 0 && (
                      <div className="flex items-start gap-2 text-xs font-bold text-rose-500">
                        <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>Allergies: {record.allergies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-gray-400">No health data available</p>
                  </div>
                )}

                <button 
                  onClick={() => handleOpenModal(student)}
                  className="mt-6 w-full py-3 bg-gray-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-gray-500 dark:text-slate-300 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2"
                >
                  {record ? 'Manage Record' : 'Add Health Data'}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Health Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                  Medical Profile
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1">Updating records for <span className="text-rose-500 font-bold">{selectedStudent?.name}</span></p>
              </div>
              <button onClick={handleCloseModal} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Blood Group</label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-gray-700 dark:text-slate-300"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Height</label>
                  <input 
                    type="text" placeholder="e.g. 150 cm"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Weight</label>
                  <input 
                    type="text" placeholder="e.g. 45 kg"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Allergies (Comma separated)</label>
                <input 
                  type="text" placeholder="e.g. Peanuts, Penicillin, Dust"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Medical Conditions</label>
                <input 
                  type="text" placeholder="e.g. Asthma, Diabetes"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-slate-700">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    type="text" placeholder="Contact Name"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
                    className="px-5 py-3.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                  <input 
                    type="text" placeholder="Phone Number"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                    className="px-5 py-3.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>
            </form>

            <div className="p-10 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex gap-6">
              <button 
                type="button" onClick={handleCloseModal}
                className="flex-1 px-8 py-5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-[20px] font-black text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                Discard
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] px-8 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[20px] font-black text-sm shadow-2xl shadow-rose-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <Stethoscope className="w-5 h-5" />
                {submitting ? 'Updating...' : 'Save Health Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

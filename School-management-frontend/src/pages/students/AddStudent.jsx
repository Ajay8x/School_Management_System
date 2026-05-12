import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2, RotateCcw, ListChecks, KeyRound } from 'lucide-react';

export default function AddStudent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);

  const initialFormData = {
    // Registration
    period: '',
    course: '',
    enrollmentType: '',
    dateOfRegistration: new Date().toISOString().split('T')[0],
    // Student
    studentType: 'New Student',
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    gender: 'Male',
    dateOfBirth: '',
    contact: '',
    email: '',
    // Academic
    rollNumber: '',
    className: '',
    // Personal
    bloodGroup: '',
    religion: '',
    nationality: 'Indian',
    category: '',
    aadharNumber: '',
    address: '',
    // Guardian (kept for backward compat)
    parentName: '',
    // Guardian list
    guardians: [],
    // Login password
    password: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const [newGuardian, setNewGuardian] = useState({
    name: '',
    contact: '',
    relation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate full name
      if (['firstName', 'middleName', 'lastName'].includes(name)) {
        const fn = name === 'firstName' ? value : prev.firstName;
        const mn = name === 'middleName' ? value : prev.middleName;
        const ln = name === 'lastName' ? value : prev.lastName;
        updated.name = [fn, mn, ln].filter(Boolean).join(' ');
      }
      return updated;
    });
  };

  const handleGuardianChange = (e) => {
    setNewGuardian({ ...newGuardian, [e.target.name]: e.target.value });
  };

  const addGuardian = () => {
    if (!newGuardian.name || !newGuardian.contact || !newGuardian.relation) return;
    setFormData(prev => ({
      ...prev,
      guardians: [...prev.guardians, { ...newGuardian }],
      parentName: prev.parentName || newGuardian.name
    }));
    setNewGuardian({ name: '', contact: '', relation: '' });
  };

  const removeGuardian = (index) => {
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setNewGuardian({ name: '', contact: '', relation: '' });
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        setFetching(true);
        try {
          const res = await API.get(`/students/${id}`);
          const data = res.data;
          setFormData({
            ...initialFormData,
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            dateOfRegistration: data.dateOfRegistration ? new Date(data.dateOfRegistration).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            guardians: data.guardians || []
          });
        } catch (err) {
          setError('Failed to fetch student details');
        } finally {
          setFetching(false);
        }
      };
      fetchStudent();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Auto-fill parentName if empty but guardians exist
    const submitData = { ...formData };
    if (!submitData.parentName && submitData.guardians.length > 0) {
      submitData.parentName = submitData.guardians[0].name;
    }
    if (!submitData.name) {
      submitData.name = [submitData.firstName, submitData.middleName, submitData.lastName].filter(Boolean).join(' ');
    }

    try {
      if (id) {
        await API.put(`/students/${id}`, submitData);
        setSuccess('Student updated successfully!');
        setTimeout(() => navigate(`/${user.role}/students`), 1500);
      } else {
        await API.post('/students', submitData);
        setSuccess('Student registered successfully!');
        if (keepAdding) {
          setTimeout(() => {
            resetForm();
          }, 1500);
        } else {
          setTimeout(() => navigate(`/${user.role}/students`), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${id ? 'update' : 'register'} student`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300 text-sm";
  const labelClass = "block text-xs font-bold text-teal-700 dark:text-teal-400 mb-1.5 uppercase tracking-wider";
  const sectionTitleClass = "text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-md inline-block border border-gray-200 dark:border-slate-600";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">
            {id ? 'Edit Student' : 'Add Registration'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-[15px] mt-1 transition-colors duration-300">
            {id ? 'Update student details.' : 'Register a new student into the system.'}
          </p>
        </div>
        <Link 
          to={`/${user.role}/students`}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition font-medium"
        >
          <ListChecks className="w-5 h-5 mr-2" />
          List all Registration
        </Link>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800 transition-colors duration-300 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6 border border-green-200 dark:border-green-800 transition-colors duration-300 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ========== SECTION 1: REGISTRATION ========== */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors duration-300">
            <div className="mb-5">
              <span className={sectionTitleClass}>Registration</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Select Period</label>
                <select name="period" value={formData.period} onChange={handleChange} className={inputClass}>
                  <option value="">Select Period</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Select Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className={inputClass}>
                  <option value="">Select Course</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Select Enrollment Type</label>
                <select name="enrollmentType" value={formData.enrollmentType} onChange={handleChange} className={inputClass}>
                  <option value="">Select Enrollment Type</option>
                  <option value="New">New Admission</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Re-admission">Re-admission</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Registration</label>
                <input 
                  type="date" 
                  name="dateOfRegistration" 
                  value={formData.dateOfRegistration} 
                  onChange={handleChange} 
                  className={inputClass} 
                />
              </div>
            </div>
          </div>

          {/* ========== SECTION 2: STUDENT ========== */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors duration-300">
            <div className="mb-5">
              <span className={sectionTitleClass}>Student</span>
            </div>

            {/* Student Type Toggle */}
            <div className="flex items-center space-x-6 mb-6">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="radio" name="studentType" value="New Student" 
                  checked={formData.studentType === 'New Student'} onChange={handleChange}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mr-2"
                />
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">New Student</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="radio" name="studentType" value="Existing Student" 
                  checked={formData.studentType === 'Existing Student'} onChange={handleChange}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mr-2"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:underline">Existing Student</span>
              </label>
            </div>

            {/* Student Name & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div className="lg:col-span-3">
                <label className={labelClass}>Student Name *</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="First Name" required />
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className={inputClass} placeholder="Middle Name" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Last Name" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <div className="flex items-center space-x-4 pt-2.5">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex items-center cursor-pointer">
                      <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange}
                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mr-1.5" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div>
                <label className={labelClass}>Birth Date</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Number *</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} required className={inputClass} placeholder="Contact Number" />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="student@email.com" />
              </div>
              <div>
                <label className={labelClass}>Roll Number *</label>
                <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className={inputClass} placeholder="e.g. 10A12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Class *</label>
                <select name="className" value={formData.className} onChange={handleChange} required className={inputClass}>
                  <option value="">Select Class</option>
                  {['Nursery', 'LKG', 'UKG', ...Array.from({length: 12}, (_, i) => `Class ${i+1}`)].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Religion</label>
                <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="e.g. Hindu" />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className={labelClass}>Aadhar Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className={inputClass} placeholder="XXXX-XXXX-XXXX" />
              </div>
              <div>
                <label className={labelClass}>Nationality</label>
                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} placeholder="Indian" />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={inputClass} placeholder="Full residential address"></textarea>
            </div>
          </div>

          {/* ========== SECTION: LOGIN ACCOUNT ========== */}
          {!id && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-teal-100 dark:border-teal-900/40 p-6 transition-colors duration-300">
              <div className="mb-5 flex items-center gap-3">
                <span className={sectionTitleClass}>Login Account</span>
                <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full font-medium">
                  Student Portal Access
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Login Password
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Leave blank to use Roll Number as password"
                    autoComplete="new-password"
                  />
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">
                    💡 Default password = Roll Number (e.g. <strong>{formData.rollNumber || '10A12'}</strong>). Student can login at <strong>/login</strong> using their roll number.
                  </p>
                </div>
                <div className="flex items-start pt-6">
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-sm text-teal-700 dark:text-teal-300">
                    <p className="font-semibold mb-1">🎓 Student Login Info</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">
                      A login account will be created automatically. The student can sign in at the <strong>Student Login</strong> tab using:<br/>
                      <span className="font-bold">Roll No:</span> {formData.rollNumber || '(roll number)'}<br/>
                      <span className="font-bold">Password:</span> {formData.password || formData.rollNumber || '(roll number)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== SECTION 3: GUARDIAN ========== */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors duration-300">
            <div className="mb-5">
              <span className={sectionTitleClass}>Guardian</span>
            </div>

            {/* Existing Guardians List */}
            {formData.guardians.length > 0 && (
              <div className="mb-5 space-y-3">
                {formData.guardians.map((g, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/40 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Name</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{g.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Contact</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{g.contact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Relation</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{g.relation}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeGuardian(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Guardian Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              <div>
                <label className={labelClass}>Guardian Name</label>
                <input type="text" name="name" value={newGuardian.name} onChange={handleGuardianChange} className={inputClass} placeholder="Guardian Name" />
              </div>
              <div>
                <label className={labelClass}>Contact Number</label>
                <input type="text" name="contact" value={newGuardian.contact} onChange={handleGuardianChange} className={inputClass} placeholder="Contact Number" />
              </div>
              <div>
                <label className={labelClass}>Relation</label>
                <select name="relation" value={newGuardian.relation} onChange={handleGuardianChange} className={inputClass}>
                  <option value="">Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Grand Father">Grand Father</option>
                  <option value="Grand Mother">Grand Mother</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={addGuardian}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-all">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Guardian
              </button>
            </div>

            {/* If no guardian added, show parentName fallback */}
            {formData.guardians.length === 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
                <label className={labelClass}>Parent/Guardian Name * (Quick Entry)</label>
                <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} 
                  required={formData.guardians.length === 0}
                  className={inputClass} placeholder="Enter parent or guardian name" />
              </div>
            )}
          </div>

          {/* ========== FOOTER ACTIONS ========== */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button type="button" onClick={resetForm}
                  className="flex items-center px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                {!id && (
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={keepAdding} onChange={(e) => setKeepAdding(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Keep Adding</span>
                  </label>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white px-8 py-2.5 rounded-lg flex items-center shadow-md transition font-semibold text-sm">
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : (id ? 'Update Student' : 'Save')}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

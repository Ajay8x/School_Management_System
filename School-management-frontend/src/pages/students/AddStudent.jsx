import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Save, Plus, Trash2, RotateCcw, ListChecks } from 'lucide-react';

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
    className: '',
    applicationNumber: '',
    enrollmentType: '',
    dateOfRegistration: new Date().toISOString().split('T')[0],
    // Student
    studentType: 'New Student',
    firstName: '',
    lastName: '',
    name: '',
    gender: '',
    dateOfBirth: '',
    contact: '',
    email: '',
    previousInstitute: '',
    // Guardian List
    guardians: [],
    guardianType: 'New Guardian'
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
      if (['firstName', 'lastName'].includes(name)) {
        const fn = name === 'firstName' ? value : prev.firstName;
        const ln = name === 'lastName' ? value : prev.lastName;
        updated.name = [fn, ln].filter(Boolean).join(' ');
      }
      return updated;
    });
  };

  const handleGuardianChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedGuardians = [...prev.guardians];
      updatedGuardians[index] = { ...updatedGuardians[index], [name]: value };
      return { ...prev, guardians: updatedGuardians };
    });
  };

  const handleNewGuardianChange = (e) => {
    setNewGuardian({ ...newGuardian, [e.target.name]: e.target.value });
  };

  const addGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [...prev.guardians, { name: '', contact: '', relation: '' }]
    }));
  };

  const removeGuardian = (index) => {
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError('');
    setSuccess('');
  };

  // Ensure there's always at least one guardian field visible
  useEffect(() => {
    if (formData.guardians.length === 0) {
      addGuardian();
    }
  }, [formData.guardians.length]);

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
            guardians: data.guardians && data.guardians.length > 0 ? data.guardians : [{ name: '', contact: '', relation: '' }]
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

    const submitData = { ...formData };
    if (!submitData.name) {
      submitData.name = [submitData.firstName, submitData.lastName].filter(Boolean).join(' ');
    }

    try {
      const targetRoute = `/${user.role === 'super-admin' || user.role === 'admin' ? 'admin' : user.role}/students`;
      if (id) {
        await API.put(`/students/${id}`, submitData);
        setSuccess('Student updated successfully!');
        setTimeout(() => navigate(targetRoute), 1500);
      } else {
        const result = await API.post('/students', submitData);
        setSuccess(`Student registered successfully! Serial Number (Password): ${result.data.serialNumber}`);
        if (keepAdding) {
          setTimeout(() => {
            resetForm();
          }, 1500);
        } else {
          setTimeout(() => navigate(targetRoute), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to ${id ? 'update' : 'register'} student`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-transparent text-gray-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition-colors duration-300 text-sm";
  const labelClass = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";
  const fieldsetClass = "border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6 relative mt-4";
  const legendClass = "text-xs font-semibold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 absolute -top-2.5 left-4";

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {id ? 'Edit Registration' : 'Add Registration'}
          </h1>
          <Link 
            to={`/${user.role === 'super-admin' || user.role === 'admin' ? 'admin' : user.role}/students`}
            className="bg-slate-800 hover:bg-slate-900 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center text-xs font-medium transition"
          >
            List all Registration
          </Link>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 border border-green-200 text-sm font-medium">
            ✓ {success}
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            
            {/* ========== SECTION 1: REGISTRATION ========== */}
            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>Registration</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 pt-2">
                <div>
                  <label className={labelClass}>Select Period</label>
                  <select name="period" value={formData.period} onChange={handleChange} className={inputClass}>
                    <option value="">Select Period</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Select Course</label>
                  <select name="course" value={formData.course} onChange={handleChange} className={inputClass}>
                    <option value="">Select Course</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Class / Grade *</label>
                  <select name="className" value={formData.className} onChange={handleChange} className={inputClass} required>
                    <option value="">Select Class</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Application Number</label>
                  <input type="text" name="applicationNumber" value={formData.applicationNumber} onChange={handleChange} className={inputClass} placeholder="Application Number" />
                </div>
                <div>
                  <label className={labelClass}>Select Enrollment Type</label>
                  <select name="enrollmentType" value={formData.enrollmentType} onChange={handleChange} className={inputClass}>
                    <option value="">Select Enrollment Type</option>
                    <option value="New">New Admission</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Registration</label>
                  <input type="date" name="dateOfRegistration" value={formData.dateOfRegistration} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </fieldset>

            {/* ========== SECTION 2: STUDENT ========== */}
            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>Student</legend>
              
              <div className="flex items-center space-x-6 mb-6 pt-2">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="studentType" value="New Student" checked={formData.studentType === 'New Student'} onChange={handleChange} className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 mr-2" />
                  <span className="text-xs text-gray-700 dark:text-slate-300">New Student</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="studentType" value="Existing Student" checked={formData.studentType === 'Existing Student'} onChange={handleChange} className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 mr-2" />
                  <span className="text-xs text-gray-700 dark:text-slate-300">Existing Student</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <div>
                  <label className={labelClass}>Student Name</label>
                  <div className="flex space-x-4">
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="First Name" />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Last Name" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <div className="flex items-center space-x-6 mt-3">
                    {['Male', 'Female', 'Other'].map(g => (
                      <label key={g} className="flex items-center cursor-pointer">
                        <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 mr-2" />
                        <span className="text-xs text-gray-700 dark:text-slate-300">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div>
                  <label className={labelClass}>Birth Date</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input type="text" name="contact" value={formData.contact} onChange={handleChange} className={inputClass} placeholder="Contact Number" />
                </div>
                <div>
                  <label className={labelClass}>Previous Institute</label>
                  <input type="text" name="previousInstitute" value={formData.previousInstitute} onChange={handleChange} className={inputClass} placeholder="Previous Institute" />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="Student Email" required />
                </div>
              </div>
            </fieldset>

            {/* ========== SECTION 3: GUARDIAN ========== */}
            <fieldset className={fieldsetClass}>
              <legend className={legendClass}>Guardian</legend>

              <div className="flex items-center space-x-6 mb-6 pt-2">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="guardianType" value="New Guardian" checked={formData.guardianType === 'New Guardian'} onChange={handleChange} className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 mr-2" />
                  <span className="text-xs text-gray-700 dark:text-slate-300">New Guardian</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="guardianType" value="Existing Guardian" checked={formData.guardianType === 'Existing Guardian'} onChange={handleChange} className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 mr-2" />
                  <span className="text-xs text-gray-700 dark:text-slate-300">Existing Guardian</span>
                </label>
              </div>

              {formData.guardians.map((g, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
                  <div>
                    <label className={labelClass}>Guardian Name</label>
                    <input type="text" name="name" value={g.name} onChange={(e) => handleGuardianChange(e, index)} className={inputClass} placeholder="Guardian Name" />
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Contact Number</label>
                    {formData.guardians.length > 1 && (
                      <button type="button" onClick={() => removeGuardian(index)} className="absolute -left-5 top-8 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <input type="text" name="contact" value={g.contact} onChange={(e) => handleGuardianChange(e, index)} className={inputClass} placeholder="Contact Number" />
                  </div>
                  <div>
                    <label className={labelClass}>Relation</label>
                    <select name="relation" value={g.relation} onChange={(e) => handleGuardianChange(e, index)} className={inputClass}>
                      <option value="">Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button type="button" onClick={addGuardian} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-md flex items-center text-xs font-medium transition-all">
                  Add Guardian
                </button>
              </div>
            </fieldset>

            {/* ========== FOOTER ACTIONS ========== */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-6">
                <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-xs font-medium transition-all">
                  Reset
                </button>
                {!id && (
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={keepAdding} onChange={(e) => setKeepAdding(e.target.checked)} className="w-3.5 h-3.5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2" />
                    <span className="text-xs text-gray-700 dark:text-slate-300">Keep Adding</span>
                  </label>
                )}
              </div>
              <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2 rounded-md shadow-sm transition text-xs font-medium">
                {loading ? 'Saving...' : (id ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

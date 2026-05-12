import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddTeacher() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    subject: '',
    contact: '',
    salary: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (id) {
      const fetchTeacher = async () => {
        setFetching(true);
        try {
          const res = await API.get(`/teachers/${id}`);
          setFormData({
            name: res.data.name,
            employeeId: res.data.employeeId,
            subject: res.data.subject,
            contact: res.data.contact,
            salary: res.data.salary
          });
        } catch (err) {
          setError('Failed to fetch teacher details');
        } finally {
          setFetching(false);
        }
      };
      fetchTeacher();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await API.put(`/teachers/${id}`, formData);
      } else {
        await API.post('/teachers', formData);
      }
      navigate(`/${user.role}/teachers`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-gray-800 dark:text-white tracking-tight transition-colors duration-300">
            {id ? 'Edit Teacher' : 'Add New Teacher'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-[15px] mt-1 transition-colors duration-300">
            {id ? 'Update teacher profile details.' : 'Register a new teaching staff member.'}
          </p>
        </div>
        <Link 
          to={`/${user.role}/teachers`}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-lg flex items-center transition font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to List
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800 transition-colors duration-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-[15px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 p-6 transition-colors duration-300">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Employee ID *</label>
              <input 
                type="text" 
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
                placeholder="e.g. EMP1001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Subject Specialization *</label>
              <select 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physical Education">Physical Education</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Contact Number *</label>
              <input 
                type="text" 
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
                placeholder="e.g. +1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Monthly Salary ($) *</label>
              <input 
                type="number" 
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
                placeholder="e.g. 5000"
              />
            </div>
            
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end transition-colors duration-300">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white px-8 py-2.5 rounded-lg flex items-center shadow-md transition font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : (id ? 'Update Teacher' : 'Save Teacher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

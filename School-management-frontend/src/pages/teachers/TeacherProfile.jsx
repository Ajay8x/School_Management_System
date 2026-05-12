import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Briefcase, DollarSign, BadgeCheck } from 'lucide-react';

export default function TeacherProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await API.get(`/teachers/${id}`);
        setTeacher(res.data);
      } catch (err) {
        setError('Failed to load teacher details');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  if (error || !teacher) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
      {error || 'Teacher not found'}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          to={`/${user.role}/teachers`}
          className="flex items-center text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Teachers
        </Link>
        <Link 
          to={`/${user.role}/teachers/edit/${id}`}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg flex items-center shadow-md transition font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[24px] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Top Banner Area */}
        <div className="h-32 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        
        <div className="px-8 pb-10">
          {/* Profile Photo/Initial */}
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-teal-50 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 text-4xl font-black">
                {teacher.name.charAt(0)}
              </div>
            </div>
            <div className="absolute bottom-2 left-24 bg-green-500 border-4 border-white dark:border-slate-800 w-6 h-6 rounded-full"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                {teacher.name}
                <BadgeCheck className="w-6 h-6 text-blue-500" />
              </h1>
              <p className="text-gray-500 dark:text-slate-400 font-medium text-lg mt-1">{teacher.subject} Specialist</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {teacher.employeeId}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-gray-100 dark:border-slate-700">
            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Contact Information</h3>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Official Email</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{teacher.employeeId.toLowerCase()}@campuspilot.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Mobile Number</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{teacher.contact}</p>
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Employment Details</h3>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Join Date</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{new Date(teacher.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Monthly Salary</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">₹{teacher.salary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

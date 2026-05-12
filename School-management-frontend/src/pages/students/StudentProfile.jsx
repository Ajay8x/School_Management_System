import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, 
  User, GraduationCap, Calendar, Shield, CreditCard, 
  BookOpen, Clock, FileBadge
} from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Basic');

  const menuItems = [
    { id: 'Basic', label: 'Basic', icon: User },
    { id: 'Contact', label: 'Contact', icon: Phone },
    { id: 'User Login', label: 'User Login', icon: Shield },
    { id: 'Guardian', label: 'Guardian', icon: User },
    { id: 'Sibling', label: 'Sibling', icon: GraduationCap },
    { id: 'Record', label: 'Record', icon: BookOpen },
    { id: 'Fee', label: 'Fee', icon: CreditCard },
    { id: 'Fee Refund', label: 'Fee Refund', icon: CreditCard },
    { id: 'Attendance', label: 'Attendance', icon: Clock },
    { id: 'Exam Report', label: 'Exam Report', icon: FileBadge },
    { id: 'Subject', label: 'Subject', icon: BookOpen },
    { id: 'Dialogue', label: 'Dialogue', icon: Mail },
    { id: 'Document', label: 'Document', icon: FileBadge },
    { id: 'Qualification', label: 'Qualification', icon: GraduationCap },
    { id: 'Account', label: 'Account', icon: CreditCard },
  ];

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/students/${id}`);
      setStudent(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch student details', err);
      setError('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteMessage('');
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      setDeleteMessage('');
      await API.delete(`/students/${id}`);
      setDeleteMessage('Student deleted successfully!');
      setTimeout(() => {
        navigate(`/${user.role}/students`);
      }, 1000);
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.message || err.message || 'Server error occurred';
      setDeleteMessage(`Error: ${msg}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <p className="text-red-500 font-medium mb-4">{error || 'Student not found'}</p>
        <Link 
          to={`/${user.role}/students`}
          className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/${user.role}/students`)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-sm border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Student Profile</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Detailed information for {student.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/${user.role}/students/edit/${student._id}`}
            className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              deleting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Student
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4">
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden sticky top-8">
            <div className="p-6 border-b border-gray-50 dark:border-slate-700 text-center">
              <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 mx-auto flex items-center justify-center text-teal-600 dark:text-teal-400 text-2xl font-bold mb-3">
                {student.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white truncate">{student.name}</h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">Roll: {student.rollNumber}</p>
            </div>
            <nav className="py-2 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/10 border-r-4 border-teal-500' 
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-teal-500' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[600px] flex flex-col transition-all duration-300">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{activeTab} Details</h3>
              <div className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Student ID: {student._id.slice(-6)}</div>
            </div>

            <div className="p-8">
              {activeTab === 'Basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <DetailItem label="Full Name" value={student.name} />
                  <DetailItem label="Roll Number" value={student.rollNumber} />
                  <DetailItem label="Class" value={student.className} />
                  <DetailItem label="Registration Number" value={`REG-${student.rollNumber}`} />
                  <DetailItem label="Student Type" value={student.studentType || 'New Student'} />
                  <DetailItem label="Enrollment Type" value={student.enrollmentType || 'New'} />
                  <DetailItem label="Gender" value={student.gender || 'Not Specified'} />
                  <DetailItem label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
                  <DetailItem label="Blood Group" value={student.bloodGroup || 'N/A'} />
                  <DetailItem label="Religion" value={student.religion || 'N/A'} />
                  <DetailItem label="Nationality" value={student.nationality || 'Indian'} />
                  <DetailItem label="Category" value={student.category || 'N/A'} />
                  <DetailItem label="Aadhar No" value={student.aadharNumber || 'N/A'} />
                  <DetailItem label="Course" value={student.course || 'N/A'} />
                  <DetailItem label="Period" value={student.period || 'N/A'} />
                  <DetailItem label="Date of Registration" value={student.dateOfRegistration ? new Date(student.dateOfRegistration).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
                </div>
              )}

              {activeTab === 'Contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem label="Mobile Number" value={student.contact} icon={Phone} />
                  <DetailItem label="Email Address" value={student.email || 'Not Provided'} icon={Mail} />
                  <DetailItem label="Permanent Address" value={student.address || 'Not Provided'} icon={MapPin} />
                  <DetailItem label="Emergency Contact" value={student.contact} icon={Phone} />
                </div>
              )}

              {activeTab === 'Guardian' && (
                <div>
                  {student.guardians && student.guardians.length > 0 ? (
                    <div className="space-y-6">
                      {student.guardians.map((g, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-gray-50/50 dark:bg-slate-700/20 rounded-2xl border border-gray-100 dark:border-slate-700">
                          <DetailItem label={`${g.relation || 'Guardian'} Name`} value={g.name} />
                          <DetailItem label="Contact Number" value={g.contact} icon={Phone} />
                          <DetailItem label="Relation" value={g.relation} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <DetailItem label="Parent/Guardian Name" value={student.parentName} />
                      <DetailItem label="Contact Number" value={student.contact} />
                      <DetailItem label="Relation" value="Parent" />
                    </div>
                  )}
                </div>
              )}

              {!['Basic', 'Contact', 'Guardian'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-300 dark:text-slate-600 mb-4">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{activeTab} section is empty</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">There are currently no records available in this section for {student.name}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100 dark:border-slate-700 animate-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Delete Student?</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong className="text-gray-700 dark:text-white">{student.name}</strong>? This action cannot be undone.
              </p>

              {deleteMessage && (
                <div className={`w-full p-3 rounded-lg mb-4 text-sm font-medium ${
                  deleteMessage.startsWith('Error') 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                }`}>
                  {deleteMessage}
                </div>
              )}

              <div className="flex items-center space-x-3 w-full">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleting(false); }}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for Details
function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-700/30 border border-gray-100/50 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-900 transition-colors">
      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
        {Icon && <Icon className="w-3 h-3 mr-1.5" />} {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{value || 'N/A'}</p>
    </div>
  );
}


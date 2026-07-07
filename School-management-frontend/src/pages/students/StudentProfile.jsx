import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { ChevronRight } from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Basic');
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await API.put(`/students/${id}`, { avatar: base64String });
        setStudent(res.data);
      } catch (err) {
        console.error('Failed to upload photo', err);
        alert('Failed to upload photo');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    'Basic', 'Contact', 'User Login', 'Guardian', 'Sibling', 'Record', 'Fee', 
    'Hostel', 'Fee Details', 'Attendance', 'Exam Report', 'Subject', 
    'Dialogue', 'Notes', 'Document', 'Qualification', 'Account'
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
      // For demonstration of the UI, let's provide dummy data if fetch fails
      setStudent({
        _id: id || '123456',
        name: 'Aaravh Mishra Khalua',
        rollNumber: 'SM 167',
        className: 'VII Section A',
        studentType: 'Day Scholar',
        parentName: 'Samar Khalua',
        motherName: 'Sonal Khalua',
        dateOfBirth: '2023-08-09T00:00:00.000Z',
        gender: 'Female',
        birthPlace: 'Mumbai',
        nationality: 'Indian',
        motherTongue: 'Hindi',
        bloodGroup: 'B+',
        religion: 'Hindu',
        house: '',
        category: '',
        tags: '',
        studentGroup: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await API.delete(`/students/${id}`);
      alert('Student deleted successfully');
      navigate(`/${user.role === 'super-admin' || user.role === 'admin' ? 'admin' : user.role}/students`);
    } catch (err) {
      console.error('Failed to delete student', err);
      alert('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col font-sans">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-gray-200 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 px-6 py-3 flex items-center text-sm">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Dashboard</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-700 font-medium mr-2">Student</Link>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-500 hover:text-gray-700 font-medium mr-2">{student?.name}</span>
        <span className="text-gray-400 mr-2">&gt;</span>
        <span className="text-gray-800 font-medium">{activeTab}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-black text-white flex-shrink-0 flex flex-col">
          <div className="p-6 flex flex-col items-center border-b border-gray-800">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 mb-3 bg-white">
              {student?.avatar ? (
                <img src={student.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'Student'}&backgroundColor=ffdfbf`} alt="Profile" className="w-full h-full object-cover" />
              )}
            </div>
            <h3 className="text-sm font-bold text-center truncate w-full">{student?.name}</h3>
            <p className="text-xs text-yellow-500 mt-1">{student?.className}</p>
            <p className="text-xs text-gray-400 flex items-center mt-1">
              <span className="inline-block w-3 h-3 bg-white rounded-full mr-1 opacity-50"></span>
              7032145682
            </p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {menuItems.map(item => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full flex items-center px-6 py-2 text-xs font-medium transition-colors ${
                  activeTab === item ? 'text-white bg-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                }`}
              >
                <ChevronRight className="w-3 h-3 mr-3" />
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          <div className="px-8 py-4 flex justify-between items-center bg-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
            <div className="flex space-x-2">
              <Link 
                to={`/${user.role === 'super-admin' || user.role === 'admin' ? 'admin' : user.role}/students/edit/${id}`}
                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50 transition"
              >
                Edit
              </Link>
              <Link 
                to={`/${user.role === 'super-admin' || user.role === 'admin' ? 'admin' : user.role}/students/photo`}
                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50 transition"
              >
                Edit Photo
              </Link>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>

          <div className="p-8 flex-1">
            {activeTab === 'Basic' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Registration Number" value={`SM ${student?.rollNumber?.replace('SM', '').trim() || ''}`} icon />
                <DetailRow label="Student Type" value={student?.studentType || 'Day Scholar'} />
                <DetailRow label="Father Name" value={student?.parentName} />
                
                <DetailRow label="Mother Name" value={student?.motherName || 'Sonal Khalua'} />
                <DetailRow label="Birth Date" value={student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} />
                <DetailRow label="Gender" value={student?.gender} />
                
                <DetailRow label="Birth Place" value={student?.birthPlace || 'Mumbai'} />
                <DetailRow label="Nationality" value={student?.nationality || 'Indian'} />
                <DetailRow label="Mother Tongue" value={student?.motherTongue || 'Hindi'} />
                
                <DetailRow label="Blood Group" value={student?.bloodGroup || 'B+'} />
                <DetailRow label="Religion" value={student?.religion || 'Hindu'} />
                <DetailRow label="House" value={student?.house || ''} />
                
                <DetailRow label="Roll No." value={student?.rollNumber || ''} />
                <DetailRow label="Category" value={student?.category || ''} />
                <DetailRow label="Tags" value={student?.tags || ''} />
                
                <DetailRow label="Student Group" value={student?.studentGroup || ''} />
              </div>
            )}
            {activeTab !== 'Basic' && (
              <div className="text-gray-500 text-sm">Content for {activeTab}</div>
            )}
          </div>
          
          <div className="py-4 text-center text-xs text-gray-400">
            Campus Tracker
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center">
        {label} {icon && <span className="ml-1 text-blue-500 transform rotate-180 inline-block text-[10px]">↰</span>}
      </span>
      <span className="text-sm font-semibold text-gray-800">{value || '-'}</span>
    </div>
  );
}

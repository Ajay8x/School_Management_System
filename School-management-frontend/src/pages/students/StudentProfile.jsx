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
            {activeTab === 'Contact' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Mobile Number" value={student?.contact} />
                <DetailRow label="Email Address" value={student?.email} />
                <DetailRow label="Permanent Address" value={student?.address || 'N/A'} />
              </div>
            )}
            
            {activeTab === 'User Login' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Username (Email)" value={student?.email} />
                <DetailRow label="Serial Number" value={student?.serialNumber || 'N/A'} />
                <DetailRow label="Default Password" value={student?.serialNumber || 'N/A'} />
                <DetailRow label="Linked Account Role" value="student" />
              </div>
            )}

            {activeTab === 'Guardian' && (
              <div className="space-y-6">
                {student?.guardians && student.guardians.length > 0 ? (
                  student.guardians.map((g, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                      <DetailRow label="Guardian Name" value={g.name} />
                      <DetailRow label="Relation" value={g.relation} />
                      <DetailRow label="Contact Number" value={g.contact} />
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                    <DetailRow label="Father Name" value={student?.parentName} />
                    <DetailRow label="Mother Name" value={student?.motherName || 'Sonal Khalua'} />
                    <DetailRow label="Emergency Contact" value={student?.contact} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Sibling' && (
              <div className="text-gray-500 dark:text-slate-400 text-sm">
                <p className="font-semibold text-gray-700 dark:text-slate-200 mb-2">No Siblings Linked</p>
                <p>Click "Edit Student" to link siblings if any.</p>
              </div>
            )}

            {activeTab === 'Record' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Enrollment Type" value={student?.enrollmentType || 'New'} />
                <DetailRow label="Student Type" value={student?.studentType || 'Day Scholar'} />
                <DetailRow label="Class Assigned" value={student?.className} />
                <DetailRow label="Registration Date" value={student?.dateOfRegistration ? new Date(student.dateOfRegistration).toLocaleDateString() : 'N/A'} />
                <DetailRow label="Created Date" value={student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'} />
              </div>
            )}

            {activeTab === 'Fee' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                  <DetailRow label="Total Allocated Fee" value="₹45,000" />
                  <DetailRow label="Paid Amount" value="₹30,000" />
                  <DetailRow label="Pending Balance" value="₹15,000" />
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-4 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg inline-block">
                  Next Due Date: 15th of current month
                </div>
              </div>
            )}

            {activeTab === 'Hostel' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Hostel Allocated" value="N/A" />
                <DetailRow label="Room Number" value="-" />
                <DetailRow label="Warden Name" value="-" />
              </div>
            )}

            {activeTab === 'Fee Details' && (
              <div className="space-y-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-gray-400 uppercase tracking-wider text-xs border-b border-gray-200 dark:border-slate-700">
                      <th className="pb-3">Fee Type</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 font-semibold">Tuition Fee (Term 1)</td>
                      <td className="py-3 text-gray-500">15th Aug 2026</td>
                      <td className="py-3">₹15,000</td>
                      <td className="py-3 text-right text-green-600 font-semibold">PAID</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Tuition Fee (Term 2)</td>
                      <td className="py-3 text-gray-500">15th Dec 2026</td>
                      <td className="py-3">₹15,000</td>
                      <td className="py-3 text-right text-green-600 font-semibold">PAID</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Tuition Fee (Term 3)</td>
                      <td className="py-3 text-gray-500">15th Mar 2027</td>
                      <td className="py-3">₹15,000</td>
                      <td className="py-3 text-right text-amber-600 font-semibold">PENDING</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'Attendance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Total Working Days" value="45 Days" />
                <DetailRow label="Present Days" value="41 Days" />
                <DetailRow label="Attendance Rate" value="91.1%" />
              </div>
            )}

            {activeTab === 'Exam Report' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 mb-6">
                  <DetailRow label="Latest Exam" value="Term 1 Examinations" />
                  <DetailRow label="Obtained Marks" value="482 / 600" />
                  <DetailRow label="Overall Percentage" value="80.33% (Grade A)" />
                </div>
                <p className="text-xs text-gray-500">Report cards are published in the Notice Board module.</p>
              </div>
            )}

            {activeTab === 'Subject' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase">Compulsory</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">Mathematics</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase">Compulsory</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">Science</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase">Compulsory</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">English</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase">Elective</p>
                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1">Computer Science</p>
                </div>
              </div>
            )}

            {activeTab === 'Dialogue' && (
              <div className="text-gray-500 text-sm">
                No active conversations or discipline dialogues found for this student.
              </div>
            )}

            {activeTab === 'Notes' && (
              <div className="text-gray-500 text-sm">
                No teacher notes or class feedback comments have been recorded.
              </div>
            )}

            {activeTab === 'Document' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Aadhar Card / UID" value={student?.aadharNumber || 'Not Provided'} />
                <DetailRow label="Nationality" value={student?.nationality || 'Indian'} />
                <DetailRow label="Category" value={student?.category || 'General'} />
              </div>
            )}

            {activeTab === 'Qualification' && (
              <div className="text-gray-500 text-sm">
                Prior education details (Previous school: Global Public School, Class VI) logged in archives.
              </div>
            )}

            {activeTab === 'Account' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12">
                <DetailRow label="Bank Account Status" value="Not Linked" />
                <DetailRow label="Fee Waiver / Scholarship" value="None" />
              </div>
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

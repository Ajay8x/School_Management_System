import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Calendar, Clock, CheckCircle, GraduationCap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await API.get('/notices');
        setNotices(res.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotices();
  }, []);

  const stats = [
    { title: 'Total Classes', value: '5', icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Students', value: '142', icon: GraduationCap, color: 'bg-teal-500' },
    { title: 'Pending Marks', value: '3', icon: Clock, color: 'bg-orange-500' },
    { title: 'Attendance Given', value: '100%', icon: CheckCircle, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}! 👋</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Teacher Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center transition-colors">
            <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
           <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Today's Timetable</h2>
           <div className="text-gray-500 dark:text-slate-400 text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No classes scheduled for the rest of today.</p>
           </div>
        </div>

        {/* Notice Board Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-500" />
              Notice Board
            </h2>
            <Link to="/teacher/notice-board" className="text-xs font-bold text-teal-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm italic">No active notices.</p>
            ) : notices.map(notice => (
              <div key={notice._id} className="border-l-4 border-teal-500 pl-4 py-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{notice.title}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">{notice.content}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{new Date(notice.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

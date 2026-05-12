import { Users, GraduationCap, ArrowUp, Briefcase, Bell } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function Dashboard() {
  const { user: currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({ students: 0, teachers: 0, guardians: 0 });
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, guardiansRes, noticesRes] = await Promise.all([
          API.get('/students'),
          API.get('/teachers'),
          API.get('/guardians'),
          API.get('/notices')
        ]);
        setStats({
          students: studentsRes.data.length,
          teachers: teachersRes.data.length,
          guardians: guardiansRes.data.length
        });
        setNotices(noticesRes.data.slice(0, 5)); // Show latest 5
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  // Exact EduDash theme implementation
  const statCards = [
    { 
      title: 'Total Student', 
      value: stats.students > 0 ? stats.students : '20,000', 
      icon: GraduationCap, 
      iconColor: 'text-[#ff8a4c]', 
      iconBg: 'bg-[#fff4ed] dark:bg-[#ff8a4c]/20' 
    },
    { 
      title: 'Total Teacher', 
      value: stats.teachers > 0 ? stats.teachers : '1,500', 
      icon: Users, 
      iconColor: 'text-[#4361ee]', 
      iconBg: 'bg-[#f0f4ff] dark:bg-[#4361ee]/20' 
    },
    { 
      title: 'Total Parent', 
      value: stats.guardians > 0 ? stats.guardians : '18,500', 
      icon: Users, 
      iconColor: 'text-[#b5179e]', 
      iconBg: 'bg-[#faedff] dark:bg-[#b5179e]/20' 
    },
    { 
      title: 'Total Staff', 
      value: '500', 
      icon: Briefcase, 
      iconColor: 'text-[#20c997]', 
      iconBg: 'bg-[#ebfbf5] dark:bg-[#20c997]/20' 
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-gray-800 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 text-[14px] mt-0.5">School &rarr; Manage your school, track attendance, expense, and net worth.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-[15px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center space-x-4 mb-5">
              <div className={`w-[50px] h-[50px] rounded-full flex items-center justify-center ${stat.iconBg} ${stat.iconColor} transition-colors duration-300`}>
                <stat.icon className="w-[22px] h-[22px]" strokeWidth={2} />
              </div>
              <p className="text-[#5c5c5c] dark:text-slate-300 font-medium text-[15px]">{stat.title}</p>
            </div>
            
            <h3 className="text-[34px] font-bold text-gray-800 dark:text-white mb-2">{stat.value}</h3>
            
            <div className="flex items-center text-[13px] text-gray-500 dark:text-slate-400 mt-2">
               <span className="text-teal-500 font-semibold mr-1 flex items-center">
                 10% <ArrowUp className="w-3 h-3 ml-0.5" />
               </span>
               <span>+5 This Month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-[15px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 transition-colors duration-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-[16px] font-bold text-gray-800 dark:text-white">User Overview</h2>
          </div>
          <div className="h-[300px] flex items-center justify-center bg-gray-50/50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-600 transition-colors duration-300">
            <p className="text-gray-400 dark:text-slate-500 text-sm">Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-[15px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-slate-700 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-[16px] font-bold text-gray-800 dark:text-white">Notice Board</h2>
             <Link to={`/${currentUser?.role || 'admin'}/notice-board`} className="text-[12px] font-bold text-teal-500 hover:text-teal-600 transition uppercase tracking-wider">View All</Link>
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-sm py-4 text-center">No recent notices.</p>
            ) : notices.map(notice => {
              const noticeDate = new Date(notice.date);
              const day = noticeDate.getDate();
              const month = noticeDate.toLocaleString('default', { month: 'short' });
              
              return (
                <div key={notice._id} className="flex border-b border-gray-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex flex-col items-center justify-center flex-shrink-0 mr-4 text-teal-600 dark:text-teal-400">
                    <span className="font-bold text-lg leading-tight">{day}</span>
                    <span className="text-[10px] uppercase font-bold">{month}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-bold text-gray-800 dark:text-white hover:text-teal-500 dark:hover:text-teal-400 cursor-pointer transition truncate">{notice.title}</h4>
                    <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">{notice.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

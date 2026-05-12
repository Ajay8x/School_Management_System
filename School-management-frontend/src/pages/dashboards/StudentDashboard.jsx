import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Award, FileText, CheckCircle, Bell, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [noticesRes, feesRes] = await Promise.all([
          API.get('/notices'),
          user?.studentId ? API.get(`/fees/student/${user.studentId}`) : Promise.resolve({ data: [] })
        ]);
        setNotices(noticesRes.data.slice(0, 4));
        setFees(feesRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const totalDue = fees.reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);
  const pendingFeesCount = fees.filter(f => f.status !== 'Paid').length;

  const stats = [
    { title: 'My Attendance', value: '92%', icon: CheckCircle, color: 'bg-emerald-500' },
    { title: 'Pending Fees', value: `₹${totalDue.toLocaleString()}`, icon: Wallet, color: 'bg-rose-500' },
    { title: 'Latest Result', value: 'A Grade', icon: Award, color: 'bg-blue-500' },
    { title: 'New Notices', value: notices.length.toString(), icon: FileText, color: 'bg-teal-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}! 🎓</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Student Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center transition-colors group">
            <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
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
        {/* Billing Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
               <CreditCard className="w-5 h-5 text-indigo-500" />
               Fee & Billing Status
             </h2>
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Academic Year 2026-27</span>
           </div>

           <div className="space-y-4">
              {fees.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No billing records found.</p>
                </div>
              ) : (
                fees.map(fee => (
                  <div key={fee._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white">{fee.feeType}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${fee.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ₹{fee.paidAmount.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        of ₹{fee.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
           </div>

           {totalDue > 0 && (
             <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-2xl flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-rose-500" />
               <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                 You have an outstanding balance of <span className="font-black">₹{totalDue.toLocaleString()}</span>. Please settle dues at the accounts office.
               </p>
             </div>
           )}
        </div>

        {/* Notice Board Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-500" />
              Recent Notices
            </h2>
            <Link to="/student/notice-board" className="text-xs font-bold text-teal-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm italic">No notices posted.</p>
            ) : notices.map(notice => (
              <div key={notice._id} className="group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-teal-500 transition-colors">{notice.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 uppercase">{new Date(notice.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments/Homework Placeholder */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
           <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pending Tasks</h2>
           <div className="text-gray-500 dark:text-slate-400 text-center py-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">All tasks completed</p>
           </div>
        </div>
      </div>
    </div>
  );
}

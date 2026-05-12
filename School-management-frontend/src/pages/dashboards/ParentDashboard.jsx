import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CreditCard, Bell, Award, UserCheck } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useContext(AuthContext);

  const stats = [
    { title: 'Child Attendance', value: '92%', icon: UserCheck, color: 'bg-emerald-500' },
    { title: 'Fee Status', value: 'Paid', icon: CreditCard, color: 'bg-teal-500' },
    { title: 'Latest Result', value: 'A Grade', icon: Award, color: 'bg-blue-500' },
    { title: 'Messages', value: '1 New', icon: Bell, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}! 👨‍👩‍👧</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Parent Dashboard</p>
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

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
         <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Messages from Teachers</h2>
         <div className="text-gray-500 dark:text-slate-400 text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No new messages.</p>
         </div>
      </div>
    </div>
  );
}

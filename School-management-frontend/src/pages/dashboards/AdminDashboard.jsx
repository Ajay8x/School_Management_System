import { 
  Users, GraduationCap, ArrowUp, Briefcase, Bell, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Plus, Sparkles, Clock, CreditCard, 
  CheckCircle2, MapPin, UserPlus, FileText, ArrowRight, DollarSign
} from 'lucide-react';
import { useEffect, useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function Dashboard() {
  const { user: currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({ students: 0, teachers: 0, guardians: 0, fees: { collected: 0, target: 500000 } });
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, teachersRes, guardiansRes, noticesRes, eventsRes, feesRes] = await Promise.allSettled([
          API.get('/students'),
          API.get('/teachers'),
          API.get('/guardians'),
          API.get('/notices'),
          API.get('/events'),
          API.get('/fees')
        ]);

        const studentCount = studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0;
        const teacherCount = teachersRes.status === 'fulfilled' ? teachersRes.value.data.length : 0;
        const guardianCount = guardiansRes.status === 'fulfilled' ? guardiansRes.value.data.length : 0;
        const noticesList = noticesRes.status === 'fulfilled' ? (noticesRes.value.data || []) : [];
        const eventsList = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : [];

        let collectedFees = 385000;
        if (feesRes.status === 'fulfilled' && Array.isArray(feesRes.value.data)) {
          collectedFees = feesRes.value.data.reduce((sum, f) => sum + (Number(f.amount || f.paidAmount) || 0), 0) || 385000;
        }

        setStats({
          students: studentCount,
          teachers: teacherCount,
          guardians: guardianCount,
          fees: { collected: collectedFees, target: 500000 }
        });
        setNotices(noticesList.slice(0, 5));
        setEvents(eventsList);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Standard official holidays list fallback if backend has fewer events
  const allEvents = useMemo(() => {
    if (events && events.length > 0) return events;
    const year = new Date().getFullYear();
    return [
      { _id: 'h1', title: 'Republic Day', type: 'holiday', date: `${year}-01-26`, description: 'National Holiday' },
      { _id: 'h2', title: 'Maha Shivratri', type: 'holiday', date: `${year}-03-08`, description: 'Religious Festival' },
      { _id: 'h3', title: 'Holi Festival', type: 'celebration', date: `${year}-03-25`, description: 'Festival of Colors' },
      { _id: 'h4', title: 'Eid-ul-Fitr', type: 'holiday', date: `${year}-04-11`, description: 'Public Holiday' },
      { _id: 'h5', title: 'Summer Vacation Begins', type: 'holiday', date: `${year}-05-20`, description: 'Annual Summer Break' },
      { _id: 'h6', title: 'Independence Day', type: 'celebration', date: `${year}-08-15`, description: 'Flag Hoisting & Cultural Programs' },
      { _id: 'h7', title: 'Gandhi Jayanti', type: 'holiday', date: `${year}-10-02`, description: 'National Holiday' },
      { _id: 'h8', title: 'Diwali & Deepavali', type: 'celebration', date: `${year}-11-01`, description: 'Festival of Lights' },
      { _id: 'h9', title: 'Christmas Day', type: 'holiday', date: `${year}-12-25`, description: 'Winter Holiday' }
    ];
  }, [events]);

  // Calendar calculations
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDayEvents(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayEvents(null);
  };

  // Map events to date strings (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = {};
    allEvents.forEach(evt => {
      if (!evt.date) return;
      const d = new Date(evt.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [allEvents]);

  // Handle clicking a specific day in the calendar grid
  const handleDateClick = (day) => {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(key);
    setSelectedDayEvents(eventsByDate[key] || []);
  };

  // Upcoming holidays list (sorted ascending >= today)
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents
      .filter(evt => {
        const d = new Date(evt.date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [allEvents]);

  // Calculate relative days text
  const getRelativeDay = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const statCards = [
    { 
      title: 'Total Student', 
      value: stats.students > 0 ? stats.students : '6', 
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
      value: stats.guardians > 0 ? stats.guardians : '2', 
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

  const quickActions = [
    { title: 'New Student', icon: UserPlus, link: '/admin/students', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { title: 'Collect Fees', icon: CreditCard, link: '/admin/fees', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { title: 'Attendance', icon: CheckCircle2, link: '/admin/attendance', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { title: 'Holidays Calendar', icon: CalendarIcon, link: '/admin/holidays', color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
    { title: 'Timetable', icon: Clock, link: '/admin/timetable', color: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20' },
    { title: 'Notice Board', icon: Bell, link: '/admin/notice-board', color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' }
  ];

  const rolePrefix = currentUser?.role === 'super-admin' || currentUser?.role === 'admin' ? '/admin' : `/${currentUser?.role || 'admin'}`;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            Dashboard
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Live Session
            </span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-[14px] mt-0.5">
            School &rarr; Manage your school, track attendance, holidays, expense, and operations.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`${rolePrefix}/holidays`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition shadow-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Manage Holidays</span>
          </Link>
          <Link
            to={`${rolePrefix}/fees`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition shadow-md shadow-teal-500/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Collection</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Shortcuts Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {quickActions.map((act, index) => (
          <Link
            key={index}
            to={`${rolePrefix}${act.link.replace('/admin', '')}`}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/80 hover:border-teal-500/40 dark:hover:border-teal-500/40 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center text-center justify-center gap-2.5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${act.color} text-white flex items-center justify-center ${act.shadow} shadow-lg transition-transform group-hover:scale-110 duration-200`}>
              <act.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {act.title}
            </span>
          </Link>
        ))}
      </div>

      {/* 4 Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-slate-700/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3.5 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor} transition-colors duration-300`}>
                <stat.icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <p className="text-gray-500 dark:text-slate-300 font-semibold text-sm">{stat.title}</p>
            </div>
            
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2 tracking-tight">{stat.value}</h3>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
               <span className="text-teal-500 font-bold mr-1 flex items-center">
                 10% <ArrowUp className="w-3 h-3 ml-0.5" />
               </span>
               <span>+5 This Month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Holidays Calendar & Upcoming Holidays Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Interactive Calendar Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700/80 shadow-sm">
          
          {/* Calendar Header with Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  Academic & Holiday Calendar
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase tracking-wide">
                    {monthName} {currentYear}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Click any marked date to view scheduled holidays and events.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button 
                onClick={goToToday}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Today
              </button>
              <button 
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div>
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={d} className={`text-[12px] font-bold py-1.5 ${i === 0 ? 'text-rose-500' : 'text-gray-400 dark:text-slate-400'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Blank offset days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[44px] sm:min-h-[56px] rounded-xl bg-gray-50/40 dark:bg-slate-800/30 opacity-40"></div>
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateKey] || [];
                
                const isToday = 
                  new Date().getDate() === dayNum && 
                  new Date().getMonth() === currentMonth && 
                  new Date().getFullYear() === currentYear;

                const isSelected = selectedDateStr === dateKey;
                const hasHoliday = dayEvents.some(e => e.type === 'holiday');
                const hasCelebration = dayEvents.some(e => e.type === 'celebration');
                const hasEvent = dayEvents.some(e => e.type === 'event');

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleDateClick(dayNum)}
                    type="button"
                    className={`min-h-[44px] sm:min-h-[56px] p-1.5 rounded-xl border flex flex-col items-center justify-between text-left transition-all duration-200 relative group ${
                      isSelected 
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20' 
                        : isToday 
                        ? 'border-teal-400/80 bg-teal-50/30 dark:bg-teal-900/20 font-bold' 
                        : hasHoliday
                        ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                        : 'border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:border-teal-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center -ml-0.5' 
                          : hasHoliday 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : 'text-gray-700 dark:text-slate-200'
                      }`}>
                        {dayNum}
                      </span>

                      {/* Indicator Badges */}
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-extrabold px-1 rounded bg-rose-500 text-white leading-tight">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex items-center gap-1 mt-1">
                      {hasHoliday && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>}
                      {hasCelebration && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>}
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50"></span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Event Drawer / Banner */}
          {selectedDayEvents && (
            <div className="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-teal-500" />
                  Events on {new Date(selectedDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
                <button 
                  onClick={() => setSelectedDayEvents(null)} 
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-500 italic">No scheduled holidays or events on this date. Regular school day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((evt, i) => (
                    <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${evt.type === 'holiday' ? 'bg-rose-500' : evt.type === 'celebration' ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
                          <p className="text-xs font-bold text-gray-800 dark:text-white">{evt.title}</p>
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500">
                            {evt.type}
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 pl-4">{evt.description}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
                        {evt.location || 'All Campus'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/60 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Official Holiday
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Celebration / Festival
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> School Event
            </span>
          </div>
        </div>

        {/* Upcoming Holidays & Festival Countdown List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Upcoming Holidays</h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-400">Upcoming school breaks & festivals</p>
                </div>
              </div>
              <Link 
                to={`${rolePrefix}/holidays`}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                View All
              </Link>
            </div>

            {/* Upcoming List */}
            <div className="space-y-3">
              {upcomingHolidays.map((holiday, idx) => {
                const hDate = new Date(holiday.date);
                const dayNum = hDate.getDate();
                const monthStr = hDate.toLocaleString('default', { month: 'short' });
                const countdown = getRelativeDay(holiday.date);
                const isHoliday = holiday.type === 'holiday';

                return (
                  <div 
                    key={holiday._id || idx}
                    className="p-3 rounded-xl border border-gray-100 dark:border-slate-700/70 hover:border-rose-200 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-900/40 transition-all flex items-center gap-3.5 group"
                  >
                    {/* Date badge */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center font-bold ${
                      isHoliday 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30' 
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30'
                    }`}>
                      <span className="text-base leading-none">{dayNum}</span>
                      <span className="text-[10px] uppercase mt-0.5 tracking-wider font-extrabold">{monthStr}</span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                          {holiday.title}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 flex-shrink-0">
                          {countdown}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-slate-400 truncate mt-0.5">
                        {holiday.description || 'School Closed / Festival'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Card Link */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700/80">
            <Link 
              to={`${rolePrefix}/holidays`}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday / Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Overview Chart & Notice Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Growth & Attendance Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-slate-700/80 transition-colors duration-300 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-[16px] font-bold text-gray-800 dark:text-white">User Overview & Growth</h2>
               <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">Monthly trends of enrolled students and active teachers</p>
             </div>
             <div className="flex items-center gap-4 text-xs font-semibold">
               <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#ff8a4c]"></span> Students
               </span>
               <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#4361ee]"></span> Teachers
               </span>
             </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Jan', Students: 4000, Teachers: 240, Parents: 2400 },
                  { name: 'Feb', Students: 4200, Teachers: 250, Parents: 2500 },
                  { name: 'Mar', Students: 4500, Teachers: 260, Parents: 2800 },
                  { name: 'Apr', Students: 4800, Teachers: 270, Parents: 3000 },
                  { name: 'May', Students: 5000, Teachers: 280, Parents: 3100 },
                  { name: 'Jun', Students: 5200, Teachers: 290, Parents: 3300 },
                  { name: 'Jul', Students: stats.students || 5400, Teachers: stats.teachers || 300, Parents: stats.guardians || 3500 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8a4c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff8a4c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)', backgroundColor: '#1e293b', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="Students" stroke="#ff8a4c" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="Teachers" stroke="#4361ee" strokeWidth={3} fillOpacity={1} fill="url(#colorTeachers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Notice Board Feed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-slate-700/80 transition-colors duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-[15px] font-bold text-gray-800 dark:text-white">Notice Board</h2>
              </div>
              <Link to={`${rolePrefix}/notice-board`} className="text-[12px] font-bold text-teal-500 hover:text-teal-600 transition uppercase tracking-wider">View All</Link>
            </div>
            
            <div className="space-y-3.5">
              {notices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-500" />
                  No recent notices available.
                </div>
              ) : notices.map(notice => {
                const noticeDate = new Date(notice.date || notice.createdAt);
                const day = noticeDate.getDate();
                const month = noticeDate.toLocaleString('default', { month: 'short' });
                
                return (
                  <Link 
                    key={notice._id}
                    to={`${rolePrefix}/notice-board`}
                    className="flex items-start border-b border-gray-100 dark:border-slate-700/50 last:border-0 pb-3 last:pb-0 group transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex flex-col items-center justify-center flex-shrink-0 mr-3 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold group-hover:scale-105 transition-transform">
                      <span className="text-sm leading-none">{day}</span>
                      <span className="text-[9px] uppercase font-extrabold mt-0.5">{month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white group-hover:text-teal-500 transition truncate">{notice.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{notice.content}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/80 text-center">
            <Link 
              to={`${rolePrefix}/notice-board`}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              Broadcast New Announcement <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

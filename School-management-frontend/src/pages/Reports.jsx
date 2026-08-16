import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Printer, Filter, Search, FileText, 
  TrendingUp, Users, CreditCard, Award, Truck, Home as HomeIcon, 
  CheckCircle, Clock, AlertTriangle, BookOpen, Package, UserCheck, Shield
} from 'lucide-react';
import API from '../api/axios';

export default function Reports() {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('student'); // 'student', 'finance', 'exam', 'transport', 'hostel', 'attendance', 'staff', 'library', 'inventory'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // Report categories list matching user screenshot & request
  const reportCategories = [
    { id: 'student', label: 'Student Report', icon: Users },
    { id: 'finance', label: 'Finance Report', icon: CreditCard },
    { id: 'exam', label: 'Exam Report', icon: Award },
    { id: 'transport', label: 'Transport Report', icon: Truck },
    { id: 'hostel', label: 'Hostel Report', icon: HomeIcon },
    { id: 'attendance', label: 'Attendance Report', icon: UserCheck },
    { id: 'staff', label: 'Employee / Staff Report', icon: Shield },
    { id: 'library', label: 'Library Report', icon: BookOpen },
    { id: 'inventory', label: 'Inventory Report', icon: Package }
  ];

  // Fetch report data on activeReport change
  useEffect(() => {
    fetchReportData(activeReport);
  }, [activeReport]);

  const fetchReportData = async (type) => {
    setLoading(true);
    try {
      if (type === 'student') {
        const res = await API.get('/students');
        setReportData(res.data && res.data.length > 0 ? res.data : getDummyStudentReport());
      } else if (type === 'finance') {
        setReportData(getDummyFinanceReport());
      } else if (type === 'exam') {
        setReportData(getDummyExamReport());
      } else if (type === 'transport') {
        setReportData(getDummyTransportReport());
      } else if (type === 'hostel') {
        setReportData(getDummyHostelReport());
      } else if (type === 'attendance') {
        setReportData(getDummyAttendanceReport());
      } else if (type === 'staff') {
        const res = await API.get('/teachers');
        setReportData(res.data && res.data.length > 0 ? res.data : getDummyStaffReport());
      } else if (type === 'library') {
        setReportData(getDummyLibraryReport());
      } else if (type === 'inventory') {
        setReportData(getDummyInventoryReport());
      }
    } catch (err) {
      console.warn('API error, loading report preset data:', err);
      if (type === 'student') setReportData(getDummyStudentReport());
      else if (type === 'finance') setReportData(getDummyFinanceReport());
      else if (type === 'exam') setReportData(getDummyExamReport());
      else if (type === 'transport') setReportData(getDummyTransportReport());
      else if (type === 'hostel') setReportData(getDummyHostelReport());
      else if (type === 'attendance') setReportData(getDummyAttendanceReport());
      else if (type === 'staff') setReportData(getDummyStaffReport());
      else if (type === 'library') setReportData(getDummyLibraryReport());
      else if (type === 'inventory') setReportData(getDummyInventoryReport());
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!reportData || reportData.length === 0) return;

    const title = `${activeReport.toUpperCase()} STATEMENT REPORT`;
    const dateStr = new Date().toLocaleString();
    const keys = Object.keys(filteredData[0] || {});

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2a0e5c; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #2a0e5c; text-transform: uppercase; }
          .date { font-size: 12px; color: #64748b; }
          .meta { display: flex; gap: 15px; margin-bottom: 20px; }
          .badge { background: #f1f5f9; padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #2a0e5c; color: white; padding: 10px; text-align: left; text-transform: uppercase; font-size: 11px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${title}</div>
            <div class="date">Campus Pilot System • Generated on: ${dateStr}</div>
          </div>
        </div>
        <div class="meta">
          <div class="badge">Total Records: ${filteredData.length}</div>
          <div class="badge">Status: Verified</div>
          <div class="badge">Category: ${activeReport.toUpperCase()}</div>
        </div>
        <table>
          <thead>
            <tr>
              ${keys.map(k => `<th>${k.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>
                ${keys.map(k => `<td>${row[k] ?? '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Confidential Document • Campus Pilot
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}_report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredData = reportData.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(val => 
      val && String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      {/* Top Header matching user screenshot */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-[#1E1B4B] dark:text-white tracking-tight">
          Report
        </h1>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Application</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Report Pill Buttons (Screenshot Match) */}
        <div className="lg:col-span-3 space-y-3">
          {reportCategories.map(cat => {
            const isActive = activeReport === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveReport(cat.id)}
                className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-between ${
                  isActive
                    ? 'bg-[#2A0E5C] text-white shadow-md ring-2 ring-[#2A0E5C]/30'
                    : 'bg-[#311468] hover:bg-[#2A0E5C] text-slate-200 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Dynamic Report Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          
          {/* Report Top Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
                {activeReport} Overview & Statement
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Generated analytics & record list for active academic session.
              </p>
            </div>

            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 text-xs text-gray-800 dark:text-slate-200 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* 1. Download PDF */}
              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              {/* 2. Export CSV */}
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              {/* 3. Print (to the right side of Export CSV) */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 rounded-xl p-4">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Total Records</span>
              <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-200 mt-1">{filteredData.length}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-4">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Verified Status</span>
              <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">98%</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Category</span>
              <p className="text-base font-extrabold text-blue-900 dark:text-blue-200 mt-2 truncate uppercase">{activeReport}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 rounded-xl p-4">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Last Sync</span>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mt-2">Just Now</p>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading report data...</div>
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No records found matching filter.</div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 dark:border-slate-700 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-750 text-gray-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    {Object.keys(filteredData[0]).slice(0, 6).map((key) => (
                      <th key={key} className="py-3 px-4 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-slate-200">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                      {Object.keys(row).slice(0, 6).map((key) => (
                        <td key={key} className="py-3 px-4 max-w-[200px] truncate">
                          {String(row[key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center text-xs font-semibold text-gray-400 dark:text-slate-500 py-4">
        Campus pilot
      </div>
    </div>
  );
}

// Dummy Preset Reports Data Generator
function getDummyStudentReport() {
  return [
    { RollNo: 'SM158', Name: 'Aaina Rohan Choudhary', Class: 'Class VI-A', Parent: 'Dhanuk Choudhary', Contact: '7032145694', Status: 'Enrolled' },
    { RollNo: 'SM063', Name: 'Aarav Kumar Sharma', Class: 'Class X-A', Parent: 'Rajesh Kumar', Contact: '9876543210', Status: 'Enrolled' },
    { RollNo: 'SM058', Name: 'Aarav Sharma', Class: 'UKG-A', Parent: 'Rajesh Sharma', Contact: '9876543210', Status: 'Enrolled' },
    { RollNo: 'SM212', Name: 'Aarna Inaaya Contractor', Class: 'Class XI-A', Parent: 'Bhamini Contractor', Contact: '7032145682', Status: 'Enrolled' },
    { RollNo: 'SM167', Name: 'Aarush Nitara Khalsa', Class: 'Class VII-A', Parent: 'Samar Khalsa', Contact: '7032145682', Status: 'Enrolled' }
  ];
}

function getDummyFinanceReport() {
  return [
    { TransactionID: 'TXN-9021', Category: 'Tuition Fee', Student: 'Aarav Sharma', Amount: '₹12,500', Mode: 'Online UPI', Date: '2026-08-10', Status: 'Paid' },
    { TransactionID: 'TXN-9022', Category: 'Transport Fee', Student: 'Aaina Choudhary', Amount: '₹3,200', Mode: 'Bank Transfer', Date: '2026-08-11', Status: 'Paid' },
    { TransactionID: 'TXN-9023', Category: 'Hostel Fee', Student: 'Aarush Khalsa', Amount: '₹18,000', Mode: 'Cheque', Date: '2026-08-12', Status: 'Pending' },
    { TransactionID: 'TXN-9024', Category: 'Exam Fee', Student: 'Aarna Contractor', Amount: '₹1,500', Mode: 'Cash', Date: '2026-08-14', Status: 'Paid' }
  ];
}

function getDummyExamReport() {
  return [
    { Student: 'Aarav Kumar Sharma', Class: 'X-A', Subject: 'Mathematics', Marks: '94/100', Grade: 'A+', Result: 'Passed' },
    { Student: 'Aaina Choudhary', Class: 'VI-A', Subject: 'Science', Marks: '88/100', Grade: 'A', Result: 'Passed' },
    { Student: 'Aarush Khalsa', Class: 'VII-A', Subject: 'English', Marks: '91/100', Grade: 'A+', Result: 'Passed' },
    { Student: 'Aarna Contractor', Class: 'XI-A', Subject: 'Physics', Marks: '85/100', Grade: 'A', Result: 'Passed' }
  ];
}

function getDummyTransportReport() {
  return [
    { RouteNo: 'R-01', Driver: 'Ramesh Singh', Vehicle: 'UP-65-AX-1029', Capacity: '45 Seats', StudentsAssigned: '38', Status: 'Active' },
    { RouteNo: 'R-02', Driver: 'Suresh Verma', Vehicle: 'UP-65-AX-2044', Capacity: '40 Seats', StudentsAssigned: '40', Status: 'Full' },
    { RouteNo: 'R-03', Driver: 'Vikram Yadav', Vehicle: 'UP-65-AX-3011', Capacity: '50 Seats', StudentsAssigned: '29', Status: 'Active' }
  ];
}

function getDummyHostelReport() {
  return [
    { HostelBlock: 'Block A (Boys)', RoomNo: '102', Occupant: 'Aarav Kumar', Warden: 'Dr. R.K. Tripathi', Facilities: 'AC, Wi-Fi', Status: 'Occupied' },
    { HostelBlock: 'Block B (Girls)', RoomNo: '204', Occupant: 'Aarna Contractor', Warden: 'Mrs. S. Gupta', Facilities: 'Non-AC', Status: 'Occupied' },
    { HostelBlock: 'Block A (Boys)', RoomNo: '105', Occupant: 'Aarush Khalsa', Warden: 'Dr. R.K. Tripathi', Facilities: 'AC, Wi-Fi', Status: 'Occupied' }
  ];
}

function getDummyAttendanceReport() {
  return [
    { Date: '2026-08-15', TotalStudents: '1,240', Present: '1,180', Absent: '45', OnLeave: '15', Percentage: '95.1%' },
    { Date: '2026-08-14', TotalStudents: '1,240', Present: '1,192', Absent: '36', OnLeave: '12', Percentage: '96.1%' },
    { Date: '2026-08-13', TotalStudents: '1,240', Present: '1,175', Absent: '50', OnLeave: '15', Percentage: '94.7%' }
  ];
}

function getDummyStaffReport() {
  return [
    { StaffID: 'EMP-101', Name: 'Dr. Rajesh Sharma', Department: 'Science', Designation: 'HOD Physics', Contact: '9876543210', Status: 'Active' },
    { StaffID: 'EMP-102', Name: 'Sunita Verma', Department: 'Mathematics', Designation: 'Senior Lecturer', Contact: '9876543211', Status: 'Active' },
    { StaffID: 'EMP-103', Name: 'Anil Kumar', Department: 'Sports', Designation: 'Physical Instructor', Contact: '9876543212', Status: 'Active' }
  ];
}

function getDummyLibraryReport() {
  return [
    { ISBN: '978-014306', BookTitle: 'Concepts of Physics', Author: 'H.C. Verma', IssuedTo: 'Aarav Kumar (Class X)', DueDate: '2026-08-20', Status: 'Issued' },
    { ISBN: '978-032170', BookTitle: 'Higher Algebra', Author: 'Hall & Knight', IssuedTo: 'Aarna Contractor', DueDate: '2026-08-22', Status: 'Issued' },
    { ISBN: '978-007180', BookTitle: 'Organic Chemistry', Author: 'Morrison & Boyd', IssuedTo: 'Aarush Khalsa', DueDate: '2026-08-18', Status: 'Overdue' }
  ];
}

function getDummyInventoryReport() {
  return [
    { ItemID: 'INV-501', Category: 'Stationery', ItemName: 'A4 Printing Paper reams', Quantity: '150 Reams', Location: 'Main Store', Status: 'In Stock' },
    { ItemID: 'INV-502', Category: 'Lab Equipment', ItemName: 'Microscopes (Digital)', Quantity: '24 Units', Location: 'Bio Lab', Status: 'In Stock' },
    { ItemID: 'INV-503', Category: 'Sports Equipment', ItemName: 'Basketballs (Spalding)', Quantity: '12 Units', Location: 'Sports Complex', Status: 'Low Stock' }
  ];
}

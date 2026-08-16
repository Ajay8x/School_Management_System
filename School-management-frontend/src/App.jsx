import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';

// Modules
import Students from './pages/Students';
import Organization from './pages/Organization';
import School from './pages/School';
import Reports from './pages/Reports';
import Teachers from './pages/Teachers';
import AddStudent from './pages/students/AddStudent';
import StudentProfile from './pages/students/StudentProfile';
import RollNumber from './pages/students/RollNumber';
import Photo from './pages/students/Photo';
import HealthRecord from './pages/students/HealthRecord';
import ElectiveSubject from './pages/students/ElectiveSubject';
import StudentAttendance from './pages/students/Attendance';
import FeeAllocation from './pages/students/FeeAllocation';
import ServiceAllocation from './pages/students/ServiceAllocation';
import Promotion from './pages/students/Promotion';
import Enquiry from './pages/reception/Enquiry';
import VisitorLog from './pages/reception/VisitorLog';
import Complaint from './pages/reception/Complaint';
import GatePass from './pages/reception/GatePass';
import Correspondence from './pages/reception/Correspondence';
import Query from './pages/reception/Query';
import AddTeacher from './pages/teachers/AddTeacher';
import TeacherProfile from './pages/teachers/TeacherProfile';

import GuardiansList from './pages/guardians/GuardiansList';
import AddGuardian from './pages/guardians/AddGuardian';
import EditGuardian from './pages/guardians/EditGuardian';
import GuardianDetails from './pages/guardians/GuardianDetails';

import Classes from './pages/Classes';
import Examinations from './pages/Examinations';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Certificate from './pages/Certificate';
import Library from './pages/Library';
import Accounts from './pages/Accounts';
import HRM from './pages/HRM';
import NoticeBoard from './pages/NoticeBoard';
import Event from './pages/Event';
import CalendarManager from './pages/CalendarManager';
import DownloadFormat from './pages/DownloadFormat';
import Message from './pages/Message';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Placeholder from './components/Placeholder';
import UserCredentials from './pages/super-admin/UserCredentials';
import ModuleConfig from './pages/super-admin/ModuleConfig';
import ActivityLog from './pages/ActivityLog';
import NotFound from './pages/NotFound';


// Helper component for admin & super-admin shared routes
const AdminAndSuperAdminRoutes = () => (
  <>
    <Route path="dashboard" element={<AdminDashboard />} />
    
    <Route path="students" element={<Students />} />
    <Route path="students/:id" element={<StudentProfile />} />
    <Route path="students/add" element={<AddStudent />} />
    <Route path="students/edit/:id" element={<AddStudent />} />
    <Route path="students/registration" element={<AddStudent />} />
    <Route path="students/roll-number" element={<RollNumber />} />
    <Route path="students/photo" element={<Photo />} />
    <Route path="students/health-record" element={<HealthRecord />} />
    <Route path="students/elective-subject" element={<ElectiveSubject />} />
    <Route path="students/attendance" element={<StudentAttendance />} />
    <Route path="students/fee-allocation" element={<FeeAllocation />} />
    <Route path="students/service-allocation" element={<ServiceAllocation />} />
    <Route path="students/promotion" element={<Promotion />} />
    <Route path="students/edit-request" element={<Placeholder title="Edit Request" />} />
    <Route path="students/service-request" element={<Placeholder title="Service Request" />} />
    <Route path="students/leave-request" element={<Placeholder title="Leave Request" />} />
    <Route path="students/transfer-request" element={<Placeholder title="Transfer Request" />} />
    <Route path="students/transfer" element={<Placeholder title="Transfer" />} />
    <Route path="students/alumni" element={<Placeholder title="Alumni" />} />
    <Route path="students/report" element={<Placeholder title="Report" />} />
    
    <Route path="teachers" element={<Teachers />} />
    <Route path="teachers/:id" element={<TeacherProfile />} />
    <Route path="teachers/add" element={<AddTeacher />} />
    <Route path="teachers/edit/:id" element={<AddTeacher />} />
    
    <Route path="guardians" element={<GuardiansList />} />
    <Route path="guardians/add" element={<AddGuardian />} />
    <Route path="guardians/edit/:id" element={<EditGuardian />} />
    <Route path="guardians/:id" element={<GuardianDetails />} />

    <Route path="classes" element={<Classes />} />
    <Route path="examinations" element={<Examinations />} />
    <Route path="fees" element={<Fees />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="leaves" element={<Leaves />} />
    <Route path="certificate" element={<Certificate />} />
    <Route path="library" element={<Library />} />
    <Route path="accounts" element={<Accounts />} />
    <Route path="hrm" element={<HRM />} />
    <Route path="notice-board" element={<NoticeBoard />} />
    <Route path="event" element={<Event />} />
    <Route path="message" element={<Message />} />
    <Route path="organization" element={<Organization />} />
    <Route path="organization/add" element={<Organization initialView="add" />} />
    <Route path="school" element={<School />} />
    <Route path="school/add" element={<School initialView="add" />} />
    <Route path="reports" element={<Reports />} />
    <Route path="users" element={<Users />} />
    <Route path="roles" element={<Roles />} />
    <Route path="settings" element={<Settings />} />
    <Route path="general-config" element={<Settings initialTab="general" />} />
    <Route path="asset-config" element={<Settings initialTab="asset" />} />
    <Route path="credentials" element={<UserCredentials />} />
    <Route path="module-config" element={<ModuleConfig />} />

    <Route path="utility/activity-log" element={<ActivityLog />} />
    <Route path="utility/config" element={<Placeholder title="Utility Config" />} />

    <Route path="reception/enquiry" element={<Enquiry />} />
    <Route path="reception/visitor-log" element={<VisitorLog />} />
    <Route path="reception/gate-pass" element={<GatePass />} />
    <Route path="reception/complaint" element={<Complaint />} />
    <Route path="reception/correspondence" element={<Correspondence />} />
    <Route path="reception/query" element={<Query />} />

    {/* New System Modules matching sidebar screenshot */}
    <Route path="task" element={<Placeholder title="Task" />} />
    <Route path="helpdesk/faq" element={<Placeholder title="Helpdesk FAQ" />} />
    <Route path="helpdesk/ticket" element={<Placeholder title="Helpdesk Ticket" />} />

    <Route path="academic/department" element={<Placeholder title="Academic Department" />} />
    <Route path="academic/program" element={<Placeholder title="Academic Program" />} />
    <Route path="academic/session" element={<Placeholder title="Academic Session" />} />
    <Route path="academic/period" element={<Placeholder title="Class Period" />} />
    <Route path="academic/division" element={<Placeholder title="Division" />} />
    <Route path="academic/batch" element={<Placeholder title="Academic Batch" />} />
    <Route path="academic/routine" element={<Placeholder title="Timetable / Class Routine" />} />
    <Route path="academic/section" element={<Placeholder title="Section" />} />
    <Route path="academic/subject" element={<Placeholder title="Subject" />} />
    <Route path="academic/class-timing" element={<Placeholder title="Class Timing" />} />
    <Route path="academic/syllabus" element={<Placeholder title="Syllabus" />} />
    <Route path="academic/id-card" element={<Placeholder title="Student & Staff ID Card Generation" />} />

    <Route path="finance/payment-method" element={<Placeholder title="Payment Method" />} />
    <Route path="finance/fee-group" element={<Placeholder title="Fee Group" />} />
    <Route path="finance/fee-head" element={<Placeholder title="Fee Head" />} />
    <Route path="finance/fee-component" element={<Placeholder title="Fee Component" />} />
    <Route path="finance/fee-concession" element={<Placeholder title="Fee Concession" />} />
    <Route path="finance/ledger-type" element={<Placeholder title="Ledger Type" />} />
    <Route path="finance/ledger" element={<Placeholder title="Ledger" />} />
    <Route path="finance/tax" element={<Placeholder title="Tax Settings" />} />
    <Route path="finance/receipt" element={<Placeholder title="Receipt Generation" />} />
    <Route path="finance/report" element={<Placeholder title="Finance & Fee Report" />} />

    <Route path="exam/term" element={<Placeholder title="Exam Term" />} />
    <Route path="exam/grade-scale" element={<Placeholder title="Exam Grade Scale" />} />
    <Route path="exam/assessment" element={<Placeholder title="Exam Assessment" />} />
    <Route path="exam/observation-parameter" element={<Placeholder title="Observation Parameter" />} />
    <Route path="exam/competency-parameter" element={<Placeholder title="Competency Parameter" />} />
    <Route path="exam/schedule" element={<Placeholder title="Exam Schedule" />} />
    <Route path="exam/online-exam" element={<Placeholder title="Online Exam" />} />
    <Route path="exam/form" element={<Placeholder title="Exam Form" />} />
    <Route path="exam/admit-card" element={<Placeholder title="Admit Card Generation" />} />
    <Route path="exam/marks" element={<Placeholder title="Exam Mark Entry" />} />
    <Route path="exam/marksheet" element={<Placeholder title="Marksheet & Report Card" />} />
    <Route path="exam/report" element={<Placeholder title="Exam Analytics Report" />} />

    <Route path="employee/department" element={<Placeholder title="Department" />} />
    <Route path="employee/designation" element={<Placeholder title="Designation" />} />
    <Route path="employee/payroll" element={<Placeholder title="Payroll" />} />
    <Route path="employee/edit-request" element={<Placeholder title="Employee Edit Request" />} />

    <Route path="resource/student-diary" element={<Placeholder title="Student Diary" />} />
    <Route path="resource/syllabus" element={<Placeholder title="Syllabus" />} />
    <Route path="resource/lesson-plan" element={<Placeholder title="Lesson Plan" />} />
    <Route path="resource/assignment" element={<Placeholder title="Assignment" />} />
    <Route path="resource/online-class" element={<Placeholder title="Online Class" />} />
    <Route path="resource/learning-material" element={<Placeholder title="Learning Material" />} />
    <Route path="resource/download" element={<Placeholder title="Download Center" />} />
    <Route path="download-format" element={<DownloadFormat />} />
    <Route path="resource/report" element={<Placeholder title="Resource Report" />} />

    <Route path="transport/route" element={<Placeholder title="Transport Route" />} />
    <Route path="transport/circle" element={<Placeholder title="Transport Circle" />} />
    <Route path="transport/fee" element={<Placeholder title="Transport Fee" />} />
    <Route path="transport/vehicle" element={<Placeholder title="Transport Vehicle" />} />
    <Route path="transport/report" element={<Placeholder title="Transport Report" />} />

    <Route path="calendar/holiday" element={<CalendarManager defaultType="holiday" />} />
    <Route path="calendar/celebration" element={<CalendarManager defaultType="celebration" />} />
    <Route path="calendar/event" element={<CalendarManager defaultType="event" />} />
    <Route path="notice-board" element={<NoticeBoard />} />
    <Route path="gallery" element={<Placeholder title="Gallery" />} />
    <Route path="inventory/vendor" element={<Placeholder title="Inventory Vendor" />} />
    <Route path="inventory/category" element={<Placeholder title="Inventory Category" />} />
    <Route path="inventory/item" element={<Placeholder title="Inventory Item" />} />
    <Route path="inventory/bundle" element={<Placeholder title="Inventory Bundle" />} />
    <Route path="inventory/requisition" element={<Placeholder title="Inventory Requisition" />} />
    <Route path="inventory/purchase" element={<Placeholder title="Inventory Purchase" />} />
    <Route path="inventory/return" element={<Placeholder title="Inventory Return" />} />
    <Route path="inventory/transfer" element={<Placeholder title="Inventory Transfer" />} />
    <Route path="inventory/adjustment" element={<Placeholder title="Inventory Adjustment" />} />
    <Route path="inventory/report" element={<Placeholder title="Inventory Report" />} />
    <Route path="store/sale" element={<Placeholder title="Store Sale" />} />
    <Route path="blog" element={<Placeholder title="Blog" />} />
    <Route path="news" element={<Placeholder title="News" />} />
    <Route path="discipline/incident" element={<Placeholder title="Discipline Incident" />} />
    <Route path="approval/type" element={<Placeholder title="Approval Type" />} />
    <Route path="approval/request" element={<Placeholder title="Approval Request" />} />
    <Route path="approval/pending" element={<Placeholder title="Pending Requests" />} />
    <Route path="approval/processed" element={<Placeholder title="Processed Requests" />} />

    <Route path="mess/item" element={<Placeholder title="Mess Item" />} />
    <Route path="mess/meal" element={<Placeholder title="Mess Meal Menu" />} />
    <Route path="mess/meal-log" element={<Placeholder title="Mess Meal Log" />} />

    <Route path="communication/email" element={<Placeholder title="Email Broadcast" />} />
    <Route path="communication/sms" element={<Placeholder title="SMS Broadcast" />} />
    <Route path="communication/whatsapp" element={<Placeholder title="WhatsApp Broadcast" />} />
    <Route path="communication/push-message" element={<Placeholder title="Push Notification Broadcast" />} />

    <Route path="library/add-book" element={<Placeholder title="Book Addition" />} />
    <Route path="library/issue-return" element={<Placeholder title="Library Issue & Return" />} />
    <Route path="library/report" element={<Placeholder title="Library Report" />} />

    <Route path="activity/trip" element={<Placeholder title="Educational & Excursion Trip" />} />

    <Route path="hostel/list" element={<Placeholder title="Hostel Management" />} />
    <Route path="hostel/allocation" element={<Placeholder title="Room Allocation" />} />

    <Route path="asset/building" element={<Placeholder title="Asset Building" />} />

    <Route path="site/page" element={<Placeholder title="Site Page Management" />} />
    <Route path="site/menu" element={<Placeholder title="Site Navigation Menu" />} />
    <Route path="site/block" element={<Placeholder title="Site Block Management" />} />

    <Route path="recruitment/vacancy" element={<Placeholder title="Job Vacancy Management" />} />
    <Route path="recruitment/application" element={<Placeholder title="Job Application Management" />} />

    <Route path="custom-field" element={<Placeholder title="Custom Field" />} />

  </>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/roles" element={<Navigate to="/admin/general-config?tab=role" replace />} />
      <Route path="/role-permission" element={<Navigate to="/admin/general-config?tab=role" replace />} />
      <Route path="/school" element={<Navigate to="/admin/school" replace />} />
      <Route path="/organization" element={<Navigate to="/admin/organization" replace />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          {AdminAndSuperAdminRoutes()}
        </Route>
      </Route>

      {/* SUPER ADMIN ROUTES */}
      <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          {AdminAndSuperAdminRoutes()}
        </Route>
      </Route>

      {/* TEACHER ROUTES */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="calendar/holiday" element={<CalendarManager defaultType="holiday" />} />
          <Route path="calendar/celebration" element={<CalendarManager defaultType="celebration" />} />
          <Route path="calendar/event" element={<CalendarManager defaultType="event" />} />
          <Route path="download-format" element={<DownloadFormat />} />
          <Route path="message" element={<Message />} />
          <Route path="library" element={<Library />} />
          <Route path="utility/activity-log" element={<ActivityLog />} />
          <Route path="utility/config" element={<Placeholder title="Utility Config" />} />
        </Route>
      </Route>

      {/* STUDENT ROUTES */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="calendar/holiday" element={<CalendarManager defaultType="holiday" />} />
          <Route path="calendar/celebration" element={<CalendarManager defaultType="celebration" />} />
          <Route path="calendar/event" element={<CalendarManager defaultType="event" />} />
          <Route path="download-format" element={<DownloadFormat />} />
          <Route path="message" element={<Message />} />
          <Route path="library" element={<Library />} />
          <Route path="utility/activity-log" element={<ActivityLog />} />
          <Route path="utility/config" element={<Placeholder title="Utility Config" />} />
        </Route>
      </Route>

      {/* PARENT ROUTES */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="fees" element={<Fees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="calendar/holiday" element={<CalendarManager defaultType="holiday" />} />
          <Route path="calendar/celebration" element={<CalendarManager defaultType="celebration" />} />
          <Route path="calendar/event" element={<CalendarManager defaultType="event" />} />
          <Route path="download-format" element={<DownloadFormat />} />
          <Route path="message" element={<Message />} />
          <Route path="utility/activity-log" element={<ActivityLog />} />
          <Route path="utility/config" element={<Placeholder title="Utility Config" />} />
        </Route>
      </Route>

      {/* ACCOUNTANT ROUTES */}
      <Route path="/accountant" element={<ProtectedRoute allowedRoles={['accountant', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="dashboard" element={<Placeholder title="Accountant Dashboard" />} />
          <Route path="fees" element={<Fees />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="download-format" element={<DownloadFormat />} />
          <Route path="utility/activity-log" element={<ActivityLog />} />
          <Route path="utility/config" element={<Placeholder title="Utility Config" />} />
        </Route>
      </Route>

      {/* LIBRARIAN ROUTES */}
      <Route path="/librarian" element={<ProtectedRoute allowedRoles={['librarian', 'super-admin']} />}>
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="dashboard" element={<Placeholder title="Librarian Dashboard" />} />
          <Route path="library" element={<Library />} />
          <Route path="download-format" element={<DownloadFormat />} />
          <Route path="utility/activity-log" element={<ActivityLog />} />
          <Route path="utility/config" element={<Placeholder title="Utility Config" />} />
        </Route>
      </Route>

      {/* Catch-all route for unknown paths */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;

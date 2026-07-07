import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';

// Modules
import Students from './pages/Students';
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
import Message from './pages/Message';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Placeholder from './components/Placeholder';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super-admin']} />}>
        <Route element={<Layout />}>
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

          {/* Admin Scaffolded Modules */}
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
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="settings" element={<Settings />} />

          {/* Reception Module */}
          <Route path="reception/enquiry" element={<Enquiry />} />
          <Route path="reception/visitor-log" element={<VisitorLog />} />
          <Route path="reception/gate-pass" element={<GatePass />} />
          <Route path="reception/complaint" element={<Complaint />} />
          <Route path="reception/correspondence" element={<Correspondence />} />
          <Route path="reception/query" element={<Query />} />
        </Route>
      </Route>

      {/* TEACHER ROUTES */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher', 'super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="message" element={<Message />} />
          <Route path="library" element={<Library />} />
        </Route>
      </Route>

      {/* STUDENT ROUTES */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="message" element={<Message />} />
          <Route path="library" element={<Library />} />
        </Route>
      </Route>

      {/* PARENT ROUTES */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent', 'super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="fees" element={<Fees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notice-board" element={<NoticeBoard />} />
          <Route path="event" element={<Event />} />
          <Route path="message" element={<Message />} />
        </Route>
      </Route>

      {/* ACCOUNTANT ROUTES */}
      <Route path="/accountant" element={<ProtectedRoute allowedRoles={['accountant', 'super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Placeholder title="Accountant Dashboard" />} />
          <Route path="fees" element={<Fees />} />
          <Route path="accounts" element={<Accounts />} />
        </Route>
      </Route>

      {/* LIBRARIAN ROUTES */}
      <Route path="/librarian" element={<ProtectedRoute allowedRoles={['librarian', 'super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Placeholder title="Librarian Dashboard" />} />
          <Route path="library" element={<Library />} />
        </Route>
      </Route>

      {/* SUPER ADMIN SPECIFIC ROUTE */}
      <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super-admin']} />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
      
      {/* Catch-all route to redirect unauthorized/unknown paths to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

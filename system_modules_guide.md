# School Management System (Campus Pilot) - Complete Module Architecture Guide

iss document mein School Management System ke sabhi **Modules, Sub-modules, Frontend Components, Backend Routes, Controllers aur Data Models** ka poora mapping bataya gaya hai taaki AI aur developers dono ko exact pata rahe ki kon sa part kahan hai.

---

## 🏗️ 1. Project Directory Structure Overview

* **Frontend Path:** `School-management-frontend/`
  * **Routes Definition:** `src/App.jsx`
  * **Sidebar Navigation & Menu Tree:** `src/components/Layout.jsx`
  * **Page Views:** `src/pages/`
  * **Reusable Components:** `src/components/`
  * **Context / Global State:** `src/context/AuthContext.jsx`, `SchoolContext.jsx`

* **Backend Path:** `School-management-backend/`
  * **Database Models (MongoDB Mongoose):** `models/`
  * **Controllers (Business Logic):** `controllers/`
  * **API Express Routes:** `routes/`
  * **Server Entry Point:** `server.js`

---

## 📊 2. Complete Module & Sub-module Mapping

### 1. 🏠 Dashboard
* **Description:** Role-based Overview Dashboards (Admin, Teacher, Student, Parent).
* **Frontend Pages:** 
  * `src/pages/dashboards/AdminDashboard.jsx` (`/admin/dashboard`)
  * `src/pages/dashboards/TeacherDashboard.jsx` (`/teacher/dashboard`)
  * `src/pages/dashboards/StudentDashboard.jsx` (`/student/dashboard`)
  * `src/pages/dashboards/ParentDashboard.jsx` (`/parent/dashboard`)
* **Backend:** `/api/stats` / `userController.js`

---

### 2. 🏢 Reception
* **Description:** Front office management for enquiries, visitors, gate passes, complaints, queries, & correspondence.
* **Sub-modules:**
  * **Enquiry:** `src/pages/reception/Enquiry.jsx` (`/reception/enquiry`)
  * **Visitor Log:** `src/pages/reception/VisitorLog.jsx` (`/reception/visitor-log`)
  * **Gate Pass:** `src/pages/reception/GatePass.jsx` (`/reception/gate-pass`)
  * **Complaint:** `src/pages/reception/Complaint.jsx` (`/reception/complaint`)
  * **Correspondence:** `src/pages/reception/Correspondence.jsx` (`/reception/correspondence`)
  * **Query:** `src/pages/reception/Query.jsx` (`/reception/query`)
* **Backend Files:**
  * **Controller:** `controllers/receptionController.js`
  * **Routes:** `routes/receptionRoutes.js`
  * **Models:** `models/Enquiry.js`, `models/Visitor.js`, `models/Complaint.js`

---

### 3. ✅ Task
* **Description:** Task assignment and tracking for staff and teachers.
* **Frontend:** `src/App.jsx` (`/task` -> `Placeholder.jsx`)
* **Backend:** Scalable task integration.

---

### 4. 🎧 Helpdesk
* **Description:** Support ticket management, FAQ knowledge base, and Helpdesk category configurations.
* **Sub-modules:**
  * **FAQ:** `src/pages/helpdesk/FAQ.jsx` (`/helpdesk/faq`)
  * **Ticket:** `src/pages/helpdesk/Ticket.jsx` (`/helpdesk/ticket`)
  * **Helpdesk Config (Categories & Priorities):** `src/pages/helpdesk/HelpdeskConfig.jsx` (`/helpdesk/config`)
* **Backend Files:**
  * **Controllers:** `controllers/faqController.js`, `controllers/ticketController.js`, `controllers/helpdeskConfigController.js`
  * **Routes:** `routes/faqRoutes.js`, `routes/ticketRoutes.js`, `routes/helpdeskConfigRoutes.js`
  * **Models:** `models/FAQ.js`, `models/FAQCategory.js`, `models/Ticket.js`, `models/TicketCategory.js`, `models/TicketPriority.js`, `models/HelpdeskConfig.js`

---

### 5. 🎓 Academic
* **Description:** Complete core academic management including Courses, Batches, Subjects, Timetables, ID Cards, Certificates, etc.
* **Sub-modules & Paths:**
  * **Department:** `src/pages/Department.jsx` (`/academic/department`)
  * **Program:** `src/pages/Program.jsx` (`/academic/program`)
  * **Session:** `src/pages/Session.jsx` (`/academic/session`)
  * **Period:** `src/pages/Period.jsx` (`/academic/period`)
  * **Division:** `src/pages/Division.jsx` (`/academic/division`)
  * **Course:** `src/pages/Course.jsx` (`/academic/course`)
  * **Batch:** `src/pages/Batch.jsx` (`/academic/batch`)
  * **Subject:** `src/pages/Subject.jsx` (`/academic/subject`)
  * **Class Timing:** `src/pages/ClassTiming.jsx` (`/academic/class-timing`)
  * **Timetable (Routine):** `src/pages/Timetable.jsx` (`/academic/routine`)
  * **Book List:** `src/pages/BookList.jsx` (`/academic/book-list`)
  * **Certificate:** `src/pages/Certificate.jsx` (`/academic/certificates`)
  * **ID Card Template & Generation:** `src/pages/IdCard.jsx` (`/academic/id-card-templates`, `/academic/id-cards`)
* **Backend Files:**
  * **Controllers:** `departmentController.js`, `programController.js`, `sessionController.js`, `periodController.js`, `divisionController.js`, `courseController.js`, `batchController.js`, `subjectController.js`, `classTimingController.js`, `timetableController.js`, `bookListController.js`, `certificateController.js`, `idCardController.js`
  * **Models:** `Department.js`, `Program.js`, `Session.js`, `Period.js`, `Division.js`, `Course.js`, `Batch.js`, `Subject.js`, `ClassTiming.js`, `Timetable.js`, `BookList.js`, `Certificate.js`, `CertificateTemplate.js`, `IdCardTemplate.js`

---

### 6. 👨‍🎓 Student
* **Description:** Student lifecycle management from admission to attendance, fee allocation, service request, promotion, & profile edit requests.
* **Sub-modules & Paths:**
  * **Students Directory:** `src/pages/Students.jsx` (`/students`)
  * **Registration / Add Student:** `src/pages/students/AddStudent.jsx` (`/students/add`)
  * **Student Profile:** `src/pages/students/StudentProfile.jsx` (`/students/:id`)
  * **Roll Number:** `src/pages/students/RollNumber.jsx` (`/students/roll-number`)
  * **Photo Upload:** `src/pages/students/Photo.jsx` (`/students/photo`)
  * **Health Record:** `src/pages/students/HealthRecord.jsx` (`/students/health-record`)
  * **Elective Subject:** `src/pages/students/ElectiveSubject.jsx` (`/students/elective-subject`)
  * **Attendance:** `src/pages/students/Attendance.jsx` (`/students/attendance`)
  * **Fee Allocation:** `src/pages/students/FeeAllocation.jsx` (`/students/fee-allocation`)
  * **Service Allocation:** `src/pages/students/ServiceAllocation.jsx` (`/students/service-allocation`)
  * **Promotion:** `src/pages/students/Promotion.jsx` (`/students/promotion`)
  * **Edit Request:** `src/pages/students/EditRequests.jsx` (`/students/edit-request`)
  * **Service Request:** `src/pages/students/ServiceRequest.jsx` (`/students/service-request`)
  * **Config:** `src/pages/students/StudentConfig.jsx` (`/students/config`)
  * **Leave/Transfer/Alumni/Report:** Routed to dynamic placeholders/components in `App.jsx`
* **Backend Files:**
  * **Controllers:** `studentController.js`, `editRequestController.js`, `serviceRequestController.js`, `studentConfigController.js`, `healthController.js`
  * **Models:** `Student.js`, `EditRequest.js`, `ServiceRequest.js`, `StudentConfig.js`, `StudentConfigOption.js`, `HealthRecord.js`

---

### 7. 💳 Finance
* **Description:** Fee structures, payment methods, ledgers, transactions, receipts, and financial reporting.
* **Frontend Pages:** `src/pages/Fees.jsx` (`/fees`), `src/pages/Accounts.jsx` (`/accounts`), sub-routes mapped to `Placeholder.jsx` for granular views.
* **Backend Files:** `controllers/feeController.js`, `controllers/accountController.js`, `models/Fee.js`, `models/Account.js`

---

### 8. 📝 Exam
* **Description:** Exam creation, schedules, grades, admit card generation, online exams, and report cards.
* **Frontend Page:** `src/pages/Examinations.jsx` (`/examinations`) & exam sub-routes in `App.jsx`.
* **Backend Files:** `controllers/examinationController.js`, `models/Examination.js`.

---

### 9. 👔 Employee (HRM & Staff)
* **Description:** Staff directory, attendance, leaves, payroll, & designation configuration.
* **Sub-modules & Paths:**
  * **Employees / Teachers:** `src/pages/Teachers.jsx` (`/teachers`) & `AddTeacher.jsx`, `TeacherProfile.jsx`
  * **Attendance:** `src/pages/Attendance.jsx` (`/attendance`)
  * **Leave:** `src/pages/Leaves.jsx` (`/leaves`)
  * **HRM Overview:** `src/pages/HRM.jsx` (`/hrm`)
* **Backend Files:** `controllers/teacherController.js`, `controllers/attendanceController.js`, `controllers/leaveController.js`, `controllers/hrmController.js`, `models/Teacher.js`, `models/Attendance.js`, `models/Leave.js`, `models/HRM.js`.

---

### 10. 📁 Resource
* **Description:** Learning resources, syllabus, lesson plans, assignments, student diary, & downloads.
* **Frontend Pages:** `src/pages/Library.jsx` (`/library`), `src/pages/DownloadFormat.jsx` (`/download-format`).
* **Backend Files:** `controllers/importController.js` (bulk template downloads), `controllers/libraryController.js`.

---

### 11. 🚚 Transport
* **Description:** Transport routes, vehicle management, circles, & transport fees.
* **Frontend:** Sub-routes under `/transport/*` in `App.jsx`.

---

### 12. 📅 Calendar
* **Description:** School calendar management (Holidays, Celebrations, Events).
* **Frontend Page:** `src/pages/CalendarManager.jsx` (`/calendar/holiday`, `/calendar/celebration`, `/calendar/event`), `src/pages/Event.jsx`.
* **Backend Files:** `controllers/eventController.js`, `models/Event.js`.

---

### 13. 📢 Notice Board
* **Description:** School-wide notices, announcements, and push notifications.
* **Frontend Page:** `src/pages/NoticeBoard.jsx` (`/notice-board`).
* **Backend Files:** `controllers/noticeController.js`, `models/Notice.js`.

---

### 14. 🖼️ Gallery
* **Description:** School photo and video event gallery.
* **Frontend:** Routed under `/gallery`.

---

### 15. 📦 Inventory & Store 🛒
* **Description:** Vendors, item categories, stock, requisitions, purchases, returns, & store sales.
* **Frontend:** Sub-routes under `/inventory/*` and `/store/*` in `App.jsx`.

---

### 16. ✍️ Blog & News 📰
* **Description:** Article publishing, school news, and updates.
* **Frontend:** Routed under `/blog` and `/news`.

---

### 17. 🛡️ Discipline
* **Description:** Student discipline incident logging and actions.
* **Frontend:** Routed under `/discipline/incident`.

---

### 18. 👨‍👩‍👧 Guardian
* **Description:** Parent and guardian directory, linkage with students, & contact details.
* **Frontend Pages:**
  * **List:** `src/pages/guardians/GuardiansList.jsx` (`/guardians`)
  * **Add:** `src/pages/guardians/AddGuardian.jsx` (`/guardians/add`)
  * **Edit:** `src/pages/guardians/EditGuardian.jsx` (`/guardians/edit/:id`)
  * **Details:** `src/pages/guardians/GuardianDetails.jsx` (`/guardians/:id`)
* **Backend Files:** `controllers/guardianController.js`, `models/Guardian.js`.

---

### 19. ✔️ Approval
* **Description:** Workflow approvals (Approval types, pending requests, processed requests).
* **Frontend:** Sub-routes under `/approval/*`.

---

### 20. 📞 Contact & Mess 🍲
* **Description:** School contact directory & mess menu/meal logging.
* **Frontend:** Mapped under `/contact` and `/mess/*`.

---

### 21. 💬 Communication
* **Description:** Multi-channel broadcast messages (Email, SMS, WhatsApp, Push Notifications).
* **Frontend Page:** `src/pages/Message.jsx` (`/message`) & `/communication/*`.
* **Backend Files:** `controllers/messageController.js`, `models/Message.js`.

---

### 22. 📚 Library
* **Description:** Book collection management, book issue/returns, and library reports.
* **Frontend Page:** `src/pages/Library.jsx` (`/library`).
* **Backend Files:** `controllers/libraryController.js`, `models/Library.js`.

---

### 23. 🏕️ Activity, Hostel & Asset
* **Description:** Educational trips, hostel building room allocation, and campus physical asset tracking.
* **Frontend:** Mapped under `/activity/*`, `/hostel/*`, `/asset/*`.

---

### 24. 🌐 Site & Recruitment
* **Description:** Public website management (pages, menus, blocks) & HR recruitment (jobs, candidates, interviews).
* **Frontend:** Mapped under `/site/*`, `/recruitment/*`.

---

### 25. ⚙️ Configuration, Custom Field & Config
* **Description:** System-wide settings, tenant branding, dynamic custom fields, role permissions, authentication, & notification setup.
* **Frontend Pages:**
  * **General Settings:** `src/pages/Settings.jsx` (`/settings`, `/admin/general-config`)
  * **Roles Management:** `src/pages/Roles.jsx` (`/roles`)
  * **Users Management:** `src/pages/Users.jsx` (`/users`)
  * **User Credentials (Super Admin):** `src/pages/super-admin/UserCredentials.jsx` (`/admin/credentials`)
  * **Module Config (Super Admin):** `src/pages/super-admin/ModuleConfig.jsx` (`/admin/module-config`)
  * **Organization & School Multi-Tenant:** `src/pages/Organization.jsx`, `src/pages/School.jsx`
* **Backend Files:**
  * **Controllers:** `settingsController.js`, `userController.js`, `schoolController.js`, `organizationController.js`, `authController.js`
  * **Models:** `Settings.js`, `User.js`, `School.js`, `Organization.js`

---

### 26. 📜 Utility & Activity Log
* **Description:** System activity logs, audit trails, and background utility configs.
* **Frontend Page:** `src/pages/ActivityLog.jsx` (`/utility/activity-log`).
* **Backend Files:** `controllers/activityLogController.js`, `models/ActivityLog.js`.

---

### 27. 🚪 Log Out
* **Description:** Session cleanup and redirect to login page.
* **Implementation:** Handled globally in `src/components/Layout.jsx` via `AuthContext.jsx` (`logout()` function).

---

## 🤖 Summary for AI Copilot Training

When performing any code changes, bug fixes, or feature additions:
1. **Frontend Navigation & Permissions:** Checked and loaded from `src/components/Layout.jsx` & `src/App.jsx`.
2. **Backend API Controllers & Models:** Located in `School-management-backend/controllers/` and `School-management-backend/models/`.
3. **Design Standard:** Dark/Light mode theme integration, custom tailwind/CSS styling, and unified header topbar search (`searchController.js`).

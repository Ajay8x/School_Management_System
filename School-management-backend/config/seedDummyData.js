const mongoose = require('mongoose');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Notice = require('../models/Notice');
const Class = require('../models/Class');
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const School = require('../models/School');
const { defaultModulesConfig } = require('../models/School');

const seedSchools = async () => {
  try {
    const schoolCount = await School.countDocuments();
    if (schoolCount === 0) {
      console.log('Seeding initial schools...');
      const initialSchools = [
        { name: 'Demo International School', code: 'DIS001', isDefault: true, tagline: 'Empowering Young Minds', address: '123 Education Boulevard', phone: '+91 98765 43210', email: 'contact@demointernational.edu', modules: defaultModulesConfig },
        { name: 'Campus Pilot School', code: 'CTS002', isDefault: false, tagline: 'Inspiring Future Leaders', address: '45 Knowledge Park', phone: '+91 98765 43211', email: 'info@campuspilot.edu', modules: defaultModulesConfig },
        { name: 'BPS School Bhadoi', code: 'BPS003', isDefault: false, tagline: 'Knowledge, Character, Success', address: 'Station Road, Bhadohi', phone: '+91 98765 43212', email: 'office@bpsbhadoi.org', modules: defaultModulesConfig },
        { name: 'Lions School Mirzapur', code: 'LSM004', isDefault: false, tagline: 'Service and Excellence', address: 'Civil Lines, Mirzapur', phone: '+91 98765 43213', email: 'admin@lionsmirzapur.org', modules: defaultModulesConfig },
        { name: 'Shubham Model School', code: 'SMS005', isDefault: false, tagline: 'Building Strong Foundations', address: 'Varanasi Highway', phone: '+91 98765 43214', email: 'shubhammodel@edu.org', modules: defaultModulesConfig },
        { name: 'SS PUBLIC SCHOOL', code: 'SSPS006', isDefault: false, tagline: 'Towards Higher Horizon', address: 'Ring Road Branch', phone: '+91 98765 43215', email: 'info@sspublicschool.com', modules: defaultModulesConfig },
        { name: 'HMS', code: 'HMS007', isDefault: false, tagline: 'Modern Educational Excellence', address: 'City Centre Campus', phone: '+91 98765 43216', email: 'helpdesk@hmsedu.in', modules: defaultModulesConfig },
        { name: 'INDIAN PUBLIC SCHOOL', code: 'IPS008', isDefault: false, tagline: 'Values and Global Vision', address: 'GT Road Campus', phone: '+91 98765 43217', email: 'admissions@indianpublic.edu', modules: defaultModulesConfig },
        { name: 'Kids Ocean School', code: 'KOS009', isDefault: false, tagline: 'Nurturing Tiny Explorers', address: 'Green View Lane', phone: '+91 98765 43218', email: 'kids@oceanedu.com', modules: defaultModulesConfig },
        { name: 'Dhruv Public School', code: 'DPS010', isDefault: false, tagline: 'Excellence in Every Step', address: 'Nehru Nagar Branch', phone: '+91 98765 43219', email: 'dhruvpublic@school.in', modules: defaultModulesConfig }
      ];

      await School.insertMany(initialSchools);
      console.log('Seeded 10 default schools successfully.');
    }
  } catch (error) {
    console.error('Error seeding schools:', error);
  }
};

const seedDummyData = async () => {
  try {
    await seedSchools();

    // Only seed if the database is essentially empty (checking Students as a proxy)
    const studentCount = await Student.countDocuments();
    if (studentCount > 0) {
      return; // DB already has data, do nothing
    }

    console.log('Database is empty. Seeding default dummy data...');

    // 1. Seed Classes
    const classes = await Class.insertMany([
      { name: 'Class 1', section: 'A' },
      { name: 'Class 2', section: 'A' },
      { name: 'Class 3', section: 'A' }
    ]);

    // 2. Seed Teachers
    const teachers = await Teacher.insertMany([
      { name: 'Rajesh Sharma', employeeId: 'EMP001', subject: 'Mathematics', contact: '9876543210', gender: 'Male', email: 'rajesh@school.local' },
      { name: 'Priya Verma', employeeId: 'EMP002', subject: 'English', contact: '9876543211', gender: 'Female', email: 'priya@school.local' },
      { name: 'Amit Kumar', employeeId: 'EMP003', subject: 'Science', contact: '9876543212', gender: 'Male', email: 'amit@school.local' }
    ]);

    // Create User accounts for Teachers
    for (let t of teachers) {
      await User.create({
        name: t.name,
        email: t.email,
        password: 'password123',
        role: 'teacher'
      });
    }

    // 3. Seed Students
    const students = await Student.insertMany([
      { name: 'Aarav Kumar', rollNumber: 'R001', className: 'Class 1', section: 'A', gender: 'Male', contact: '9000000001', email: 'aarav@campuspilot.local' },
      { name: 'Diya Singh', rollNumber: 'R002', className: 'Class 1', section: 'A', gender: 'Female', contact: '9000000002', email: 'diya@campuspilot.local' },
      { name: 'Rohan Gupta', rollNumber: 'R003', className: 'Class 2', section: 'A', gender: 'Male', contact: '9000000003', email: 'rohan@campuspilot.local' },
      { name: 'Sanya Sharma', rollNumber: 'R004', className: 'Class 3', section: 'A', gender: 'Female', contact: '9000000004', email: 'sanya@campuspilot.local' }
    ]);

    // Create User accounts for Students
    for (let s of students) {
      await User.create({
        name: s.name,
        email: s.email,
        password: s.rollNumber,
        role: 'student',
        studentId: s._id
      });
    }

    // 4. Seed Guardians
    await Guardian.insertMany([
      { name: 'Mr. Kumar', relation: 'Father', contact: '9000000001', students: [students[0]._id] },
      { name: 'Mr. Singh', relation: 'Father', contact: '9000000002', students: [students[1]._id] }
    ]);

    // 5. Seed Notices
    await Notice.insertMany([
      { title: 'Welcome to the New Academic Year', content: 'We are excited to welcome all students back to school. Let\'s make this year great!', date: new Date(), role: 'all' },
      { title: 'Upcoming Parent-Teacher Meeting', content: 'A reminder that the PTM is scheduled for next Friday.', date: new Date(), role: 'all' }
    ]);

    // 6. Seed Events, Holidays, and Celebrations
    const EventModel = require('../models/Event');
    await EventModel.insertMany([
      {
        title: 'Independence Day Celebration',
        type: 'celebration',
        description: 'Flag hoisting ceremony followed by cultural performances by students.',
        date: new Date('2026-08-15'),
        location: 'Main School Auditorium',
        targetAudience: 'all',
        status: 'ongoing',
        organizer: 'Cultural Committee'
      },
      {
        title: 'Annual Sports Day 2026',
        type: 'event',
        description: 'Track and field events, relay races, and award distribution.',
        date: new Date('2026-09-10'),
        endDate: new Date('2026-09-12'),
        location: 'School Sports Ground',
        targetAudience: 'all',
        status: 'upcoming',
        organizer: 'Sports Department'
      },
      {
        title: 'Mahatma Gandhi Jayanti',
        type: 'holiday',
        description: 'National holiday observing Gandhi Jayanti. School remains closed.',
        date: new Date('2026-10-02'),
        location: 'N/A',
        targetAudience: 'all',
        status: 'upcoming',
        organizer: 'Administration'
      },
      {
        title: 'Teacher\'s Day Celebration',
        type: 'celebration',
        description: 'Special student-led performances honoring teachers and educators.',
        date: new Date('2026-09-05'),
        location: 'School Auditorium',
        targetAudience: 'teachers',
        status: 'upcoming',
        organizer: 'Student Council'
      },
      {
        title: 'Science Fair & Innovation Expo',
        type: 'event',
        description: 'Inter-school science competition and robotics project showcase.',
        date: new Date('2026-11-14'),
        location: 'Science Block',
        targetAudience: 'students',
        status: 'upcoming',
        organizer: 'Science Department'
      }
    ]);


    const ClassTiming = require('../models/ClassTiming');
    const timingCount = await ClassTiming.countDocuments();
    if (timingCount === 0) {
      console.log('Seeding initial class timings...');
      const sampleSessions = [
        { session: '1st Period', code: 'P1', isBreak: false, startTime: '08:00 AM', endTime: '08:35 AM' },
        { session: '2nd Period', code: 'P2', isBreak: false, startTime: '08:35 AM', endTime: '09:10 AM' },
        { session: 'Short Break', code: 'BRK1', isBreak: true, startTime: '09:10 AM', endTime: '09:25 AM' },
        { session: '3rd Period', code: 'P3', isBreak: false, startTime: '09:25 AM', endTime: '10:00 AM' },
        { session: '4th Period', code: 'P4', isBreak: false, startTime: '10:00 AM', endTime: '10:35 AM' },
        { session: 'Lunch Break', code: 'LUNCH', isBreak: true, startTime: '10:35 AM', endTime: '11:05 AM' },
        { session: '5th Period', code: 'P5', isBreak: false, startTime: '11:05 AM', endTime: '11:40 AM' },
        { session: '6th Period', code: 'P6', isBreak: false, startTime: '11:40 AM', endTime: '12:10 PM' },
        { session: '7th Period', code: 'P7', isBreak: false, startTime: '12:10 PM', endTime: '12:25 PM' },
        { session: '8th Period', code: 'P8', isBreak: false, startTime: '12:25 PM', endTime: '12:40 PM' }
      ];

      const timingList = [
        { sessionName: 'XII (C) 2025-26', description: 'Standard Senior Secondary Timing' },
        { sessionName: 'XII (B) 2025-26', description: 'Standard Senior Secondary Timing' },
        { sessionName: 'XII (A) 2025-26', description: 'Standard Senior Secondary Timing' },
        { sessionName: 'XI (C) 2025-26', description: 'Senior Secondary Timing' },
        { sessionName: 'XI (B) 2025-26', description: 'Senior Secondary Timing' },
        { sessionName: 'XI (A) 2025-26', description: 'Senior Secondary Timing' },
        { sessionName: 'X (A) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'X (B) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'X (C) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'IX (C) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'IX (B) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'IX (A) 2025-26', description: 'Secondary Section Class Timing' },
        { sessionName: 'VIII (C) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VIII (B) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VIII (A) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VII (C) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VII (B) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VII (A) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VI (C) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VI (B) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'VI (A) 2025-26', description: 'Middle Section Class Timing' },
        { sessionName: 'V (C) 2025-26', description: 'Primary Section Class Timing' },
        { sessionName: 'V (B) 2025-26', description: 'Primary Section Class Timing' },
        { sessionName: 'V (A) 2025-26', description: 'Primary Section Class Timing' },
        { sessionName: 'IV (C) 2025-26', description: 'Primary Section Class Timing' }
      ];

      for (let t of timingList) {
        await ClassTiming.create({
          sessionName: t.sessionName,
          description: t.description,
          sessions: sampleSessions,
          totalDurationText: '4 hour(s) 40 minute(s)',
          timeRangeText: '8:00 AM - 12:40 PM',
          sessionCount: 8,
          breakCount: 2,
          createdAt: new Date('2025-02-11T10:14:00.000Z')
        });
      }
      console.log('Seeded initial Class Timings successfully.');
    }

    // Seed Certificate Templates & Certificates if empty
    const CertificateTemplate = require('../models/CertificateTemplate');
    const Certificate = require('../models/Certificate');
    
    const templateCount = await CertificateTemplate.countDocuments();
    if (templateCount === 0) {
      console.log('Seeding initial Certificate Templates...');
      const templatesData = [
        { name: 'Transfer Certificate', type: 'Transfer Certificate', applicableFor: 'Student', headerText: 'TRANSFER CERTIFICATE', subHeader: 'TO WHOM IT MAY CONCERN', bodyText: 'This is to certify that {{student_name}}, son/daughter of {{father_name}}, was a student of this institution in Class {{class_name}} during the academic session. His/Her conduct and character during the stay in the school has been good.', createdAt: new Date('2025-06-16T11:07:00Z') },
        { name: 'Birth Certificate', type: 'Other', applicableFor: 'Student', headerText: 'BIRTH CERTIFICATE', subHeader: 'CERTIFICATE OF BIRTH', bodyText: 'This is to certify that according to the school records, the date of birth of {{student_name}} is {{dob}}.', createdAt: new Date('2025-04-19T16:04:00Z') },
        { name: 'Bonafide Certificate', type: 'Other', applicableFor: 'Student', headerText: 'BONAFIDE CERTIFICATE', subHeader: 'TO WHOM IT MAY CONCERN', bodyText: 'This is to certify that {{student_name}} is a bonafide student of this institution studying in Class {{class_name}}.', createdAt: new Date('2025-04-19T15:57:00Z') },
        { name: 'Character Certificate', type: 'Other', applicableFor: 'Student', headerText: 'CHARACTER CERTIFICATE', subHeader: 'TO WHOM IT MAY CONCERN', bodyText: 'This is to certify that {{student_name}} bears an exemplary moral character and good general behavior.', createdAt: new Date('2025-03-06T13:22:00Z') },
        { name: 'Transfer Certificate', type: 'Transfer Certificate', applicableFor: 'Student', headerText: 'TRANSFER CERTIFICATE', subHeader: 'TO WHOM IT MAY CONCERN', bodyText: 'This is to certify that {{student_name}} has completed studies in this school.', createdAt: new Date('2025-02-26T16:10:00Z') }
      ];
      await CertificateTemplate.insertMany(templatesData);
      console.log('Seeded Certificate Templates successfully.');
    }

    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      console.log('Seeding initial Certificates...');
      const createdTemplates = await CertificateTemplate.find();
      const tcTpl = createdTemplates.find(t => t.name === 'Transfer Certificate') || createdTemplates[0];
      const birthTpl = createdTemplates.find(t => t.name === 'Birth Certificate') || createdTemplates[0];
      const charTpl = createdTemplates.find(t => t.name === 'Character Certificate') || createdTemplates[0];

      const certificatesData = [
        { certificateNo: 'TC-22003', templateId: tcTpl?._id, templateName: 'Transfer Certificate', applicableFor: 'Student', toName: 'Anam Pandey', toCode: 'SM007', date: new Date('2026-01-15'), createdBy: '-', createdAt: new Date('2026-01-15T12:57:00Z') },
        { certificateNo: 'BTHC001', templateId: birthTpl?._id, templateName: 'Birth Certificate', applicableFor: 'Student', toName: 'Shriti Tripathi', toCode: 'SM004', date: new Date('2025-11-10'), createdBy: '-', createdAt: new Date('2025-11-10T14:24:00Z') },
        { certificateNo: 'TC-2526004', templateId: tcTpl?._id, templateName: 'Transfer Certificate', applicableFor: 'Student', toName: 'Shriti Tripathi', toCode: 'SM004', date: new Date('2025-06-16'), createdBy: '-', createdAt: new Date('2025-06-16T06:31:00Z') },
        { certificateNo: 'TC-2526003', templateId: tcTpl?._id, templateName: 'Transfer Certificate', applicableFor: 'Student', toName: 'Aarna Inaaya Contractor', toCode: 'SM212', date: new Date('2025-05-29'), createdBy: '-', createdAt: new Date('2025-06-05T12:55:00Z') },
        { certificateNo: 'TC-2526002', templateId: tcTpl?._id, templateName: 'Transfer Certificate', applicableFor: 'Student', toName: 'Aaina Rohan Choudhary', toCode: 'SM158', date: new Date('2025-04-09'), createdBy: '-', createdAt: new Date('2025-04-09T17:38:00Z') },
        { certificateNo: 'CC001', templateId: charTpl?._id, templateName: 'Character Certificate', applicableFor: 'Student', toName: 'Aaina Rohan Choudhary', toCode: 'SM158', date: new Date('2025-03-06'), createdBy: '-', createdAt: new Date('2025-03-06T13:25:00Z') },
        { certificateNo: 'TC-2526001', templateId: tcTpl?._id, templateName: 'Transfer Certificate', applicableFor: 'Student', toName: 'Anam Pandey', toCode: 'SM007', date: new Date('2025-02-26'), createdBy: '-', createdAt: new Date('2025-02-26T16:10:00Z') }
      ];
      await Certificate.insertMany(certificatesData);
      console.log('Seeded Certificates successfully.');
    }

    // Seed ID Card Templates if empty
    const IdCardTemplate = require('../models/IdCardTemplate');
    const idCardTplCount = await IdCardTemplate.countDocuments();
    if (idCardTplCount === 0) {
      console.log('Seeding initial ID Card Templates...');
      const idCardTemplates = [
        {
          name: 'IDCARD1',
          for: 'Student',
          customTemplateFileName: 'IDCARD1new',
          layout: 'Portrait',
          headerBgColor: '#0f172a',
          headerTextColor: '#ffffff',
          cardBgColor: '#ffffff',
          schoolTitle: 'ROYAL INTERNATIONAL ACADEMY',
          subTitle: 'STUDENT IDENTITY CARD',
          showLogo: true,
          showPhoto: true,
          showRollNo: true,
          showClassCourse: true,
          showBatchSection: true,
          showDob: true,
          showBloodGroup: true,
          showPhone: true,
          showEmergencyContact: true,
          showAddress: true,
          showBarcode: true,
          showSignature: true,
          signatureTitle: 'Principal',
          createdAt: new Date('2025-02-10T17:45:00Z')
        },
        {
          name: 'Vikrant Verma',
          for: 'Student',
          customTemplateFileName: 'vikrant',
          layout: 'Landscape',
          headerBgColor: '#1e293b',
          headerTextColor: '#38bdf8',
          cardBgColor: '#ffffff',
          schoolTitle: 'DEMO INTERNATIONAL SCHOOL',
          subTitle: 'OFFICIAL ID PASS',
          showLogo: true,
          showPhoto: true,
          showRollNo: true,
          showClassCourse: true,
          showBatchSection: true,
          showDob: true,
          showBloodGroup: true,
          showPhone: true,
          showEmergencyContact: true,
          showAddress: true,
          showBarcode: true,
          showSignature: true,
          signatureTitle: 'Authorized Signatory',
          createdAt: new Date('2026-03-02T11:49:00Z')
        }
      ];
      await IdCardTemplate.insertMany(idCardTemplates);
      console.log('Seeded ID Card Templates successfully.');
    }

    // Seed Edit Requests if empty
    const EditRequest = require('../models/EditRequest');
    const editReqCount = await EditRequest.countDocuments();
    if (editReqCount === 0) {
      console.log('Seeding initial Edit Requests...');
      const sampleEditRequests = [
        {
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi / Anamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          birthDate: 'December 5, 2000',
          requestBy: 'Ritisha Tripathi',
          bloodGroup: 'O+',
          status: 'Rejected',
          rejectionReason: 'bb',
          attachment: null,
          createdAt: new Date('2025-12-04T18:51:00Z'),
          lastUpdatedAt: new Date('2026-02-02T13:20:00Z')
        },
        {
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi / Anamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          birthDate: 'December 5, 2000',
          requestBy: 'Ritisha Tripathi',
          bloodGroup: 'O+',
          status: 'Approved',
          rejectionReason: '',
          attachment: {
            fileName: 'IMG-20250711-WA0005.jpg',
            fileSize: '103.97 KB',
            url: '#'
          },
          createdAt: new Date('2025-07-11T07:45:00Z'),
          lastUpdatedAt: new Date('2025-07-13T10:17:00Z')
        },
        {
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi / Anamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          birthDate: 'December 5, 2000',
          requestBy: 'Ritisha Tripathi',
          bloodGroup: 'O+',
          status: 'Approved',
          rejectionReason: '',
          attachment: null,
          createdAt: new Date('2025-07-11T07:14:00Z'),
          lastUpdatedAt: new Date('2025-07-11T07:14:00Z')
        },
        {
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi / Anamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          birthDate: 'December 5, 2000',
          requestBy: 'Ritisha Tripathi',
          bloodGroup: 'O+',
          status: 'Approved',
          rejectionReason: '',
          attachment: null,
          createdAt: new Date('2025-07-10T13:16:00Z'),
          lastUpdatedAt: new Date('2025-07-10T13:16:00Z')
        }
      ];

      await EditRequest.insertMany(sampleEditRequests);
      console.log('Seeded initial Edit Requests successfully.');
    }

    // Seed Service Requests if empty
    const ServiceRequest = require('../models/ServiceRequest');
    const srCount = await ServiceRequest.countDocuments();
    if (srCount === 0) {
      console.log('Seeding initial Service Requests...');
      const sampleServiceRequests = [
        {
          codeNumber: 'SR002',
          studentName: 'May 27, 2026',
          parentName: 'Transport Khaira',
          dateOfAdmission: 'Opt In',
          admissionNumber: '',
          course: 'Approved',
          date: new Date('2026-05-27T09:58:00Z'),
          type: 'Transport',
          requestType: 'Opt In',
          status: 'Approved',
          createdAt: new Date('2026-05-27T09:58:00Z')
        },
        {
          codeNumber: 'SR001',
          studentName: 'April 20, 2026',
          parentName: 'Transport Khaira',
          dateOfAdmission: 'Opt In',
          admissionNumber: '',
          course: 'Requested',
          date: new Date('2026-04-20T13:13:00Z'),
          type: 'Transport',
          requestType: 'Opt In',
          status: 'Requested',
          createdAt: new Date('2026-04-20T13:13:00Z')
        },
        {
          codeNumber: 'SR006',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2026-01-15T00:00:00Z'),
          type: 'Mess',
          requestType: 'Opt In',
          status: 'Approved',
          createdAt: new Date('2026-01-15T12:39:00Z')
        },
        {
          codeNumber: 'SR005',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2025-12-04T00:00:00Z'),
          type: 'Transport\nDlw',
          requestType: 'Opt In',
          status: 'Approved',
          createdAt: new Date('2025-12-04T18:59:00Z')
        },
        {
          codeNumber: 'SR004',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2025-11-29T00:00:00Z'),
          type: 'Hostel',
          requestType: 'Opt In',
          status: 'Approved',
          createdAt: new Date('2025-11-28T18:29:00Z')
        },
        {
          codeNumber: 'SR002',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2025-07-12T00:00:00Z'),
          type: 'Mess',
          requestType: 'Opt In',
          status: 'Requested',
          createdAt: new Date('2025-07-09T15:04:00Z')
        },
        {
          codeNumber: 'SR001',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2025-07-10T00:00:00Z'),
          type: 'Transport\nCentral Avenue',
          requestType: 'Opt In',
          status: 'Approved',
          createdAt: new Date('2025-07-09T15:02:00Z')
        },
        {
          codeNumber: 'SR003',
          studentName: 'Ritisha Tripathi',
          contact: '9935332556',
          fatherName: 'Hariom Tripathi',
          motherName: 'Anamika Tripathi',
          parentName: 'Hariom Tripathi\nAnamika Tripathi',
          dateOfAdmission: 'February 8, 2025',
          admissionNumber: 'SM001',
          course: 'IX',
          section: 'Section A',
          date: new Date('2025-07-10T00:00:00Z'),
          type: 'Hostel',
          requestType: 'Opt In',
          status: 'Requested',
          createdAt: new Date('2025-07-10T08:20:00Z')
        }
      ];

      await ServiceRequest.insertMany(sampleServiceRequests);
      console.log('Seeded initial Service Requests successfully.');
    }

    console.log('Dummy data seeded successfully.');



  } catch (error) {
    console.error('Error seeding dummy data:', error);
  }
};


module.exports = seedDummyData;



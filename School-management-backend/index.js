const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDummyData = require('./config/seedDummyData');
const User = require('./models/User');
const schoolMiddleware = require('./middlewares/schoolMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Seed Admins
const seedAdmins = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (superAdminEmail && superAdminPassword) {
      const superAdminExists = await User.findOne({ email: superAdminEmail });
      if (!superAdminExists) {
        await User.create({
          name: 'Super Admin',
          email: superAdminEmail,
          password: superAdminPassword,
          role: 'super-admin'
        });
        console.log('Super Admin seeded successfully from .env');
      }
    }

    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({
          name: 'Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
        });
        console.log('Admin seeded successfully from .env');
      }
    }
  } catch (error) {
    console.error('Failed to seed admins:', error);
  }
};

seedAdmins();
seedDummyData();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(schoolMiddleware); // Attach req.schoolId from X-School-ID header

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/guardians', require('./routes/guardianRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// New Modules
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/examinations', require('./routes/examinationRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/libraries', require('./routes/libraryRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/hrms', require('./routes/hrmRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/health-records', require('./routes/healthRoutes'));
app.use('/api/reception', require('./routes/receptionRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('School Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

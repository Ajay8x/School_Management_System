const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

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

// Basic route
app.get('/', (req, res) => {
  res.send('School Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

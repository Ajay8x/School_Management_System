const mongoose = require('mongoose');
const Course = require('../models/Course');
const CourseIncharge = require('../models/CourseIncharge');
const EnrollmentSeat = require('../models/EnrollmentSeat');
const { logActivity } = require('../utils/logActivity');

const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && id !== 'null' && id !== 'undefined' && id !== '';

// @desc    Get all courses (auto-seed if empty)
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    let courses = await Course.find(filter).sort({ sortOrder: 1, createdAt: 1 });

    if (courses.length === 0) {
      try {
        const seedData = [
          {
            name: 'XII',
            division: 'Senior Secondary',
            divisionSub: 'Senior Secondary',
            code: 'Ms',
            shortCode: 'Ms',
            incharge: 'Kalpana Comar',
            inchargeDates: 'November 4, 2025 to November 4, 2026',
            batches: [],
            subjects: [],
            registration: false,
            sortOrder: 1,
            createdAt: new Date('2025-11-04T11:22:00')
          },
          {
            name: 'Nursery (NUR)',
            feeAmount: 100,
            division: 'Pre Primary',
            divisionSub: 'Senior Secondary',
            code: 'NUR',
            shortCode: 'NUR',
            incharge: '-',
            batches: ['Section A', 'Section B', 'Section C'],
            subjects: ['COMPUTER', 'HINDI', 'ARTS and CRAFTS', 'MUSIC', 'EVS', 'RHYMES and STORIES', 'English', 'Conclusion', 'Art'],
            registration: true,
            sortOrder: 2,
            createdAt: new Date('2025-02-07T23:33:00')
          },
          {
            name: 'LKG (LKG)',
            feeAmount: 100,
            division: 'Pre Primary',
            divisionSub: 'Senior Secondary',
            code: 'LKG',
            shortCode: 'LKG',
            incharge: 'Attendance Incharge',
            inchargeDates: 'November 4, 2025 to November 14, 2026',
            batches: ['Section A', 'Section B', 'Section C'],
            subjects: ['English', 'Art and Carft', 'Conclusion', 'MUSIC'],
            registration: true,
            sortOrder: 3,
            createdAt: new Date('2025-02-10T14:14:00')
          },
          {
            name: 'UKG (UKG)',
            feeAmount: 100,
            division: 'Pre Primary',
            divisionSub: 'Senior Secondary',
            code: 'UKG',
            shortCode: 'UKG',
            incharge: '-',
            batches: ['Section A', 'Section B', 'Section C'],
            subjects: ['English', 'Art and Carft', 'Conclusion', 'MUSIC'],
            registration: true,
            sortOrder: 4,
            createdAt: new Date('2025-02-10T14:15:00')
          },
          {
            name: 'Lkg',
            feeAmount: 100,
            division: 'Pre Primary',
            divisionSub: 'Senior Secondary',
            code: 'pp',
            shortCode: 'pp',
            incharge: '-',
            batches: [],
            subjects: [],
            registration: true,
            sortOrder: 5,
            createdAt: new Date('2025-10-23T13:55:00')
          },
          {
            name: 'I (I)',
            feeAmount: 100,
            division: 'Primary',
            divisionSub: 'Senior Secondary',
            code: 'I',
            shortCode: 'I',
            incharge: '-',
            batches: ['Section A', 'Section B', 'Section C'],
            subjects: ['Computer Science', 'Art and Carft', 'Environment Science', 'Basic Mathematics', 'HINDI', 'MATHS', 'English', 'Conclusion', 'MUSIC'],
            registration: true,
            sortOrder: 6,
            createdAt: new Date('2025-02-10T14:16:00')
          },
          {
            name: 'II',
            feeAmount: 100,
            division: 'Primary',
            divisionSub: 'Senior Secondary',
            code: 'II',
            shortCode: 'II',
            incharge: '-',
            batches: ['Section A', 'Section B'],
            subjects: ['English', 'MATHS', 'HINDI', 'EVS'],
            registration: true,
            sortOrder: 7,
            createdAt: new Date('2025-02-10T14:17:00')
          },
          {
            name: 'III',
            feeAmount: 100,
            division: 'Primary',
            divisionSub: 'Senior Secondary',
            code: 'III',
            shortCode: 'III',
            incharge: '-',
            batches: ['Section A', 'Section B'],
            subjects: ['English', 'MATHS', 'HINDI', 'Science'],
            registration: true,
            sortOrder: 8,
            createdAt: new Date('2025-02-10T14:18:00')
          },
          {
            name: 'IV',
            feeAmount: 100,
            division: 'Middle',
            divisionSub: 'Senior Secondary',
            code: 'IV',
            shortCode: 'IV',
            incharge: '-',
            batches: ['Section A'],
            subjects: ['English', 'MATHS', 'Science', 'Social Studies'],
            registration: true,
            sortOrder: 9,
            createdAt: new Date('2025-02-10T14:19:00')
          },
          {
            name: 'V',
            feeAmount: 100,
            division: 'Middle',
            divisionSub: 'Senior Secondary',
            code: 'V',
            shortCode: 'V',
            incharge: '-',
            batches: ['Section A'],
            subjects: ['English', 'MATHS', 'Science', 'Social Studies'],
            registration: true,
            sortOrder: 10,
            createdAt: new Date('2025-02-10T14:20:00')
          },
          {
            name: 'VI',
            feeAmount: 100,
            division: 'Middle',
            divisionSub: 'Senior Secondary',
            code: 'VI',
            shortCode: 'VI',
            incharge: '-',
            batches: ['Section A'],
            subjects: ['English', 'MATHS', 'Science', 'Social Studies'],
            registration: true,
            sortOrder: 11,
            createdAt: new Date('2025-02-10T14:21:00')
          },
          {
            name: 'VII',
            feeAmount: 100,
            division: 'Higher Secondary',
            divisionSub: 'Senior Secondary',
            code: 'VII',
            shortCode: 'VII',
            incharge: '-',
            batches: ['Section A'],
            subjects: ['English', 'MATHS', 'Science', 'Social Studies'],
            registration: true,
            sortOrder: 12,
            createdAt: new Date('2025-02-10T14:22:00')
          },
          {
            name: 'VIII',
            feeAmount: 100,
            division: 'Higher Secondary',
            divisionSub: 'Senior Secondary',
            code: 'VIII',
            shortCode: 'VIII',
            incharge: '-',
            batches: ['Section A'],
            subjects: ['English', 'MATHS', 'Science', 'Social Studies'],
            registration: true,
            sortOrder: 13,
            createdAt: new Date('2025-02-10T14:23:00')
          }
        ];

        if (req.schoolId && isValidId(req.schoolId)) {
          seedData.forEach(item => item.school = req.schoolId);
        }

        courses = await Course.insertMany(seedData);
      } catch (seedErr) {
        console.error('Error seeding initial courses:', seedErr);
      }
    }

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
  try {
    const courseData = { ...req.body };

    if (req.schoolId && isValidId(req.schoolId)) {
      courseData.school = req.schoolId;
    } else if (req.user && req.user.school && isValidId(req.user.school)) {
      courseData.school = req.user.school;
    } else {
      delete courseData.school;
    }

    const lastCourse = await Course.findOne({}).sort({ sortOrder: -1 });
    courseData.sortOrder = lastCourse ? (lastCourse.sortOrder || 0) + 1 : 1;

    const course = await Course.create(courseData);
    await logActivity({ req, user: req.user, activity: `Created course: ${course.name}` });

    return res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(400).json({ message: error.message || 'Failed to create course' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await logActivity({ req, user: req.user, activity: `Updated course: ${course.name}` });

    return res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(400).json({ message: error.message || 'Failed to update course' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    await Course.findByIdAndDelete(req.params.id);

    await logActivity({ req, user: req.user, activity: `Deleted course: ${course.name}` });

    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Duplicate course
// @route   POST /api/courses/:id/duplicate
// @access  Private (Admin)
exports.duplicateCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const original = await Course.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const duplicateData = {
      name: `${original.name} (Copy)`,
      term: original.term || '',
      division: original.division || 'Senior Secondary',
      divisionSub: original.divisionSub || 'Senior Secondary',
      code: original.code ? `${original.code}-COPY` : '',
      shortCode: original.shortCode ? `${original.shortCode}-COPY` : '',
      paymentAccount: original.paymentAccount || '',
      feeAmount: original.feeAmount || 100,
      incharge: original.incharge || '-',
      inchargeDates: original.inchargeDates || '',
      batches: original.batches || [],
      subjects: original.subjects || [],
      registration: original.registration,
      batchSameSubject: original.batchSameSubject,
      description: original.description || '',
      sortOrder: (original.sortOrder || 0) + 1,
      school: original.school
    };

    const newCourse = await Course.create(duplicateData);
    await logActivity({ req, user: req.user, activity: `Duplicated course: ${original.name}` });

    return res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error duplicating course:', error);
    return res.status(500).json({ message: 'Failed to duplicate course' });
  }
};

// @desc    Reorder courses
// @route   POST /api/courses/reorder
// @access  Private (Admin)
exports.reorderCourses = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds array is required' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder: index + 1 }
      }
    }));

    await Course.bulkWrite(bulkOps);

    await logActivity({ req, user: req.user, activity: 'Reordered courses order' });

    return res.json({ message: 'Courses reordered successfully' });
  } catch (error) {
    console.error('Error reordering courses:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add Batch to Course
// @route   POST /api/courses/:id/batches
// @access  Private (Admin)
exports.addBatchToCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const { batchName } = req.body;
    if (!batchName) {
      return res.status(400).json({ message: 'Batch name is required' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.batches.includes(batchName)) {
      course.batches.push(batchName);
      await course.save();
    }

    return res.json(course);
  } catch (error) {
    console.error('Error adding batch:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ========================================================
// COURSE INCHARGE CONTROLLERS (Screenshot 1 & 2)
// ========================================================

// @desc    Get Course Incharges (auto-seed 7 items matching Screenshot 1)
// @route   GET /api/courses/incharges/all
// @access  Private
exports.getCourseIncharges = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    let incharges = await CourseIncharge.find(filter).sort({ createdAt: -1 });

    if (incharges.length === 0) {
      try {
        const seedIncharges = [
          {
            course: 'IX (IX)',
            employee: 'Anamika Tiwari',
            employeeCode: 'ESM001',
            period: 'November 29, 2025 - Present',
            createdAt: new Date('2025-11-29T12:28:00')
          },
          {
            course: 'LKG (LKG)',
            employee: 'Attendance Incharge',
            employeeCode: 'ESM004',
            period: 'November 4, 2025 to November 14, 2026',
            createdAt: new Date('2025-11-04T11:25:00')
          },
          {
            course: 'XII (XII)',
            employee: 'Kalpana Comar',
            employeeCode: 'ESM100',
            period: 'November 4, 2025 to December 10, 2025',
            createdAt: new Date('2025-11-04T11:18:00')
          },
          {
            course: 'XII',
            employee: 'Kalpana Comar',
            employeeCode: 'ESM100',
            period: 'November 4, 2025 to November 4, 2026',
            createdAt: new Date('2025-11-04T11:24:00')
          },
          {
            course: 'XII',
            employee: 'Shivam Mishra',
            employeeCode: 'ESM005',
            period: 'April 1, 2025 to April 1, 2026',
            createdAt: new Date('2025-11-04T11:40:00')
          },
          {
            course: 'LKG (LKG)',
            employee: 'Kalpana Comar',
            employeeCode: 'ESM100',
            period: 'February 28, 2025 to March 29, 2025',
            createdAt: new Date('2025-02-28T00:16:00')
          },
          {
            course: 'Nursery (NUR)',
            employee: 'Kalpana Comar',
            employeeCode: 'ESM100',
            period: 'February 1, 2025 to March 31, 2026',
            createdAt: new Date('2025-02-08T17:33:00')
          }
        ];

        if (req.schoolId && isValidId(req.schoolId)) {
          seedIncharges.forEach(i => i.school = req.schoolId);
        }

        incharges = await CourseIncharge.insertMany(seedIncharges);
      } catch (seedErr) {
        console.error('Error seeding initial incharges:', seedErr);
      }
    }

    res.json(incharges);
  } catch (error) {
    console.error('Error fetching course incharges:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add / Assign Course Incharge
// @route   POST /api/courses/incharges/add
// @access  Private (Admin)
exports.addCourseIncharge = async (req, res) => {
  try {
    const { course, employee, employeeCode, period } = req.body;
    if (!course || !employee || !period) {
      return res.status(400).json({ message: 'Course, Employee and Period are required' });
    }

    const inchargeData = {
      course,
      employee,
      employeeCode: employeeCode || 'ESM001',
      period
    };

    if (req.schoolId && isValidId(req.schoolId)) {
      inchargeData.school = req.schoolId;
    }

    const newIncharge = await CourseIncharge.create(inchargeData);

    // Also update Course document if matching course exists
    await Course.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${course.replace(/[()]/g, '')}`, 'i') } },
      { incharge: employee, inchargeDates: period }
    );

    await logActivity({ req, user: req.user, activity: `Assigned incharge ${employee} to ${course}` });

    return res.status(201).json(newIncharge);
  } catch (error) {
    console.error('Error adding course incharge:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ========================================================
// ENROLLMENT SEAT CONTROLLERS (Screenshot 3 & 4)
// ========================================================

// @desc    Get Enrollment Seats (auto-seed 2 items matching Screenshot 3)
// @route   GET /api/courses/enrollment-seats/all
// @access  Private
exports.getEnrollmentSeats = async (req, res) => {
  try {
    const filter = req.schoolId ? { $or: [{ school: req.schoolId }, { school: { $exists: false } }] } : {};
    let seats = await EnrollmentSeat.find(filter).sort({ createdAt: -1 });

    if (seats.length === 0) {
      try {
        const seedSeats = [
          {
            course: 'XII',
            enrollmentType: 'Regular',
            usedSeat: 0,
            maxSeat: 1,
            createdAt: new Date('2025-11-04T11:22:00')
          },
          {
            course: 'XII',
            enrollmentType: 'Private',
            usedSeat: 0,
            maxSeat: 0,
            createdAt: new Date('2025-11-04T11:22:00')
          }
        ];

        if (req.schoolId && isValidId(req.schoolId)) {
          seedSeats.forEach(s => s.school = req.schoolId);
        }

        seats = await EnrollmentSeat.insertMany(seedSeats);
      } catch (seedErr) {
        console.error('Error seeding initial enrollment seats:', seedErr);
      }
    }

    res.json(seats);
  } catch (error) {
    console.error('Error fetching enrollment seats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create Enrollment Seat (Screenshot 4)
// @route   POST /api/courses/enrollment-seats/add
// @access  Private (Admin)
exports.createEnrollmentSeat = async (req, res) => {
  try {
    const { course, enrollmentType, maxSeat, description } = req.body;
    if (!course || !enrollmentType) {
      return res.status(400).json({ message: 'Course and Enrollment Type are required' });
    }

    const seatData = {
      course,
      enrollmentType,
      usedSeat: 0,
      maxSeat: Number(maxSeat) || 0,
      description: description || ''
    };

    if (req.schoolId && isValidId(req.schoolId)) {
      seatData.school = req.schoolId;
    }

    const newSeat = await EnrollmentSeat.create(seatData);
    await logActivity({ req, user: req.user, activity: `Created enrollment seat for ${course} (${enrollmentType})` });

    return res.status(201).json(newSeat);
  } catch (error) {
    console.error('Error creating enrollment seat:', error);
    return res.status(500).json({ message: 'Failed to create enrollment seat' });
  }
};

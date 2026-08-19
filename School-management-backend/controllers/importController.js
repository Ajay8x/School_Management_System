const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Guardian = require('../models/Guardian');
const Class = require('../models/Class');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Department = require('../models/Department');
const Enquiry = require('../models/Enquiry');
const Notice = require('../models/Notice');
const User = require('../models/User');
const School = require('../models/School');

exports.importBulkData = async (req, res) => {
  try {
    const { moduleKey, data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No valid data rows provided for import.' });
    }

    // Resolve active schoolId
    let schoolId = req.schoolId || req.user?.schoolId || req.headers['x-school-id'];
    if (!schoolId) {
      const firstSchool = await School.findOne();
      if (firstSchool) schoolId = firstSchool._id;
    }

    let importedCount = 0;
    let errors = [];

    switch (moduleKey) {
      case 'student':
      case 'student_account':
      case 'historical_student':
      case 'student_update':
      case 'student_create_user':
      case 'student_document':
      case 'student_qualification':
      case 'student_update_user':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            // Extract roll number with safe fallback
            const rollNumber = String(
              row['Roll Number'] || row['Roll No'] || row['RollNumber'] || row['Roll'] || row['Student Roll No'] || row.rollNumber || `STU-${Date.now().toString().slice(-4)}${idx}`
            ).trim();

            // Extract names
            const rawName = String(row['Student Name'] || row['Full Name'] || row['Name'] || row.name || '').trim();
            const firstName = String(row['First Name'] || (rawName ? rawName.split(' ')[0] : 'Student')).trim();
            const lastName = String(row['Last Name'] || (rawName ? rawName.split(' ').slice(1).join(' ') : '')).trim();
            const finalName = rawName || `${firstName} ${lastName}`.trim() || 'Student';

            // Extract class and batch
            const className = String(row['Class Name'] || row['Class'] || row['Course'] || row['Grade/Class'] || row.className || 'Class 1').trim();
            const batchName = String(row['Batch'] || row['Section'] || row['Batch Name'] || row.batch || 'Section A').trim();

            // Extract contact details
            const gender = String(row['Gender'] || row.gender || 'Male').trim();
            let email = String(row['Email'] || row['Email Address'] || row.email || '').trim();
            if (!email || !email.includes('@')) {
              email = `student_${Date.now()}_${idx}_${Math.floor(Math.random()*1000)}@school.local`;
            }

            const contact = String(row['Contact Number'] || row['Contact'] || row['Phone'] || row.contact || '0000000000').trim();
            const parentName = String(row['Guardian Name'] || row['Parent Name'] || row['Father Name'] || row.parentName || 'Parent').trim();
            const address = String(row['Address'] || row.address || '').trim();

            // Prepare student payload
            const studentPayload = {
              name: finalName,
              firstName,
              lastName,
              rollNumber,
              className,
              course: className,
              section: batchName,
              batch: batchName,
              email,
              contact,
              gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Male',
              parentName,
              address,
              ...(schoolId && { schoolId })
            };

            // 1. Upsert Student Record
            let existingStudent = await Student.findOne({
              $or: [
                { rollNumber },
                { email }
              ]
            });

            if (existingStudent) {
              Object.assign(existingStudent, studentPayload);
              await existingStudent.save();
            } else {
              existingStudent = await Student.create(studentPayload);
            }

            // 2. Auto-create / update User login account for Student
            await User.findOneAndUpdate(
              { email },
              {
                name: finalName,
                email,
                password: process.env.DEFAULT_PASSWORD || rollNumber || '123456',
                role: 'student',
                studentId: existingStudent._id,
                serialNumber: rollNumber
              },
              { upsert: true }
            );

            // 3. Auto-ensure Batch exists in database and increment strength
            if (schoolId) {
              await Batch.findOneAndUpdate(
                { school: schoolId, name: batchName },
                {
                  $setOnInsert: {
                    school: schoolId,
                    name: batchName,
                    course: className,
                    maxStrength: 45,
                    currentStrength: 1
                  },
                  $inc: { currentStrength: 1 }
                },
                { upsert: true }
              );

              // 4. Auto-ensure Course/Class exists in database
              await Course.findOneAndUpdate(
                { school: schoolId, name: className },
                {
                  $setOnInsert: {
                    school: schoolId,
                    name: className,
                    division: 'Senior Secondary',
                    feeAmount: 100,
                    status: 'Active'
                  }
                },
                { upsert: true }
              );
            }

            importedCount++;
          } catch (err) {
            console.error(`Error importing student row #${idx + 1}:`, err);
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'guardian':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const name = String(row['Guardian Name'] || row['Name'] || row.name || 'Guardian').trim();
            const contact = String(row['Phone'] || row['Contact'] || row.contact || '0000000000').trim();
            const relation = String(row['Relation'] || row['Relationship'] || row.relation || 'Father').trim();

            const filter = schoolId ? { name, contact, schoolId } : { name, contact };
            await Guardian.findOneAndUpdate(
              filter,
              { name, contact, relation, ...(schoolId && { schoolId }) },
              { upsert: true }
            );
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'employee':
      case 'employee_account':
      case 'employee_document':
      case 'employee_experience':
      case 'employee_qualification':
      case 'employee_update':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const employeeId = String(row['Employee ID'] || row['EMP ID'] || row.employeeId || `EMP${Date.now().toString().slice(-4)}${idx}`).trim();
            const name = String(row['Full Name'] || row['Name'] || row.name || 'Employee').trim();
            const subject = String(row['Department'] || row['Subject'] || row.subject || 'General').trim();
            let email = String(row['Email'] || row['Email Address'] || row.email || '').trim();
            if (!email || !email.includes('@')) {
              email = `emp_${Date.now()}_${idx}@school.local`;
            }
            const contact = String(row['Contact'] || row['Phone'] || row.contact || '0000000000').trim();

            const filter = schoolId ? { employeeId, schoolId } : { employeeId };
            const update = {
              name,
              employeeId,
              subject,
              email,
              contact,
              gender: String(row['Gender'] || row.gender || 'Male').trim(),
              ...(schoolId && { schoolId })
            };

            await Teacher.findOneAndUpdate(filter, update, { upsert: true });

            // Create User login account for Employee
            await User.findOneAndUpdate(
              { email },
              {
                name,
                email,
                password: process.env.DEFAULT_PASSWORD || employeeId || '123456',
                role: 'teacher',
                employeeId
              },
              { upsert: true }
            );

            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'course':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const name = String(row['Course Name'] || row['Class Name'] || row['Course'] || row.name || 'Course 1').trim();
            const code = String(row['Course Code'] || row.code || '').trim();
            const department = String(row['Department'] || row.department || 'General').trim();

            const filter = schoolId ? { name, school: schoolId } : { name };
            await Course.findOneAndUpdate(
              filter,
              { name, code, department, school: schoolId, status: 'Active' },
              { upsert: true }
            );
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'batch':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const name = String(row['Batch Name'] || row['Batch'] || row['Section'] || row.name || 'Section A').trim();
            const course = String(row['Class Name'] || row['Course'] || row.course || 'Nursery (NUR)').trim();
            const maxStrength = parseInt(row['Max Strength'] || row.maxStrength) || 45;
            const rollPrefix = String(row['Roll Prefix'] || row.rollPrefix || '').trim();

            if (schoolId) {
              await Batch.findOneAndUpdate(
                { school: schoolId, name },
                { school: schoolId, name, course, maxStrength, rollPrefix },
                { upsert: true }
              );
            } else {
              await Class.findOneAndUpdate({ name }, { name, section: name }, { upsert: true });
            }
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'department':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const name = String(row['Department Name'] || row['Name'] || row.name || 'Department').trim();
            const code = String(row['Department Code'] || row.code || '').trim();

            await Department.findOneAndUpdate(
              schoolId ? { school: schoolId, name } : { name },
              { name, code, ...(schoolId && { school: schoolId }) },
              { upsert: true }
            );
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      case 'enquiry':
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const visitorName = String(row['Visitor Name'] || row['Name'] || row.visitorName || 'Visitor').trim();
            const phone = String(row['Phone'] || row['Contact'] || row.phone || '0000000000').trim();
            const email = String(row['Email'] || row.email || '').trim();
            const classInterested = String(row['Class Interested'] || row.classInterested || 'Class 1').trim();

            await Enquiry.create({
              visitorName,
              phone,
              email,
              classInterested,
              schoolId: schoolId || undefined
            });
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;

      default:
        // Importer fallback for all other templates into Notice / General records
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx];
          try {
            const title = String(
              row['Title'] || row['Name'] || row['Visitor Name'] || row['Vendor Name'] || row['Item Name'] || row['Book Title'] || row['Subject Name'] || `Imported Item ${idx + 1}`
            ).trim();
            const content = JSON.stringify(row);
            await Notice.create({
              title: `${moduleKey.toUpperCase()}: ${title}`,
              content: `Imported via XLSX: ${content}`,
              category: 'General',
              targetAudience: 'All',
              ...(schoolId && { schoolId })
            });
            importedCount++;
          } catch (err) {
            errors.push(`Row #${idx + 1} error: ${err.message}`);
          }
        }
        break;
    }

    res.json({
      message: `Successfully imported ${importedCount} record(s) into database!`,
      importedCount,
      errorsCount: errors.length,
      errors
    });

  } catch (error) {
    console.error('Error during bulk import:', error);
    res.status(500).json({ message: 'Server error during data import', error: error.message });
  }
};

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Guardian = require('../models/Guardian');
const Class = require('../models/Class');
const Notice = require('../models/Notice');
const User = require('../models/User');

exports.importBulkData = async (req, res) => {
  try {
    const { moduleKey, data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No valid data rows provided for import.' });
    }

    const schoolId = req.schoolId;
    let importedCount = 0;
    let errors = [];

    switch (moduleKey) {
      case 'student':
      case 'student_account':
      case 'historical_student':
        for (let row of data) {
          try {
            const rollNumber = row.rollNumber || row['Roll Number'] || row['Roll No'] || `R${Date.now().toString().slice(-4)}`;
            const name = row.name || row['Name'] || row['Student Name'] || 'Unknown Student';
            const className = row.className || row['Class Name'] || row['Class'] || 'Class 1';
            const section = row.section || row['Section'] || 'A';
            const email = row.email || row['Email'] || `student_${Date.now()}_${Math.floor(Math.random()*1000)}@school.local`;
            const contact = row.contact || row['Contact'] || row['Phone'] || '0000000000';

            const filter = schoolId ? { rollNumber, schoolId } : { rollNumber };
            const update = {
              name,
              rollNumber,
              className,
              section,
              email,
              contact,
              gender: row.gender || row['Gender'] || 'Male',
              ...(schoolId && { schoolId })
            };

            await Student.findOneAndUpdate(filter, update, { upsert: true, new: true });
            importedCount++;
          } catch (err) {
            errors.push(`Row error: ${err.message}`);
          }
        }
        break;

      case 'guardian':
        for (let row of data) {
          try {
            const name = row.name || row['Name'] || row['Guardian Name'] || 'Guardian';
            const contact = row.contact || row['Contact'] || row['Phone'] || '0000000000';
            const relation = row.relation || row['Relation'] || row['Relationship'] || 'Father';

            const filter = schoolId ? { name, contact, schoolId } : { name, contact };
            await Guardian.findOneAndUpdate(filter, { name, contact, relation, ...(schoolId && { schoolId }) }, { upsert: true });
            importedCount++;
          } catch (err) {
            errors.push(`Row error: ${err.message}`);
          }
        }
        break;

      case 'employee':
      case 'employee_account':
      case 'employee_update':
        for (let row of data) {
          try {
            const employeeId = row.employeeId || row['Employee ID'] || row['EMP ID'] || `EMP${Date.now().toString().slice(-4)}`;
            const name = row.name || row['Name'] || row['Employee Name'] || 'Employee';
            const subject = row.subject || row['Subject'] || row['Department'] || 'General';
            const email = row.email || row['Email'] || `emp_${Date.now()}@school.local`;
            const contact = row.contact || row['Contact'] || '0000000000';

            const filter = schoolId ? { employeeId, schoolId } : { employeeId };
            const update = {
              name,
              employeeId,
              subject,
              email,
              contact,
              gender: row.gender || row['Gender'] || 'Male',
              ...(schoolId && { schoolId })
            };

            await Teacher.findOneAndUpdate(filter, update, { upsert: true });
            importedCount++;
          } catch (err) {
            errors.push(`Row error: ${err.message}`);
          }
        }
        break;

      case 'course':
      case 'batch':
        for (let row of data) {
          try {
            const name = row.name || row['Class Name'] || row['Course'] || row['Batch'] || 'Class';
            const section = row.section || row['Section'] || 'A';

            const filter = schoolId ? { name, section, schoolId } : { name, section };
            await Class.findOneAndUpdate(filter, { name, section, ...(schoolId && { schoolId }) }, { upsert: true });
            importedCount++;
          } catch (err) {
            errors.push(`Row error: ${err.message}`);
          }
        }
        break;

      default:
        // Generic fallback importer into generic store or Notice model for announcements / entries
        for (let row of data) {
          try {
            const title = row.title || row.name || row['Name'] || row['Title'] || `Imported Item ${Date.now()}`;
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
            errors.push(`Row error: ${err.message}`);
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

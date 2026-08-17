const fs = require('fs');
const path = require('path');

const models = [
  'Account.js', 'ActivityLog.js', 'Attendance.js', 'Certificate.js', 'Class.js', 
  'Complaint.js', 'Department.js', 'Enquiry.js', 'Event.js', 'Examination.js', 
  'Fee.js', 'Guardian.js', 'HealthRecord.js', 'HRM.js', 'Leave.js', 'Library.js', 
  'Message.js', 'Notice.js', 'Program.js', 'Student.js', 'Teacher.js', 'Visitor.js'
];

const modelsDir = path.join(__dirname, 'models');

models.forEach(file => {
  const filePath = path.join(modelsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - Not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('tenantPlugin')) {
    console.log(`Skipping ${file} - Already has plugin`);
    return;
  }

  const schemaNameMatch = content.match(/const\s+(\w+Schema)\s*=\s*new\s+mongoose\.Schema/);
  if (schemaNameMatch) {
    const schemaName = schemaNameMatch[1];
    const injection = `\n${schemaName}.add({ sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true } });\n${schemaName}.plugin(require('../plugins/tenantPlugin'));\n\n`;
    
    content = content.replace(/module\.exports/, injection + 'module.exports');
    fs.writeFileSync(filePath, content);
    console.log(`Injected into ${file}`);
  } else {
    console.log(`Could not find schema name in ${file}`);
  }
});

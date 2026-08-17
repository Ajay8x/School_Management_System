const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const models = [
  'Account', 'ActivityLog', 'Attendance', 'Certificate', 'Class', 
  'Complaint', 'Department', 'Enquiry', 'Event', 'Examination', 
  'Fee', 'Guardian', 'HealthRecord', 'HRM', 'Leave', 'Library', 
  'Message', 'Notice', 'Program', 'Student', 'Teacher', 'Visitor'
];

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Load models
    const Session = require('./models/Session');
    const loadedModels = models.map(m => require(`./models/${m}`));

    // Find default session
    const session = await Session.findOne().sort({ createdAt: 1 });
    if (!session) {
      console.log('No sessions found in database. Cannot migrate.');
      process.exit(0);
    }
    console.log(`Migrating data to session: ${session.name} (${session._id})`);

    // Update all documents in loaded models that don't have a sessionId
    for (let model of loadedModels) {
      try {
        const result = await model.updateMany(
          { sessionId: { $exists: false } },
          { $set: { sessionId: session._id } }
        );
        console.log(`Migrated ${result.modifiedCount} records in ${model.modelName}`);
      } catch (err) {
        console.error(`Error migrating ${model.modelName}:`, err.message);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

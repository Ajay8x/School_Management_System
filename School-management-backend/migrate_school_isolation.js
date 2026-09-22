const mongoose = require('mongoose');

async function migrateData() {
  await mongoose.connect('mongodb+srv://ajju8x:1234561@cluster0.lyaktdf.mongodb.net/school_management?appName=Cluster0');
  
  const School = require('./models/School');
  const Trip = require('./models/Trip');
  const News = require('./models/News');
  const Incident = require('./models/Incident');

  const defaultSchool = await School.findOne({ isDefault: true }) || await School.findOne();
  console.log('Default School ID:', defaultSchool?._id, 'Name:', defaultSchool?.name);

  if (defaultSchool) {
    const tripRes = await Trip.updateMany(
      { $or: [{ schoolId: null }, { schoolId: { $exists: false } }] },
      { $set: { schoolId: defaultSchool._id } }
    );
    console.log('Updated unassigned Trips:', tripRes.modifiedCount);

    const newsRes = await News.updateMany(
      { $or: [{ schoolId: null }, { schoolId: { $exists: false } }] },
      { $set: { schoolId: defaultSchool._id } }
    );
    console.log('Updated unassigned News:', newsRes.modifiedCount);

    const incidentRes = await Incident.updateMany(
      { $or: [{ schoolId: null }, { schoolId: { $exists: false } }] },
      { $set: { schoolId: defaultSchool._id } }
    );
    console.log('Updated unassigned Incidents:', incidentRes.modifiedCount);
  }

  await mongoose.disconnect();
  console.log('Migration complete.');
}
migrateData();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../School-management-backend/.env' });
const School = require('../School-management-backend/models/School');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const school = await School.findOne({ name: /Royal/i });
  console.log("School name:", school.name);
  console.log("Modules:", JSON.stringify(school.modules, null, 2));
  process.exit(0);
}
test();

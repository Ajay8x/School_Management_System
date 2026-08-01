const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function fixAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } });
    console.log('Found admins:', admins.map(a => ({ email: a.email, role: a.role })));

    // Let's reset the superadmin@school.com and admin@school.com back to their env passwords
    for (const admin of admins) {
      if (admin.email === process.env.SUPER_ADMIN_EMAIL) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);
        await admin.save();
        console.log(`Reset password for ${admin.email}`);
      } else if (admin.email === process.env.ADMIN_EMAIL) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        await admin.save();
        console.log(`Reset password for ${admin.email}`);
      } else if (admin.email === 'cloudhero@gmail.com') {
         // This is a super-admin I just changed to student in earlier turn, wait, I changed it to student.
         // Let's just output it if any other admin exists.
         console.log(`Skipping or you might want to reset ${admin.email}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAdmins();

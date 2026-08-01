const mongoose = require('mongoose');
const Enquiry = require('./models/Enquiry');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const enq = await Enquiry.findOne();
    if (!enq) {
      console.log('No enquiries found');
      return;
    }

    console.log('Found enquiry:', enq.name, 'Status:', enq.status);
    
    // Test update
    const updated = await Enquiry.findByIdAndUpdate(enq._id, { status: 'Follow-up' }, { new: true });
    console.log('Updated enquiry:', updated.name, 'New Status:', updated.status);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

test();

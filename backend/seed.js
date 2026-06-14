// Run once after deploying to populate the database with initial data:
//   node seed.js

require('dotenv').config();
const mongoose     = require('mongoose');
const Medication   = require('./models/Medication');
const Notification = require('./models/Notification');

const MEDICATIONS = [
  { name: 'Levodopa / Carbidopa', doseMg: 100, schedule: ['07:00', '13:00', '19:00'] },
  { name: 'Pramipexole',          doseMg: 0.5, schedule: ['08:00', '20:00'] },
  { name: 'Amantadine',           doseMg: 100, schedule: ['09:00'] },
];

const NOTIFICATIONS = [
  {
    category:   'freeze',
    title:      'Freeze Episode Detected',
    body:       '4.2s episode — vibration cue delivered, episode resolved',
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    category:   'medication',
    title:      'Levodopa / Carbidopa Due',
    body:       'Next dose: 1:00 PM — 100 mg. Take with food.',
    occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    category:   'device',
    title:      'Hub Battery Low',
    body:       'NeuroStep Hub is at 12% — please charge before your next walk.',
    occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    category:   'doctor',
    title:      'Message from Dr. Johnson',
    body:       'Your weekly gait report has been reviewed. Freeze duration trending down — great progress.',
    occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    category:   'medication',
    title:      'Pramipexole Due',
    body:       'Morning dose: 8:00 AM — 0.5 mg.',
    occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existingMeds  = await Medication.countDocuments();
  const existingNotifs = await Notification.countDocuments();

  if (existingMeds === 0) {
    await Medication.insertMany(MEDICATIONS);
    console.log(`Seeded ${MEDICATIONS.length} medications`);
  } else {
    console.log(`Skipping medications — ${existingMeds} already exist`);
  }

  if (existingNotifs === 0) {
    await Notification.insertMany(NOTIFICATIONS);
    console.log(`Seeded ${NOTIFICATIONS.length} notifications`);
  } else {
    console.log(`Skipping notifications — ${existingNotifs} already exist`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

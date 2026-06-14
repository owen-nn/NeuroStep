const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  doseMg:   { type: Number },
  schedule: [{ type: String }],
  history:  [{ takenAt: { type: Date } }],
  active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema);

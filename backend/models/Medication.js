// ============================================================
//  models/Medication.js — Mongoose schema for a patient medication
//
//  Fields (Phase 2):
//    userId      — patient reference
//    name        — medication name (e.g. "Levodopa")
//    doseMg      — dose in milligrams
//    schedule    — array of daily times (e.g. ["08:00", "14:00", "20:00"])
//    history     — array of { takenAt: Date } — dose-taken audit trail
//    active      — whether the prescription is still current
// ============================================================

// TODO (Phase 2): uncomment and flesh out the schema
// const mongoose = require('mongoose');
//
// const MedicationSchema = new mongoose.Schema({
//   userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name:     { type: String, required: true },
//   doseMg:   { type: Number },
//   schedule: [{ type: String }],
//   history:  [{ takenAt: { type: Date } }],
//   active:   { type: Boolean, default: true },
// }, { timestamps: true });
//
// module.exports = mongoose.model('Medication', MedicationSchema);

module.exports = {}; // placeholder until Phase 2

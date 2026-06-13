// ============================================================
//  models/FallEvent.js — Mongoose schema for a detected fall
//
//  Fields (Phase 2):
//    userId      — patient reference
//    occurredAt  — UTC timestamp
//    severity    — 'mild' | 'moderate' | 'severe' (based on impact magnitude)
//    impactG     — peak acceleration in g at time of fall
//    alertSent   — whether a caregiver push notification was dispatched
//    location    — optional GPS coords
// ============================================================

// TODO (Phase 2): uncomment and flesh out the schema
// const mongoose = require('mongoose');
//
// const FallEventSchema = new mongoose.Schema({
//   userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   occurredAt: { type: Date, default: Date.now },
//   severity:   { type: String, enum: ['mild', 'moderate', 'severe'] },
//   impactG:    { type: Number },
//   alertSent:  { type: Boolean, default: false },
//   location:   { lat: Number, lng: Number },
// }, { timestamps: true });
//
// module.exports = mongoose.model('FallEvent', FallEventSchema);

module.exports = {}; // placeholder until Phase 2

// ============================================================
//  models/FreezeEvent.js — Mongoose schema for a FOG episode
//
//  Fields (Phase 2):
//    userId       — ties event to a patient account
//    occurredAt   — UTC timestamp from the sock (or server receipt time)
//    durationMs   — how long the freeze lasted (ms)
//    fogConfidence— the CNN's output probability (0–1) at trigger time
//    resolved     — whether the vibration cue successfully broke the freeze
//    location     — optional GPS coords (for caregiver dashboard heatmap)
// ============================================================

// TODO (Phase 2): uncomment and flesh out the schema
// const mongoose = require('mongoose');
//
// const FreezeEventSchema = new mongoose.Schema({
//   userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   occurredAt:    { type: Date, default: Date.now },
//   durationMs:    { type: Number },
//   fogConfidence: { type: Number, min: 0, max: 1 },
//   resolved:      { type: Boolean, default: false },
//   location:      { lat: Number, lng: Number },
// }, { timestamps: true });
//
// module.exports = mongoose.model('FreezeEvent', FreezeEventSchema);

module.exports = {}; // placeholder until Phase 2

const mongoose = require('mongoose');

const FreezeEventSchema = new mongoose.Schema({
  occurredAt:    { type: Date, default: Date.now },
  durationMs:    { type: Number },
  fogConfidence: { type: Number, min: 0, max: 1 },
  cueDelivered:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('FreezeEvent', FreezeEventSchema);

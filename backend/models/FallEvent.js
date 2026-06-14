const mongoose = require('mongoose');

const FallEventSchema = new mongoose.Schema({
  occurredAt: { type: Date, default: Date.now },
  severity:   { type: String, enum: ['mild', 'moderate', 'severe'] },
  impactG:    { type: Number },
  alertSent:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('FallEvent', FallEventSchema);

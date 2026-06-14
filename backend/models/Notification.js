const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  category:   { type: String, enum: ['medication', 'freeze', 'doctor', 'device'], required: true },
  title:      { type: String, required: true },
  body:       { type: String, required: true },
  occurredAt: { type: Date, default: Date.now },
  isRead:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);

const express      = require('express');
const router       = express.Router();
const FreezeEvent  = require('../models/FreezeEvent');
const FallEvent    = require('../models/FallEvent');
const Notification = require('../models/Notification');
const { sendPushToAll } = require('../utils/sendPush');

// POST /api/events/freeze — ESP32 calls this when a freeze is detected
router.post('/freeze', async (req, res) => {
  try {
    const { durationMs, fogConfidence, cueDelivered } = req.body;

    const event = await FreezeEvent.create({ durationMs, fogConfidence, cueDelivered });

    // Auto-create a notification so the mobile app sees the event
    const secs = durationMs ? (durationMs / 1000).toFixed(1) : '?';
    const notifBody = `${secs}s episode — vibration cue delivered`;
    await Notification.create({
      category:   'freeze',
      title:      'Freeze Episode Detected',
      body:       notifBody,
      occurredAt: event.occurredAt,
    });

    sendPushToAll('Freeze Episode Detected', notifBody).catch(console.warn);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/freeze — mobile app fetches history for analytics
router.get('/freeze', async (_req, res) => {
  try {
    const events = await FreezeEvent.find().sort({ occurredAt: -1 }).limit(100);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/fall
router.post('/fall', async (req, res) => {
  try {
    const event = await FallEvent.create(req.body);
    sendPushToAll('Fall Detected', 'NeuroStep detected a potential fall event. Please check on the patient.').catch(console.warn);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/fall
router.get('/fall', async (_req, res) => {
  try {
    const events = await FallEvent.find().sort({ occurredAt: -1 }).limit(100);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

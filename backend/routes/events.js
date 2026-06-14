const express      = require('express');
const router       = express.Router();
const FreezeEvent  = require('../models/FreezeEvent');
const FallEvent    = require('../models/FallEvent');
const Notification = require('../models/Notification');

// POST /api/events/freeze — ESP32 calls this when a freeze is detected
router.post('/freeze', async (req, res) => {
  try {
    const { durationMs, fogConfidence, cueDelivered } = req.body;

    const event = await FreezeEvent.create({ durationMs, fogConfidence, cueDelivered });

    // Auto-create a notification so the mobile app sees the event
    const secs = durationMs ? (durationMs / 1000).toFixed(1) : '?';
    await Notification.create({
      category:   'freeze',
      title:      'Freeze Episode Detected',
      body:       `${secs}s episode — vibration cue delivered`,
      occurredAt: event.occurredAt,
    });

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

// POST /api/events/fall — future feature, accepted but falls are not the focus yet
router.post('/fall', async (req, res) => {
  try {
    const event = await FallEvent.create(req.body);
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

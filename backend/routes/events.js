// ============================================================
//  routes/events.js — freeze-of-gait and fall event endpoints
//
//  POST /api/events/freeze  — record a new FOG episode from the sock
//  GET  /api/events/freeze  — list FOG episodes (with optional date range)
//  POST /api/events/fall    — record a detected fall
//  GET  /api/events/fall    — list fall events
//
//  Phase 2: swap TODO stubs for real Mongoose queries.
// ============================================================

const express = require('express');
const router  = express.Router();

// TODO (Phase 2): import FreezeEvent and FallEvent models
// const FreezeEvent = require('../models/FreezeEvent');
// const FallEvent   = require('../models/FallEvent');

router.post('/freeze', async (req, res) => {
  // TODO: validate req.body, save new FreezeEvent to DB
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/freeze', async (req, res) => {
  // TODO: query FreezeEvent.find() with optional date/userId filters
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/fall', async (req, res) => {
  // TODO: validate req.body, save new FallEvent to DB
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/fall', async (req, res) => {
  // TODO: query FallEvent.find() with optional filters
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;

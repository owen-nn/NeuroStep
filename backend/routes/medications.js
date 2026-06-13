// ============================================================
//  routes/medications.js — medication schedule endpoints
//
//  GET    /api/medications          — list all medications for a user
//  POST   /api/medications          — add a new medication
//  PUT    /api/medications/:id      — update dose / schedule
//  DELETE /api/medications/:id      — remove a medication
//  POST   /api/medications/:id/take — mark a dose as taken
//
//  Phase 2: swap stubs for Mongoose queries.
// ============================================================

const express = require('express');
const router  = express.Router();

// TODO (Phase 2): import Medication model
// const Medication = require('../models/Medication');

router.get('/', async (_req, res) => {
  // TODO: return Medication.find({ userId })
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/', async (req, res) => {
  // TODO: validate and create new Medication document
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/:id', async (req, res) => {
  // TODO: findByIdAndUpdate(req.params.id, req.body)
  res.status(501).json({ message: 'Not implemented yet' });
});

router.delete('/:id', async (req, res) => {
  // TODO: findByIdAndDelete(req.params.id)
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/:id/take', async (req, res) => {
  // TODO: push a dose-taken timestamp into the medication's history array
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;

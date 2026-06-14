const express    = require('express');
const router     = express.Router();
const Medication = require('../models/Medication');

// GET /api/medications — mobile app loads the medication schedule
router.get('/', async (_req, res) => {
  try {
    const meds = await Medication.find({ active: true }).sort({ name: 1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medications — add a new medication
router.post('/', async (req, res) => {
  try {
    const med = await Medication.create(req.body);
    res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/medications/:id — update dose or schedule
router.put('/:id', async (req, res) => {
  try {
    const med = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!med) return res.status(404).json({ error: 'Not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/medications/:id — deactivate a medication
router.delete('/:id', async (req, res) => {
  try {
    await Medication.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medications/:id/take — mark a dose as taken
router.post('/:id/take', async (req, res) => {
  try {
    const med = await Medication.findByIdAndUpdate(
      req.params.id,
      { $push: { history: { takenAt: new Date() } } },
      { new: true }
    );
    if (!med) return res.status(404).json({ error: 'Not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

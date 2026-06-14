const express    = require('express');
const router     = express.Router();
const PushToken  = require('../models/PushToken');

// POST /api/push/register — save or update a device push token
router.post('/register', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });

  await PushToken.findOneAndUpdate(
    { token },
    { token },
    { upsert: true, new: true }
  );

  res.json({ ok: true });
});

module.exports = router;

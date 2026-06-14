const express = require('express');
const router  = express.Router();
const twilio  = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /api/emergency/alert
// Body: { eventType: 'freeze'|'fall', contacts: [{ name, phone }] }
router.post('/alert', async (req, res) => {
  const { eventType = 'emergency', contacts = [] } = req.body;

  if (contacts.length === 0) {
    return res.status(400).json({ error: 'No contacts provided' });
  }

  const message = eventType === 'fall'
    ? 'URGENT: NeuroStep detected a fall event. Please check on your family member immediately.'
    : 'URGENT: NeuroStep detected a freeze episode. Please check on your family member.';

  const results = await Promise.allSettled(
    contacts.map((contact) => {
      const to = contact.phone.replace(/[^\d+]/g, '');
      return client.messages.create({
        body: message,
        from: process.env.TWILIO_FROM,
        to,
      });
    })
  );

  const sent   = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  res.json({ sent, failed });
});

module.exports = router;

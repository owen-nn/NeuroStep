require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const eventsRouter        = require('./routes/events');
const medicationsRouter   = require('./routes/medications');
const notificationsRouter = require('./routes/notifications');
const emergencyRouter     = require('./routes/emergency');
const pushRouter          = require('./routes/push');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Database ─────────────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/events',        eventsRouter);
app.use('/api/medications',   medicationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/emergency',     emergencyRouter);
app.use('/api/push',          pushRouter);

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`NeuroStep backend listening on :${PORT}`));

// ============================================================
//  server.js — NeuroStep Express entry point
//
//  Phase 2: connects to MongoDB Atlas, mounts route modules.
//  Phase 1 / local dev: run without a DB — routes return 501 stubs.
// ============================================================

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// TODO (Phase 2): uncomment and configure mongoose connection
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI);

const eventsRouter      = require('./routes/events');
const medicationsRouter = require('./routes/medications');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/events',      eventsRouter);
app.use('/api/medications', medicationsRouter);

app.listen(PORT, () => console.log(`NeuroStep backend listening on :${PORT}`));

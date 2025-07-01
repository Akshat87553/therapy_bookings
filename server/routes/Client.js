import express from 'express';
import Client from '../models/Client.js';
import SessionNote from '../models/SessionNote.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/clients
 * Returns list of all clients (basic fields)
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 });
    res.json(clients.map(c => ({
      id: c._id,
      initials: c.initials,
      name: c.name,
      tags: c.tags
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/clients/:id
 * Returns single client plus latest session summary
 */
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    res.json({
      id: client._id,
      name: client.name,
      initials: client.initials,
      tags: client.tags
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/clients/:id/sessions
 * Returns all session notes for a client
 */
router.get('/:id/sessions', authenticateAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const sessions = await SessionNote.find({ clientId }).sort({ date: -1 });
    res.json(sessions.map(s => ({
      id: s._id,
      date: s.date.toDateString(),
      time: s.time,
      duration: s.duration,
      type: s.type,
      notes: s.notes
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/clients
 * Add new client
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, initials, tags } = req.body;
    const client = new Client({ name, initials, tags });
    await client.save();
    res.status(201).json({
      id: client._id,
      name: client.name,
      initials: client.initials,
      tags: client.tags
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/clients/:id/sessions
 * Add a new session note
 */
router.post('/:id/sessions', authenticateAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const { date, time, duration, type, notes } = req.body;
    const session = new SessionNote({ clientId, date: new Date(date), time, duration, type, notes });
    await session.save();
    res.status(201).json({ message: 'Session added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
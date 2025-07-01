// routes/users.js
import express from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { authenticateToken, authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/users
 * – Returns all users with role="user", plus a `lastSession` field (ISO string or null).
 * – `lastSession` is the maximum booking.session.date ≤ today for that user’s email.
 * – Requires valid JWT.
 */
router.get('/', authenticateAdmin, authenticateToken, async (req, res) => {
  try {
    // 1) Fetch all users whose role is 'user' (exclude admins).
    const users = await User.find({ role: 'user' }, 'name email role');

    // 2) Find “last session” per email (only sessions in the past or today).
    const now = new Date();

    const agg = await Booking.aggregate([
      // Match only bookings whose session.date is ≤ now, and ensure user.email exists
      {
        $match: {
          'user.email': { $exists: true },
          'session.date': { $lte: now }
        }
      },
      // Group by client email, take the max (latest) date
      {
        $group: {
          _id: '$user.email',
          lastDate: { $max: '$session.date' }
        }
      }
    ]);

    // Build a map: { [email]: ISO-date-string }
    const lastMap = {};
    agg.forEach((doc) => {
      // Convert to ISO string so front end can parse easily
      lastMap[doc._id] = doc.lastDate.toISOString();
    });

    // 3) Merge into each user object
    const usersWithLast = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      // if there's no past session, set null
      lastSession: lastMap[u.email] || null
    }));

    return res.json(usersWithLast);
  } catch (err) {
    console.error('Error fetching users with lastSession:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

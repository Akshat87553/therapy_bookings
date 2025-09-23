// routes/notifications.js
import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/notification.js';
import User from '../models/User.js';
import Booking from '../models/booking.js';
import { authenticateAdmin, authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/notifications/reschedule
 * Allow any authenticated user to request a reschedule.
 */
export async function handleReschedule(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = req.user.userId;

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }
    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ message: 'Invalid bookingId' });
    }

    // find admin to receive the notification
    const adminUser = await User.findOne({ role: 'admin' }).lean();
    if (!adminUser) {
      return res.status(500).json({ message: 'No admin user found to receive notification' });
    }
    const adminId = adminUser._id;

    // fetch requester to get a readable name
    const requester = await User.findById(userId).lean();
    let displayName = userId;
    if (requester) {
      displayName =
        (requester.name && requester.name.trim()) ||
        ((requester.firstName || requester.lastName) && `${requester.firstName || ''} ${requester.lastName || ''}`.trim()) ||
        requester.email ||
        userId;
    }

    // Try to fetch booking to build a readable booking reference/summary
    let bookingRef = String(bookingId).slice(-6);
    let bookingSummary = '';
    try {
      const booking = await Booking.findById(bookingId).lean();
      if (booking) {
        bookingRef = String(booking._id).slice(-6);
        const dateStr = booking.date ? new Date(booking.date).toLocaleDateString() : '';
        const timeStr = booking.timeSlot || booking.time || '';
        bookingSummary = [dateStr, timeStr].filter(Boolean).join(' ').trim();
      }
    } catch (err) {
      console.warn('Could not load booking for reschedule notification:', err && err.message ? err.message : err);
    }

    // Compose a friendly message (avoid dumping full ObjectId to UI)
    const messageParts = [`User ${displayName} requested to reschedule booking ${bookingRef}`];
    if (bookingSummary) messageParts.push(`(${bookingSummary})`);
    const message = messageParts.join(' ');

    const newNotif = new Notification({
      adminId: adminId,
      type: 'appointment_reschedule',
      title: 'Reschedule Request',
      message,
      bookingId: new mongoose.Types.ObjectId(bookingId),
    });

    await newNotif.save();

    return res.status(201).json({ message: 'Reschedule notification sent' });
  } catch (err) {
    console.error('Error in handleReschedule:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: err?.message || 'Server error' });
  }
}

/**
 * Admin-only routes: GET /api/notifications
 *                     PUT /api/notifications/:id/read
 *                     PUT /api/notifications/read-all
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.userId;
    const all = await Notification.find({ adminId }).sort({ createdAt: -1 }).lean();
    return res.json(all);
  } catch (err) {
    console.error('Error fetching notifications:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const notif = await Notification.findOne({ _id: id, adminId });
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notif.read = true;
    await notif.save();
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Error marking notification read:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/read-all', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.userId;
    await Notification.updateMany({ adminId, read: false }, { $set: { read: true } });
    return res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('Error marking all notifications read:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Register reschedule endpoint
router.post('/reschedule', authenticateToken, handleReschedule);

export default router;

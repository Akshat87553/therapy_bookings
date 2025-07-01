// routes/notifications.js
import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/notification.js';
import User from '../models/User.js';

const router = express.Router();

// 1) allow any authenticated user to request a reschedule
export async function handleReschedule(req, res) {
  try {
    const userId = req.user.userId;
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const adminUser = await User.findOne({ role: 'admin' }).lean();
    if (!adminUser) {
      return res.status(500).json({ message: 'No admin user found' });
    }
    const adminId = adminUser._id;

    const title = 'Reschedule Request';
    const message = `User ${userId} requested to reschedule booking ${bookingId}`;

    const newNotif = new Notification({
      adminId: mongoose.Types.ObjectId(adminId),
      type: 'appointment_reschedule',
      title,
      message,
      bookingId: mongoose.Types.ObjectId(bookingId),
    });
    await newNotif.save();

    return res.status(201).json({ message: 'Reschedule notification sent' });
  } catch (err) {
    console.error('Error in handleReschedule:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * 2) Admin-only routes:
 *    GET /api/notifications
 *    PUT /api/notifications/:id/read
 *    PUT /api/notifications/read-all
 */
router.get('/', async (req, res) => {
  try {
    const adminId = req.user.userId;
    const all = await Notification.find({ adminId }).sort({ createdAt: -1 }).lean();
    return res.json(all);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const notif = await Notification.findOne({ _id: id, adminId });
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notif.read = true;
    await notif.save();
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    const adminId = req.user.userId;
    await Notification.updateMany({ adminId, read: false }, { $set: { read: true } });
    return res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

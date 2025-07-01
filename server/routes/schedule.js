// routes/schedule.js
import express from 'express';
import { authenticateAdmin, authenticateToken } from '../middleware/authMiddleware.js';
import Schedule from '../models/schedule.js';

const router = express.Router();

/**
 * Helper: Delete all Schedule docs for `adminId` where date < today.
 */
async function cleanupPastSlots(adminId) {
  // Compute midnight UTC of today
  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);

  await Schedule.deleteMany({
    adminId,
    date: { $lt: todayMidnight }
  });
}

/**
 * Public (authenticated) endpoint for fetching available slots for a single admin.
 * GET /api/schedule/available-slots?start=&end=
 *
 * Before returning, we delete any Schedule entries before today.
 */
router.get(
  '/available-slots',
  authenticateToken,
  async (req, res) => {
    try {
      const ADMIN_ID = process.env.ADMIN_ID; // e.g. "682fa52d899e328f422b6851"
      if (!ADMIN_ID) {
        return res.status(400).json({ message: 'No ADMIN_ID configured' });
      }

      // 1) Remove past slots for this admin
      await cleanupPastSlots(ADMIN_ID);

      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ message: 'Missing start or end query parameter' });
      }

      // 2) Fetch schedules in [start, end]
      const availabilities = await Schedule.find({
        adminId: ADMIN_ID,
        date: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      });

      // 3) Return each date with its slots
      const result = availabilities.map(doc => ({
        date: doc.date,
        slots: doc.slots.map(s => ({
          time: s.time,
          isAvailable: s.isAvailable,
          slotType: s.slotType
        }))
      }));

      return res.json(result);
    } catch (err) {
      console.error('Error in GET /api/schedule/available-slots:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * Admin-only: fetch own availability (with automatic cleanup of past dates).
 * GET /api/schedule/availability?start=&end=
 */
router.get(
  '/availability',
  authenticateAdmin,
  async (req, res) => {
    try {
      const adminId = req.user.userId;

      // 1) Remove past slots for this admin
      await cleanupPastSlots(adminId);

      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ message: 'Missing start or end query parameter' });
      }

      // 2) Fetch schedules between start and end
      const availabilities = await Schedule.find({
        adminId,
        date: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      });

      return res.json(
        availabilities.map(doc => ({
          date: doc.date,
          slots: doc.slots.map(s => ({
            time: s.time,
            isAvailable: s.isAvailable,
            slotType: s.slotType
          }))
        }))
      );
    } catch (err) {
      console.error('Error in GET /api/schedule/availability:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * Admin-only: set or update availability.
 * POST /api/schedule/availability
 *
 * Payload: { date, day_of_week, time_slot, slot_type, is_available }
 */
router.post(
  '/availability',
  authenticateAdmin,
  async (req, res) => {
    try {
      const adminId = req.user.userId;
      const { date, day_of_week, time_slot, slot_type, is_available } = req.body;
      if (!date || !time_slot || typeof is_available !== 'boolean') {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const dayDate = new Date(date);
      dayDate.setUTCHours(0, 0, 0, 0);

      let availability = await Schedule.findOne({ adminId, date: dayDate });

      if (availability) {
        if (is_available) {
          // Mark (or add) the slot as available
          const idx = availability.slots.findIndex(s => s.time === time_slot);
          if (idx !== -1) {
            availability.slots[idx].isAvailable = true;
            availability.slots[idx].slotType = slot_type;
          } else {
            availability.slots.push({
              time: time_slot,
              isAvailable: true,
              slotType: slot_type
            });
          }
        } else {
          // Remove the slot entirely
          availability.slots = availability.slots.filter(s => s.time !== time_slot);
          if (availability.slots.length === 0) {
            // If no slots remain, delete the document
            await Schedule.deleteOne({ _id: availability._id });
            return res.json({ message: 'Availability removed' });
          }
        }
      } else if (is_available) {
        // Create a brand-new schedule for that day
        availability = new Schedule({
          adminId,
          date: dayDate,
          dayOfWeek: day_of_week,
          slots: [{ time: time_slot, isAvailable: true, slotType: slot_type }]
        });
      } else {
        return res.json({ message: 'No action needed' });
      }

      await availability.save();
      return res.json({ message: 'Availability updated' });
    } catch (err) {
      console.error('Error in POST /api/schedule/availability:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

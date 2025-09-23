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
 * PUBLIC endpoint for fetching available slots for a single admin.
 * GET /api/schedule/available-slots?adminId=...&start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * - If adminId query param is present, it will be used.
 * - Otherwise falls back to process.env.ADMIN_ID.
 * - No authentication required (so booking page can use it). If you want auth, re-add middleware.
 */
router.get(
  '/available-slots',
  async (req, res) => {
    try {
      // Prefer adminId from query param (so public clients can request availability for that admin).
      const adminIdFromQuery = req.query.adminId;
      const ADMIN_ID = adminIdFromQuery || process.env.ADMIN_ID;

      if (!ADMIN_ID) {
        return res.status(400).json({ message: 'No ADMIN_ID configured and no adminId query parameter provided' });
      }

      // Validate start & end
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ message: 'Missing start or end query parameter' });
      }

      // Normalize start/end into Date objects
      const startDate = new Date(String(start));
      const endDate = new Date(String(end));
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid start or end date format. Use YYYY-MM-DD' });
      }

      // 1) Remove past slots for this admin
      await cleanupPastSlots(ADMIN_ID);

      // 2) Fetch schedules in [start, end]
      const availabilities = await Schedule.find({
        adminId: ADMIN_ID,
        date: {
          $gte: startDate,
          $lte: endDate
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

/**
 * Admin-only: bulk update availability for a day (add/remove many slots).
 * POST /api/schedule/availability/bulk
 *
 * Payload: { date, day_of_week, time_slots: [...], slot_type, is_available }
 */
router.post(
  '/availability/bulk',
  authenticateAdmin,
  async (req, res) => {
    try {
      const adminId = req.user.userId;
      const { date, day_of_week, time_slots, slot_type, is_available } = req.body;
      if (!date || !Array.isArray(time_slots) || typeof is_available !== 'boolean' || !slot_type) {
        return res.status(400).json({ message: 'Missing required fields for bulk update' });
      }

      const dayDate = new Date(date);
      dayDate.setUTCHours(0, 0, 0, 0);

      let availability = await Schedule.findOne({ adminId, date: dayDate });

      if (!availability && is_available) {
        // If no schedule exists for this day and we are marking as available, create it.
        availability = new Schedule({
          adminId,
          date: dayDate,
          dayOfWeek: day_of_week,
          slots: time_slots.map(time => ({
            time: time,
            isAvailable: true,
            slotType: slot_type
          }))
        });
      } else if (availability) {
        // If a schedule exists, update it
        time_slots.forEach(time_slot => {
          const idx = availability.slots.findIndex(s => s.time === time_slot);
          if (idx !== -1) {
            // If the slot exists, update its availability and type
            availability.slots[idx].isAvailable = is_available;
            availability.slots[idx].slotType = slot_type;
          } else if (is_available) {
            // If the slot doesn't exist but should be available, add it
            availability.slots.push({
              time: time_slot,
              isAvailable: true,
              slotType: slot_type
            });
          }
        });
        
        // If un-selecting, remove the slots from the array
        if (!is_available) {
            availability.slots = availability.slots.filter(s => !time_slots.includes(s.time));
        }

        // If no slots remain for the day, delete the whole document
        if (availability.slots.length === 0) {
            await Schedule.deleteOne({ _id: availability._id });
            return res.json({ message: 'Availability removed for the day' });
        }
      } else {
        // No schedule exists and we are un-selecting, so no action is needed.
        return res.json({ message: 'No action needed' });
      }

      await availability.save();
      return res.json({ message: 'Availability updated in bulk' });
    } catch (err) {
      console.error('Error in POST /api/schedule/availability/bulk:', err);
      return res.status(500).json({ message: 'Server error during bulk update' });
    }
  }
);

export default router;

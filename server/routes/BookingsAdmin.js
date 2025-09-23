// server/routes/bookingsAdmin.js
import express from 'express';
import Booking from '../models/booking.js';
import Schedule from '../models/schedule.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/bookings/admin?date=YYYY-MM-DD
 * Only an admin can call this. Returns all bookings for that admin on the given date.
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    // Expecting "date" in the query-string, e.g. ?date=2025-05-31
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Missing "date" query parameter' });
    }

    // Build start-of-day and end-of-day (UTC) for that date:
    // e.g., "2025-05-31T00:00:00.000Z" → "2025-05-31T23:59:59.999Z"
    const dayStart = new Date(date + 'T00:00:00.000Z');
    const dayEnd   = new Date(date + 'T23:59:59.999Z');

    // Filter by:
    // 1) adminId must match the logged-in admin’s userId
    // 2) session.date must fall between dayStart and dayEnd
    const bookings = await Booking.find({
      adminId:        req.user.userId,
      'session.date': { $gte: dayStart, $lte: dayEnd }
    }).sort({ 'session.timeSlot': 1 });

    return res.json(bookings);
  } catch (err) {
    console.error('Error in GET /api/bookings/admin:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

 
router.patch('/:id', authenticateAdmin, async (req, res) => {
  const bookingId = req.params.id;
  let { newDate, newTimeSlot, newDuration, newNotes } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.adminId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your booking' });
    }

    const oldDateISO  = booking.session.date.toISOString().slice(0, 10);
    const oldTimeSlot = booking.session.timeSlot;

    const isDateChanged = newDate && newDate !== oldDateISO;
    const isTimeChanged = newTimeSlot && newTimeSlot !== oldTimeSlot;

    if (isDateChanged || isTimeChanged) {
      // If the date changes but user didn’t supply newTimeSlot, default to the old one:
      if (isDateChanged && !newTimeSlot) {
        newTimeSlot = oldTimeSlot;
      }

      // FIX: The logic to free the old slot now runs if date OR time changes.
      // Free the old slot
      const oldDayStart = new Date(oldDateISO);
      oldDayStart.setUTCHours(0, 0, 0, 0);
      const oldSchedule = await Schedule.findOne({
        adminId: req.user.userId,
        date:    oldDayStart
      });
      if (oldSchedule) {
        const idxOld = oldSchedule.slots.findIndex(
          slot =>
            slot.time.trim().toLowerCase() ===
            oldTimeSlot.trim().toLowerCase()
        );
        if (idxOld !== -1) {
          oldSchedule.slots[idxOld].isAvailable = true;
          await oldSchedule.save();
        }
      }

      // Occupy the new slot
      const actualNewDate = isDateChanged ? newDate : oldDateISO;
      if (isNaN(Date.parse(actualNewDate))) {
        return res.status(400).json({ message: 'Invalid new date' });
      }
      const newDayStart = new Date(actualNewDate);
      newDayStart.setUTCHours(0, 0, 0, 0);

      const newSchedule = await Schedule.findOne({
        adminId: req.user.userId,
        date:    newDayStart
      });
      if (!newSchedule) {
        return res
          .status(400)
          .json({ message: `No schedule found for ${actualNewDate}` });
      }

      const normalizedIncoming = newTimeSlot.trim().toLowerCase();
      const idxNew = newSchedule.slots.findIndex(slot =>
        slot.time.trim().toLowerCase() === normalizedIncoming
      );
      if (idxNew === -1) {
        return res.status(400).json({
          message: 'Selected time slot does not exist on that date'
        });
      }
      if (!newSchedule.slots[idxNew].isAvailable) {
        return res.status(400).json({
          message: 'Selected time slot is already occupied'
        });
      }
      newSchedule.slots[idxNew].isAvailable = false;
      await newSchedule.save();
    }

    // 3) Finally, update the booking document
    if (newDate) {
      booking.session.date = new Date(newDate);
    }
    if (newTimeSlot) {
      booking.session.timeSlot = newTimeSlot;
    }
    if (typeof newDuration === 'number') {
      booking.session.duration = newDuration;
    }
    if (typeof newNotes === 'string') {
      booking.session.notes = newNotes;
    }
    await booking.save();

    return res.json({ success: true, booking });
  } catch (err) {
    console.error('Error in PATCH /api/bookings/admin/:id:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', authenticateAdmin, async (req, res) => {
  const adminId = req.user.userId;
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    mode,
    date,
    timeSlot,
    duration,
    notes,
  } = req.body;

  // 1) Basic validation
  if (
    !firstName ||
    !lastName ||
    !email ||
    !mode ||
    !date ||
    !timeSlot ||
    !duration
  ) {
    return res
      .status(400)
      .json({ message: 'Missing required fields for creating a session' });
  }

  // 2) Parse date string "YYYY-MM-DD" → midnight UTC
  const bookingDate = new Date(date);
  bookingDate.setUTCHours(0, 0, 0, 0);
  if (isNaN(bookingDate.valueOf())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  try {
    // 3) Look up the Schedule document for that admin/date
    const scheduleDoc = await Schedule.findOne({
      adminId,
      date: bookingDate,
    });
    if (!scheduleDoc) {
      return res
        .status(400)
        .json({ message: `No schedule found for ${date}` });
    }

    // 4) Find & validate the requested timeSlot
    const normalizedIncoming = (timeSlot).trim().toLowerCase();
    const idx = scheduleDoc.slots.findIndex(slot =>
      slot.time.trim().toLowerCase() === normalizedIncoming
    );
    if (idx === -1) {
      return res
        .status(400)
        .json({ message: 'Chosen time slot does not exist on that date' });
    }
    if (!scheduleDoc.slots[idx].isAvailable) {
      return res
        .status(400)
        .json({ message: 'Chosen time slot is already occupied' });
    }

    // 5) Mark that slot unavailable
    scheduleDoc.slots[idx].isAvailable = false;
    await scheduleDoc.save();

    // 6) Create the Booking document
    const newBooking = new Booking({
      adminId,
      user: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        dob: dob ? dob : undefined,
        phone: phone ? phone : undefined,
      },
      session: {
        mode,
        date: bookingDate,
        timeSlot: timeSlot.trim(),
        duration,
        notes: notes ? notes.trim() : undefined,
      },
      status: 'confirmed',
      paymentId: undefined,
    });
    await newBooking.save();

    return res
      .status(201)
      .json({ message: 'Session created successfully', booking: newBooking });
  } catch (err) {
    console.error('Error in POST /api/bookings/admin:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// server/routes/bookings.js
import express from 'express';
import Booking from '../models/booking.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Notification from '../models/notification.js'; 

const router = express.Router();

// ── Create a new booking ────────────────────────────────────────────
// POST /api/bookings
router.post('/', authenticateToken, async (req, res) => {
  // Expecting in the request body:
  // {
  //   adminId: string,
  //   session: { mode, date, timeSlot, ... },
  //   user: { firstName, lastName, dob, phone }
  // }
  const { adminId, session, user: clientUser } = req.body;

  if (!adminId || !session || !clientUser) {
    return res
      .status(400)
      .json({ message: 'adminId, session, and user are required.' });
  }

  try {
    // 1) Build the nested "user" object with email from JWT
    const userInfo = {
      firstName: clientUser.firstName,
      lastName:  clientUser.lastName,
      email:     req.user.email,  // comes from authenticateToken
      dob:       clientUser.dob,
      phone:     clientUser.phone,
    };

    // 2) Create the Booking document (status defaults to "pending")
    const booking = new Booking({
      adminId,
      user:    userInfo,
      session, 
      status:  'pending payment', // or simply 'pending'
    });

    await booking.save();

    // 3) Create a notification that an appointment was created
    await Notification.create({
      adminId: booking.adminId,
      type: 'appointment_created',
      title: 'New appointment scheduled',
      message: `${userInfo.firstName} ${userInfo.lastName} scheduled a session on ${new Date(
        booking.session.date
      ).toDateString()} at ${booking.session.timeSlot}`,
      bookingId: booking._id
    });

    // 4) Return the new booking's ID to the client
    return res.json({ bookingId: booking._id });
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Get user's booking history ───────────────────────────────────────
// GET /api/bookings/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // Find all bookings where the nested user.email matches
    const bookings = await Booking.find({ 'user.email': req.user.email })
      .sort({ createdAt: -1 });

    const history = bookings.map((bk) => ({
      bookingId:   bk._id,
      date:        bk.session.date,
      timeSlot:    bk.session.timeSlot,
      sessionType: bk.session.mode,
      status:      bk.status,
      createdAt:   bk.createdAt,
      notes:       bk.session.notes || null
    }));

    return res.json(history);
  } catch (error) {
    console.error('Error in GET /api/bookings/history:', error);
    return res.status(500).json({ message: error.message });
  }
});

// ── Get all bookings for a client by email ──────────────────────────
// GET /api/bookings/client/:email
router.get('/client/:email', authenticateToken, async (req, res) => {
  try {
    const clientEmail = req.params.email;
    const bookings = await Booking.find({ 'user.email': clientEmail })
      .sort({ 'session.date': -1, 'session.timeSlot': 1 });
    const result = bookings.map((bk) => ({
      id:       bk._id.toString(),
      mode:     bk.session.mode,
      date:     bk.session.date,
      time:     bk.session.timeSlot,
      duration: bk.session.duration,
      notes:    bk.session.notes || '',
    }));
    return res.json(result);
  } catch (error) {
    console.error('Error in GET /api/bookings/client/:email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ── Update a single session.note by booking ID ──────────────────────
// PUT /api/bookings/:bookingId/note
router.put('/:bookingId/note', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes } = req.body;  // e.g. { notes: 'new notes text' }

    if (typeof notes !== 'string') {
      return res.status(400).json({ message: 'notes must be a string' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.session.notes = notes;
    await booking.save();
    return res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error in PUT /api/bookings/:bookingId/note:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

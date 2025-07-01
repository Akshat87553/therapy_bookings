import express from 'express';
import TimeSlot from '../models/TimeSlot.js';

const router = express.Router();

// Get available time slots
router.get('/admin', async (req, res) => {
  try {
    const { date, instructorId, sessionType } = req.query;
    const query = { isAvailable: true };
    
    if (date) query.date = new Date(date);
    if (instructorId) query.instructor = instructorId;
    if (sessionType) query.sessionType = sessionType;

    const timeSlots = await TimeSlot.find(query).populate('instructor');
    res.json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
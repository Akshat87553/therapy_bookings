// server/routes/publicFees.js
import express from 'express';
import Fees from '../models/Fees.js';

const router = express.Router();

/**
 * GET /api/public/fees/:adminId
 * Public endpoint—no authentication required.
 * Returns the given admin’s fee settings (or defaults if none).
 */
router.get('/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    let fees = await Fees.findOne({ adminId }).lean();

    if (!fees) {
      // Return the same defaults you used before
      fees = {
        online: {
          price30:   900,
          price50:   1800,
          single30:  true,
          single50:  true,
          package30: true,
          package50: true,
        },
        inPerson: {
          price30:   900,
          price50:   1800,
          single30:  true,
          single50:  true,
          package30: true,
          package50: true,
        },
        offerCouplesTherapy: false,
      };
    }

    return res.json(fees);
  } catch (err) {
    console.error('Error in GET /api/public/fees/:adminId:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

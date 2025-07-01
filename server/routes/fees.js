// server/routes/fees.js
import express from 'express';
import Fees from '../models/Fees.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/fees
 * Returns the logged-in admin’s Fees document. If none exists, returns defaults.
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.userId;
    let fees = await Fees.findOne({ adminId }).lean();

    if (!fees) {
      // Return a default structure if none exists yet:
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
        offerCouplesTherapy: false
      };
    }

    return res.json(fees);
  } catch (err) {
    console.error('Error in GET /api/fees:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


/**
 * POST /api/fees
 * Creates or updates the admin’s Fees document.
 * Expects body:
 * {
 *   online: {
 *     price30, price50, single30, single50, package30, package50
 *   },
 *   inPerson: {
 *     price30, price50, single30, single50, package30, package50
 *   },
 *   offerCouplesTherapy
 * }
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.userId;
    const {
      online,
      inPerson,
      offerCouplesTherapy
    } = req.body;

    if (
      !online ||
      typeof online.price30 !== 'number' ||
      typeof online.price50 !== 'number' ||
      typeof online.single30 !== 'boolean' ||
      typeof online.single50 !== 'boolean' ||
      typeof online.package30 !== 'boolean' ||
      typeof online.package50 !== 'boolean' ||
      !inPerson ||
      typeof inPerson.price30 !== 'number' ||
      typeof inPerson.price50 !== 'number' ||
      typeof inPerson.single30 !== 'boolean' ||
      typeof inPerson.single50 !== 'boolean' ||
      typeof inPerson.package30 !== 'boolean' ||
      typeof inPerson.package50 !== 'boolean' ||
      typeof offerCouplesTherapy !== 'boolean'
    ) {
      return res.status(400).json({ message: 'Invalid fee data' });
    }

    // Upsert: if no document exists, create; otherwise update
    const updated = await Fees.findOneAndUpdate(
      { adminId },
      {
        adminId,
        online,
        inPerson,
        offerCouplesTherapy
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ message: 'Fees saved', fees: updated });
  } catch (err) {
    console.error('Error in POST /api/fees:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

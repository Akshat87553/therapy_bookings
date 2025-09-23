import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { parse, addMinutes, format } from 'date-fns';
import Booking from '../models/booking.js';
import Schedule from '../models/schedule.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();

// --- FIX: Lazy initialization of Razorpay ---
// We declare the variable here but don't create the instance yet.
let razorpayInstance;

// This function creates the instance the first time it's needed.
// After that, it returns the existing instance.
function getRazorpay() {
  if (!razorpayInstance) {
    // This code will now run long after the .env file has been loaded.
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}
// --- End of Fix ---


// Create a Razorpay order for an existing booking
// POST /api/payments/create-order
router.post('/create-order', authenticateToken, async (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || typeof amount !== 'number') {
    return res
      .status(400)
      .json({ message: 'bookingId (string) and amount (number) required' });
  }

  try {
    const existing = await Booking.findById(bookingId);
    if (!existing) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Use the function to get the initialized instance
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paise
      currency: 'INR',
      receipt: bookingId,
    });

    return res.json({ orderId: order.id });
  } catch (error) {
    console.error('Error in POST /api/payments/create-order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Verify Razorpay payment and update booking status
// POST /api/payments/verify
router.post('/verify', authenticateToken, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } =
    req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    try {
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'paid',
          paymentId: razorpay_payment_id,
        },
        { new: true }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: 'Booking not found for update' });
      }

      const sessionDate = updated.session.date;
      const sessionTime = updated.session.timeSlot;
      const adminId = updated.adminId;
      const parsed = parse(sessionTime, 'hh:mm a', new Date());
      const nextTime = format(addMinutes(parsed, 30), 'hh:mm a');

      await Schedule.findOneAndUpdate(
        { adminId, date: sessionDate },
        { $set: { 'slots.$[s].isAvailable': false } },
        { arrayFilters: [{ 's.time': sessionTime }] }
      );

      await Schedule.findOneAndUpdate(
        { adminId, date: sessionDate },
        { $set: { 'slots.$[s].isAvailable': false } },
        { arrayFilters: [{ 's.time': nextTime }] }
      );

      return res.json({ success: true });
    } catch (dbErr) {
      console.error('Error updating booking status in /verify:', dbErr);
      return res
        .status(500)
        .json({ message: 'Payment verified but failed to update booking' });
    }
  } else {
    return res.json({ success: false, message: 'Invalid signature' });
  }
});

export default router;


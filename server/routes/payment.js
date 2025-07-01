// server/routes/payment.js
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { parse, addMinutes, format } from 'date-fns';
import Booking from '../models/Booking.js';
import Schedule from '../models/schedule.js';


const router = express.Router();

// ── Hardcoded Razorpay credentials (dev only) ───────────────────────
const razorpay = new Razorpay({
  key_id: 'rzp_test_bJKekDM14mOARz',
  key_secret: 'yzvksslms5VCroVOUIln5Inq',
});

// Create a Razorpay order for an existing booking
// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || typeof amount !== 'number') {
    return res
      .status(400)
      .json({ message: 'bookingId (string) and amount (number) required' });
  }

  try {
    // 1) Ensure the booking actually exists:
    const existing = await Booking.findById(bookingId);
    if (!existing) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2) Create the Razorpay order (receipt = bookingId)
    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paise
      currency: 'INR',
      receipt: bookingId,
    });

    // 3) Return the order ID back to the client
    return res.json({ orderId: order.id });
  } catch (error) {
    console.error('Error in POST /api/payments/create-order:', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Verify Razorpay payment and update booking status
// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } =
    req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  // 1) Recompute the signature
  const generatedSignature = crypto
    .createHmac('sha256', 'yzvksslms5VCroVOUIln5Inq') // same hardcoded secret
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    try {
      // 2) Mark the booking as "paid" in MongoDB
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status:    'paid',
          paymentId: razorpay_payment_id,
        },
        { new: true }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: 'Booking not found for update' });
      }

 // 2) Extract date/time/adminId from the returned document:
    const sessionDate = updated.session.date;      
    const sessionTime = updated.session.timeSlot;
    const adminId     = updated.adminId;

    // 3) Compute the “next” half-hour slot
    const parsed      = parse(sessionTime, 'hh:mm a', new Date());
    const nextTime    = format(addMinutes(parsed, 30), 'hh:mm a');

    // 4a) Mark the booked slot unavailable
    await Schedule.findOneAndUpdate(
      { adminId, date: sessionDate },
      { $set: { 'slots.$[s].isAvailable': false } },
      { arrayFilters: [{ 's.time': sessionTime }] }
    );

    // 4b) Also mark the neighbor slot unavailable
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
    // Signature mismatch
    return res.json({ success: false, message: 'Invalid signature' });
  }
});

export default router;

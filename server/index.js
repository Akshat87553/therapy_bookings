/* index.js */
process.env.TZ = "Asia/Kolkata";

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import cron from 'node-cron';

// Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root, not from server/
dotenv.config({ path: path.resolve(__dirname, './.env') });

console.log('Loaded env:', {
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
});


import express from 'express';
import cors from 'cors';

import nodemailer from "nodemailer";

import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import timeSlotRoutes from './routes/timeSlots.js';
import scheduleRoutes from './routes/schedule.js';
import notificationsRoutes, { handleReschedule } from './routes/Notification.js';
import authAdminRoutes from './routes/authAdmin.js';
import paymentRoutes from './routes/payment.js';
import bookingsAdminRoutes from './routes/BookingsAdmin.js';
import ClientRoutes from './routes/Client.js';
import Notification from './models/notification.js';
import Booking from './models/Booking.js';
import feesRoutes from './routes/fees.js';
import userRoutes from './routes/user.js';
import publicFeesRoutes from './routes/publicFees.js';


import { authenticateToken, authenticateAdmin } from './middleware/authMiddleware.js';


const app = express();
const PORT = process.env.PORT || 5000;



// CORS & JSON
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());


// Rate limiter for login
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 100000, max: 5, message: 'Too many login attempts' }));

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/admin', authAdminRoutes);
app.use('/api/bookings/admin', bookingsAdminRoutes);

// Protected user routes
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/time-slots', authenticateToken, timeSlotRoutes);
app.use('/api/clients', authenticateToken, ClientRoutes);
app.use( '/api/notifications', authenticateAdmin, notificationsRoutes);
app.post('/api/notifications/reschedule',authenticateToken,  handleReschedule);
app.use('/api/fees', authenticateAdmin, feesRoutes);
app.use('/api/public/fees', publicFeesRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes)

// Schedule routes (handles its own auth internally)
app.use('/api/schedule', scheduleRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Connect & start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB connected');
     app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    
        // ────────────────
    // CRON JOB: check for reminders every minute
    // ────────────────
 cron.schedule("0,30 * * * *", async () => {
      const now = new Date();

      // Log both UTC and IST so you can confirm you’re in sync
      console.log(
        "[cron][check-reminders] now (UTC):",
        now.toISOString(),
        "now (IST):",
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      // ── 24-hour reminders ──────────────────────────────────
      try {
        // 24 h ±30s window
        const window24Start = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 30 * 1000);
        const window24End = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 1000);

        console.log(
          "[cron][24h] window:",
          window24Start.toISOString(),
          "→",
          window24End.toISOString()
        );
        const toRemind24 = await Booking.find({
          "session.date": { $gte: window24Start, $lte: window24End },
          reminder24Sent: false,
          status: "paid",
        });
        console.log("[cron][24h] matched:", toRemind24.length);

        for (const bk of toRemind24) {
          console.log(
            `[cron][24h] Creating Notification for booking ${bk._id} (admin ${bk.adminId})`
          );
          await Notification.create({
            adminId: bk.adminId,
            type: "appointment_reminder",
            title: "Upcoming appointment in 24 hours",
            message: `Session with ${bk.user.firstName} ${bk.user.lastName} on ${bk.session.date.toLocaleString(
              "en-US",
              { timeZone: "Asia/Kolkata" }
            )} is 24 h away.`,
            bookingId: bk._id,
          });
          bk.reminder24Sent = true;
          await bk.save();
          console.log(`[cron][24h] booked ${bk._id} marked reminder24Sent=true`);
        }
      } catch (err) {
        console.error("[cron][24h] ERROR:", err);
      }

      // ── 10-minute reminders ───────────────────────────────
      try {
        // 10 min ±15s window
        const window10Start = new Date(now.getTime() + 10 * 60 * 1000 - 15 * 1000);
        const window10End = new Date(now.getTime() + 10 * 60 * 1000 + 15 * 1000);

        console.log(
          "[cron][10m] window:",
          window10Start.toISOString(),
          "→",
          window10End.toISOString()
        );
        const toRemind10 = await Booking.find({
          "session.date": { $gte: window10Start, $lte: window10End },
          reminder10Sent: false,
          status: "paid",
        });
        console.log("[cron][10m] matched:", toRemind10.length);

        for (const bk of toRemind10) {
          console.log(
            `[cron][10m] Creating Notification for booking ${bk._id} (admin ${bk.adminId})`
          );
          await Notification.create({
            adminId: bk.adminId,
            type: "appointment_reminder",
            title: "Upcoming appointment in 10 minutes",
            message: `Session with ${bk.user.firstName} ${bk.user.lastName} starts at ${bk.session.date.toLocaleString(
              "en-US",
              { timeZone: "Asia/Kolkata" }
            )}.`,
            bookingId: bk._id,
          });
          bk.reminder10Sent = true;
          await bk.save();
          console.log(`[cron][10m] booked ${bk._id} marked reminder10Sent=true`);
        }
      } catch (err) {
        console.error("[cron][10m] ERROR:", err);
      }
    });
  })
  .catch((err) => {
    console.error("❌ DB error:", err);
    process.exit(1);
  });
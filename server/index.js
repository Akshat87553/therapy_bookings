/**
 * Load environment variables from .env file at the project root.
 * This MUST be the first line of code to ensure all modules have access to process.env
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config({ path: path.resolve(fileURLToPath(import.meta.url), '../../.env') });

// --- START: Environment Variable Debug Check ---
// This will print the loaded keys to the console on server start.
console.log('--- [DEBUG] Loaded Environment Variables ---');
console.log(`[DEBUG] RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID}`);
console.log(`[DEBUG] RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : 'NOT FOUND'}`);
console.log('------------------------------------------');
// --- END: Debug Check ---

/* --- Essential Imports --- */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

/* --- Route Imports --- */
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import scheduleRoutes from './routes/schedule.js';
import notificationsRoutes, { handleReschedule } from './routes/Notification.js';
import paymentRoutes from './routes/payment.js';
import bookingsAdminRoutes from './routes/BookingsAdmin.js';
import feesRoutes from './routes/fees.js';
import userRoutes from './routes/user.js';
import publicFeesRoutes from './routes/publicFees.js';

/* --- Model Imports for Cron Job --- */
import Notification from './models/notification.js';
import Booking from './models/booking.js';

/* --- Middleware Imports --- */
import { authenticateToken, authenticateAdmin } from './middleware/authMiddleware.js';

/* --- App Initialization --- */
const app = express();
const PORT = process.env.PORT || 5000;
process.env.TZ = "Asia/Kolkata"; // Set timezone for server-side date operations

/* --- Middleware Setup --- */
// Configure CORS to allow requests from your frontend development servers
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.1.4:5173/', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Apply a rate limiter to the login route to prevent brute-force attacks
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts, please try again later.' }));


/* --- Route Definitions --- */

// Public routes (authentication not required)
app.use('/api/auth', authRoutes);
app.use('/api/public/fees', publicFeesRoutes);

// Publicly accessible route to see available slots
app.use('/api/schedule', scheduleRoutes);

// User-authenticated routes (requires a valid user token)
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.post('/api/notifications/reschedule', authenticateToken, handleReschedule); // Special case for reschedule requests

// Admin-authenticated routes (requires a valid admin token)
app.use('/api/bookings/admin', authenticateAdmin, bookingsAdminRoutes);
app.use('/api/notifications', authenticateAdmin, notificationsRoutes);
app.use('/api/fees', authenticateAdmin, feesRoutes);
app.use('/api/users', authenticateAdmin, userRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

/* --- Database Connection & Server Start --- */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

    // ────────────────
    // CRON JOB: check for reminders every 30 minutes
    // ────────────────
    cron.schedule("0,30 * * * *", async () => {
      const now = new Date();
      console.log(`[cron] Running reminder check at ${now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`);

      // 24-hour reminders
      try {
        const window24Start = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 30 * 1000);
        const window24End = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 1000);
        
        const toRemind24 = await Booking.find({
          "session.date": { $gte: window24Start, $lte: window24End },
          reminder24Sent: false,
          status: "paid",
        });

        if (toRemind24.length > 0) console.log(`[cron][24h] Found ${toRemind24.length} booking(s) to remind.`);
        
        for (const bk of toRemind24) {
          await Notification.create({
            adminId: bk.adminId,
            type: "appointment_reminder",
            title: "Upcoming appointment in 24 hours",
            message: `Session with ${bk.user.firstName} ${bk.user.lastName} on ${bk.session.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} is 24 hours away.`,
            bookingId: bk._id,
          });
          bk.reminder24Sent = true;
          await bk.save();
        }
      } catch (err) {
        console.error("[cron][24h] ERROR:", err);
      }

      // 10-minute reminders
      try {
        const window10Start = new Date(now.getTime() + 10 * 60 * 1000 - 15 * 1000);
        const window10End = new Date(now.getTime() + 10 * 60 * 1000 + 15 * 1000);

        const toRemind10 = await Booking.find({
          "session.date": { $gte: window10Start, $lte: window10End },
          reminder10Sent: false,
          status: "paid",
        });
        
        if (toRemind10.length > 0) console.log(`[cron][10m] Found ${toRemind10.length} booking(s) to remind.`);

        for (const bk of toRemind10) {
          await Notification.create({
            adminId: bk.adminId,
            type: "appointment_reminder",
            title: "Upcoming appointment in 10 minutes",
            message: `Session with ${bk.user.firstName} ${bk.user.lastName} starts at ${bk.session.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}.`,
            bookingId: bk._id,
          });
          bk.reminder10Sent = true;
          await bk.save();
        }
      } catch (err) {
        console.error("[cron][10m] ERROR:", err);
      }
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });


// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'new_user',
      'payment_received',
      'appointment_created',
      'appointment_reminder',
      'appointment_reschedule'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking',
    default: null 
  },
  read: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);

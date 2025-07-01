import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',        // was 'Admin', now matches your User model
    required: true 
  },
  user: {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true },
    dob:       { type: String },
    phone:     { type: String }
  },
  session: {
    mode:     { type: String, required: true },   // 'in-person' | 'online'
    date:     { type: Date,   required: true },
    timeSlot: { type: String, required: true },
    notes:    { type: String }, 
    duration: { type: Number, default: 50 },                   // optional
  },
  status:    { type: String, default: 'pending payment' },
  paymentId: { type: String },
   // Flags to ensure we send each reminder only once:
 reminder24Sent: { type: Boolean, default: false },
 reminder10Sent: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);

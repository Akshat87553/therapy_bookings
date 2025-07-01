import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true },       // e.g. "12:00 AM"
  isAvailable: { type: Boolean, required: true },
  slotType: { type: String, required: true }    // renamed from `type` to avoid Mongoose reserved key
});

const availabilitySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  date: {
    type: Date,
    required: true    // full date, e.g. "2025-05-23"
  },
  dayOfWeek: {
    type: String,
    required: true    // e.g. "Friday"
  },
  slots: [slotSchema]
});

export default mongoose.model('Schedule', availabilitySchema);
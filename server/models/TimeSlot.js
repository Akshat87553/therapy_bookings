import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  sessionType: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('TimeSlot', timeSlotSchema);
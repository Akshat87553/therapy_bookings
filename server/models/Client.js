import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initials: { type: String, required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Client', ClientSchema);
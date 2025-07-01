import mongoose from 'mongoose';

const SessionNoteSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  type: { type: String, enum: ['video', 'in-person'], required: true },
  notes: [String]
});

export default mongoose.model('SessionNote', SessionNoteSchema);
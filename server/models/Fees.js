// server/models/Fees.js
import mongoose from 'mongoose';

const feesSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // one Fees document per admin
  },
  online: {
    price30:    { type: Number, required: true },
    price50:    { type: Number, required: true },
    single30:   { type: Boolean, default: true },
    single50:   { type: Boolean, default: true },
    package30:  { type: Boolean, default: true },
    package50:  { type: Boolean, default: true },
  },
  inPerson: {
    price30:    { type: Number, required: true },
    price50:    { type: Number, required: true },
    single30:   { type: Boolean, default: true },
    single50:   { type: Boolean, default: true },
    package30:  { type: Boolean, default: true },
    package50:  { type: Boolean, default: true },
  },
  offerCouplesTherapy: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Fees', feesSchema);

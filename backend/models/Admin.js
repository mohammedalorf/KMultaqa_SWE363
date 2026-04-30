import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    default: null,
  },
  passwordSetupToken: {
    type: String,
  },
  passwordSetupExpires: {
    type: Date,
  },
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);

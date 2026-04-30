import mongoose from 'mongoose';

const { Schema } = mongoose;

const clubCategories = [
  'academic',
  'technical',
  'sports',
  'volunteering',
  'cultural',
  'social',
  'other',
];

const clubRequestSchema = new Schema({
  clubName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: clubCategories,
  },
  representativeName: {
    type: String,
    required: true,
    trim: true,
  },
  representativeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  representativeStudentId: {
    type: String,
    required: true,
    trim: true,
  },
  requestedEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
});

export default mongoose.models.ClubRequest ||
  mongoose.model('ClubRequest', clubRequestSchema);

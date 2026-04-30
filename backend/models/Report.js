import mongoose from 'mongoose';

const { Schema } = mongoose;

const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  target: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel',
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['Club', 'Post', 'Event'],
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    trim: true,
  },
  reviewedAt: {
    type: Date,
  },
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  audience: {
    type: String,
    enum: ['all', 'students', 'clubs'],
    default: 'all',
  },
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active',
  },
});

export default mongoose.models.Announcement ||
  mongoose.model('Announcement', announcementSchema);

import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
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
      enum: ['Post', 'Event'],
    },
    type: {
      type: String,
      required: true,
      enum: ['post', 'event'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ student: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ student: 1, target: 1, targetModel: 1 }, { unique: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

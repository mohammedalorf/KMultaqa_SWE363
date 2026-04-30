import mongoose from 'mongoose';
import { notifyFollowersAboutClubContent } from '../src/utils/notifications.js';

const { Schema } = mongoose;

const eventCategories = [
  'academic',
  'technical',
  'sports',
  'volunteering',
  'cultural',
  'social',
  'other',
];

const registrationFieldSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      required: true,
      enum: ['text', 'number', 'email', 'select', 'checkbox', 'radio'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const eventSchema = new Schema({
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  title: {
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
    enum: eventCategories,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
    validate: {
      validator(value) {
        return !this.startDateTime || value > this.startDateTime;
      },
      message: 'End date and time must be after start date and time',
    },
  },
  location: {
    type: String,
    trim: true,
  },
  capacity: {
    type: Number,
    min: 1,
  },
  imageUrl: {
    type: String,
  },
  registrationFields: [registrationFieldSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published',
  },
});

eventSchema.pre('save', function markNewEvent() {
  this.$locals.wasNew = this.isNew;
});

eventSchema.post('save', async function createEventNotifications(doc) {
  if (!doc.$locals?.wasNew || doc.status !== 'published') {
    return;
  }

  try {
    await notifyFollowersAboutClubContent({
      clubId: doc.club,
      targetId: doc._id,
      targetModel: 'Event',
      type: 'event',
    });
  } catch (error) {
    console.error('Failed to create event notifications', error);
  }
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);

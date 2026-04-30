import mongoose from 'mongoose';
import { notifyFollowersAboutClubContent } from '../src/utils/notifications.js';

const { Schema } = mongoose;

const postSchema = new Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active',
  },
});

postSchema.pre('save', function markNewPost() {
  this.$locals.wasNew = this.isNew;
});

postSchema.post('save', async function createPostNotifications(doc) {
  if (!doc.$locals?.wasNew || doc.status !== 'active') {
    return;
  }

  try {
    await notifyFollowersAboutClubContent({
      clubId: doc.club,
      targetId: doc._id,
      targetModel: 'Post',
      type: 'post',
    });
  } catch (error) {
    console.error('Failed to create post notifications', error);
  }
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);

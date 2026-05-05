import mongoose from 'mongoose';

const { Schema } = mongoose;

const studentClubNotificationPreferenceSchema = new Schema(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const studentNotificationPreferencesSchema = new Schema(
  {
    email: {
      type: String,
      enum: ['on', 'off'],
      default: 'on',
    },
    clubs: [studentClubNotificationPreferenceSchema],
  },
  { _id: false }
);

const studentSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@kfupm\.edu\.sa$/i, 'Email must be a KFUPM email address'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  followedClubs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Club',
    },
  ],
  notificationPreferences: {
    type: studentNotificationPreferencesSchema,
    default: () => ({
      email: 'on',
      clubs: [],
    }),
  },
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);

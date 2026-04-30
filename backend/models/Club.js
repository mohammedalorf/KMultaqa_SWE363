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

const socialLinksSchema = new Schema(
  {
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  { _id: false }
);

const clubSchema = new Schema({
  clubName: {
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
  logoUrl: {
    type: String,
  },
  bannerUrl: {
    type: String,
  },
  socialLinks: {
    type: socialLinksSchema,
    default: {},
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  suspensionReason: {
    type: String,
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  createdFromRequest: {
    type: Schema.Types.ObjectId,
    ref: 'ClubRequest',
  },
  approvedAt: {
    type: Date,
  },
});

export default mongoose.models.Club || mongoose.model('Club', clubSchema);

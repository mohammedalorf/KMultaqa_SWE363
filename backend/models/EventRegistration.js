import mongoose from 'mongoose';

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    fieldLabel: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const eventRegistrationSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  answers: [answerSchema],
  status: {
    type: String,
    enum: ['pending', 'registered', 'declined', 'cancelled'],
    default: 'registered',
  },
  reviewedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
});

eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.models.EventRegistration ||
  mongoose.model('EventRegistration', eventRegistrationSchema);

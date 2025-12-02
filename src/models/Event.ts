import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  date: string;
  location: string;
  attendees: number;
  description: string;
  type: string;
  price: string;
  status: 'upcoming' | 'past' | 'live';
  bannerImage: string;
  registrationUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    attendees: {
      type: Number,
      required: [true, 'Attendees count is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Conference', 'Workshop', 'Hackathon', 'Meetup', 'Webinar', 'Summit', 'Other'],
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['upcoming', 'past', 'live'],
      default: 'upcoming',
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    registrationUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'events',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as object).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for filtering and sorting
EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ type: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSubmission extends Document {
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  subscribeNewsletter: boolean;
  submittedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    company: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    subscribeNewsletter: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'contacts',
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

// Index for listing and filtering
ContactSubmissionSchema.index({ submittedAt: -1 });
ContactSubmissionSchema.index({ email: 1 });

export const ContactSubmission = mongoose.model<IContactSubmission>(
  'ContactSubmission',
  ContactSubmissionSchema
);

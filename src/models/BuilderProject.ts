import mongoose, { Schema, Document } from 'mongoose';
import { ISocialMediaLink } from '../types';

export interface IBuilderProject extends Document {
  title: string;
  creator: string;
  description: string;
  tech: string[];
  status: string;
  users: string;
  tvl: string;
  image: string;
  githubUrl: string;
  socialMedia: ISocialMediaLink[];
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialMediaLinkSchema = new Schema<ISocialMediaLink>(
  {
    platform: {
      type: String,
      required: true,
      lowercase: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const BuilderProjectSchema = new Schema<IBuilderProject>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    creator: {
      type: String,
      required: [true, 'Creator is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    tech: {
      type: [String],
      required: [true, 'Tech stack is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one technology is required',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Live', 'Beta', 'Development', 'Alpha', 'Deprecated'],
    },
    users: {
      type: String,
      required: [true, 'Users count is required'],
    },
    tvl: {
      type: String,
      required: [true, 'TVL is required'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    githubUrl: {
      type: String,
      required: [true, 'GitHub URL is required'],
    },
    socialMedia: {
      type: [SocialMediaLinkSchema],
      required: true,
      default: [],
    },
    websiteUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'builder_projects',
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

// Indexes for filtering
BuilderProjectSchema.index({ status: 1 });
BuilderProjectSchema.index({ tech: 1 });
BuilderProjectSchema.index({ title: 'text', description: 'text' });

export const BuilderProject = mongoose.model<IBuilderProject>('BuilderProject', BuilderProjectSchema);

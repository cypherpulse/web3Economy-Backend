import mongoose, { Schema, Document } from 'mongoose';
import { ISocialMediaLink, ICreatorCoinData } from '../types';

export interface ICreator extends Document {
  name: string;
  bio: string;
  profileImage: string;
  socialMedia: ISocialMediaLink[];
  creatorCoin: ICreatorCoinData;
  followers: string;
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

const CreatorCoinDataSchema = new Schema<ICreatorCoinData>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    marketCap: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    change24h: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const CreatorSchema = new Schema<ICreator>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      required: [true, 'Profile image is required'],
    },
    socialMedia: {
      type: [SocialMediaLinkSchema],
      required: true,
      default: [],
    },
    creatorCoin: {
      type: CreatorCoinDataSchema,
      required: [true, 'Creator coin data is required'],
    },
    followers: {
      type: String,
      required: [true, 'Followers count is required'],
    },
  },
  {
    timestamps: true,
    collection: 'creators',
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

// Index for searching
CreatorSchema.index({ name: 'text', bio: 'text' });

export const Creator = mongoose.model<ICreator>('Creator', CreatorSchema);

import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

// Stats subdocument interface
export interface IShowcaseStats {
  stars: number;
  users: string;
  tvl: string;
}

// Links subdocument interface
export interface IShowcaseLinks {
  website?: string;
  github?: string;
  twitter?: string;
  discord?: string;
  documentation?: string;
}

// Main Showcase interface
export interface IShowcase extends Document {
  title: string;
  slug: string;
  description: string;
  category: 'DeFi' | 'NFT' | 'DAO' | 'GameFi' | 'Infrastructure' | 'Social' | 'Tools' | 'Other';
  creator: string;
  image: string;
  tags: string[];
  stats: IShowcaseStats;
  links: IShowcaseLinks;
  featured: boolean;
  trending: boolean;
  recentlyAdded: boolean;
  color: 'mint' | 'gold';
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const showcaseStatsSchema = new Schema<IShowcaseStats>(
  {
    stars: { type: Number, default: 0 },
    users: { type: String, default: '0' },
    tvl: { type: String, default: '$0' },
  },
  { _id: false }
);

const showcaseLinksSchema = new Schema<IShowcaseLinks>(
  {
    website: { type: String },
    github: { type: String },
    twitter: { type: String },
    discord: { type: String },
    documentation: { type: String },
  },
  { _id: false }
);

const showcaseSchema = new Schema<IShowcase>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['DeFi', 'NFT', 'DAO', 'GameFi', 'Infrastructure', 'Social', 'Tools', 'Other'],
    },
    creator: {
      type: String,
      required: [true, 'Creator name is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    stats: {
      type: showcaseStatsSchema,
      default: () => ({
        stars: 0,
        users: '0',
        tvl: '$0',
      }),
    },
    links: {
      type: showcaseLinksSchema,
      default: () => ({}),
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    recentlyAdded: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      enum: ['mint', 'gold'],
      default: 'mint',
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Generate slug before saving
showcaseSchema.pre('save', function (next) {
  const doc = this as IShowcase;
  if (doc.isModified('title') || !doc.slug) {
    doc.slug = slugify(doc.title, { lower: true, strict: true });
  }
  
  // Auto-set recentlyAdded to false after 30 days
  if (doc.createdAt) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (doc.createdAt < thirtyDaysAgo) {
      doc.recentlyAdded = false;
    }
  }
  
  next();
});

// Text search index
showcaseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Query performance indexes
showcaseSchema.index({ category: 1, published: 1 });
showcaseSchema.index({ featured: 1, published: 1 });
showcaseSchema.index({ trending: 1, published: 1 });
showcaseSchema.index({ recentlyAdded: 1, published: 1 });
showcaseSchema.index({ 'stats.stars': -1 });

export const Showcase = mongoose.model<IShowcase>('Showcase', showcaseSchema);

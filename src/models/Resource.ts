import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IResource extends Document {
  title: string;
  description: string;
  type: 'Tutorial' | 'Documentation' | 'Tool' | 'Video';
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration: string;
  author: string;
  downloads: number;
  rating: number;
  students: number;
  image: string;
  resourceUrl: string;
  provider: string;
  tags: string[];
  slug: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['Tutorial', 'Documentation', 'Tool', 'Video'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 0,
      max: 5,
    },
    students: {
      type: Number,
      required: [true, 'Students count is required'],
      min: 0,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    resourceUrl: {
      type: String,
      required: [true, 'Resource URL is required'],
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'resources',
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

// Pre-save hook to generate slug if not provided
ResourceSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Indexes for filtering and searching
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ level: 1 });
ResourceSchema.index({ featured: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);

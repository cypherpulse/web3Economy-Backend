import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

// Author subdocument interface
export interface IBlogAuthor {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
}

// Blog stats subdocument interface
export interface IBlogStats {
  likes: number;
  comments: number;
  bookmarks: number;
  views: number;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: IBlogAuthor;
  publishedDate: Date;
  readTime: string;
  category: 'News' | 'Tutorial' | 'Guide' | 'Industry News';
  image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  stats: IBlogStats;
  color?: 'mint' | 'gold';
  createdAt: Date;
  updatedAt: Date;
}

const BlogAuthorSchema = new Schema<IBlogAuthor>(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  { _id: false }
);

const BlogStatsSchema = new Schema<IBlogStats>(
  {
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: BlogAuthorSchema,
      required: [true, 'Author is required'],
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    readTime: {
      type: String,
      required: [true, 'Read time is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['News', 'Tutorial', 'Guide', 'Industry News'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    stats: {
      type: BlogStatsSchema,
      default: () => ({
        likes: 0,
        comments: 0,
        bookmarks: 0,
        views: 0,
      }),
    },
    color: {
      type: String,
      enum: ['mint', 'gold'],
    },
  },
  {
    timestamps: true,
    collection: 'blogs',
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
BlogSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Calculate read time based on content if not provided
BlogSchema.pre('save', function (next) {
  if (!this.readTime && this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    this.readTime = `${minutes} min read`;
  }
  next();
});

// Indexes for filtering and searching
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ featured: 1 });
BlogSchema.index({ published: 1 });
BlogSchema.index({ publishedDate: -1 });
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);

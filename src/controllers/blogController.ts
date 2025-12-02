import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { AuthRequest } from '../middleware';
import { IApiResponse } from '../types';

interface IBlogQueryParams {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean | string;
  published?: boolean | string;
  page?: number;
  limit?: number;
}

// Get all blogs (public - only published)
export const getBlogs = async (
  req: Request<object, object, object, IBlogQueryParams>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { category, tag, search, featured, page = 1, limit = 10 } = req.query;

    const query: Record<string, unknown> = { published: true };

    if (category && category !== 'all') {
      // Handle category matching (case-insensitive)
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (featured !== undefined) {
      query.featured = featured === true || String(featured) === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-content'), // Exclude full content in list view
      Blog.countDocuments(query),
    ]);

    // Set pagination headers before sending response
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', limit.toString());

    res.json({
      success: true,
      data: {
        posts: blogs,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + blogs.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blogs.',
      },
    });
  }
};

// Get featured blog post (public)
export const getFeaturedBlog = async (
  _req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const featuredPost = await Blog.findOne({ featured: true, published: true })
      .sort({ publishedDate: -1 });

    if (!featuredPost) {
      // Return the most recent post if no featured post
      const latestPost = await Blog.findOne({ published: true })
        .sort({ publishedDate: -1 });

      if (!latestPost) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No blog posts found.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: latestPost,
      });
      return;
    }

    res.json({
      success: true,
      data: featuredPost,
    });
  } catch (error) {
    console.error('Error fetching featured blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch featured blog.',
      },
    });
  }
};

// Get single blog by slug (public)
export const getBlogBySlug = async (
  req: Request<{ slug: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, published: true });

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    // Increment view count
    blog.stats.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blog.',
      },
    });
  }
};

// Get single blog by ID (public)
export const getBlogById = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blog.',
      },
    });
  }
};

// Get related blogs (public)
export const getRelatedBlogs = async (
  req: Request<{ slug: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = Number(req.query.limit) || 3;

    // Find the current blog to get its category and tags
    const currentBlog = await Blog.findOne({ slug });

    if (!currentBlog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    // Find related posts by category or tags, excluding current post
    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlog._id },
      published: true,
      $or: [
        { category: currentBlog.category },
        { tags: { $in: currentBlog.tags } },
      ],
    })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .select('title category readTime slug image excerpt');

    res.json({
      success: true,
      data: relatedBlogs,
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch related blogs.',
      },
    });
  }
};

// Get blog categories with counts (public)
export const getBlogCategories = async (
  _req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const categories = await Blog.aggregate([
      { $match: { published: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalPosts = await Blog.countDocuments({ published: true });

    const formattedCategories = [
      { id: 'all', name: 'All Posts', count: totalPosts },
      ...categories.map((cat) => ({
        id: cat._id.toLowerCase().replace(/\s+/g, '-'),
        name: cat._id,
        count: cat.count,
      })),
    ];

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blog categories.',
      },
    });
  }
};

// Get trending topics (public)
export const getTrendingTopics = async (
  _req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    // Aggregate tags with their counts
    const trendingTopics = await Blog.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          posts: { $sum: 1 },
        },
      },
      { $sort: { posts: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: '$_id',
          posts: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: trendingTopics,
    });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch trending topics.',
      },
    });
  }
};

// Create blog (admin only)
export const createBlog = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const blogData = req.body;

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog post created successfully',
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create blog post.',
      },
    });
  }
};

// Update blog (admin only)
export const updateBlog = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If title is being updated, regenerate slug
    if (updateData.title) {
      const slugify = (await import('slugify')).default;
      updateData.slug = slugify(updateData.title, { lower: true, strict: true });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: blog,
      message: 'Blog post updated successfully',
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update blog post.',
      },
    });
  }
};

// Delete blog (admin only)
export const deleteBlog = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete blog post.',
      },
    });
  }
};

// Like blog post (public)
export const likeBlog = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { 'stats.likes': 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { likes: blog.stats.likes },
      message: 'Blog post liked',
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to like blog post.',
      },
    });
  }
};

// Bookmark blog post (public)
export const bookmarkBlog = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { 'stats.bookmarks': 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { bookmarks: blog.stats.bookmarks },
      message: 'Blog post bookmarked',
    });
  } catch (error) {
    console.error('Error bookmarking blog:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to bookmark blog post.',
      },
    });
  }
};

// Get all blogs (admin - including unpublished)
export const getAllBlogsAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { category, published, page = 1, limit = 20 } = req.query as IBlogQueryParams & { published?: string };

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (published !== undefined) {
      query.published = published === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(query),
    ]);

    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', String(page));
    res.setHeader('X-Limit', String(limit));

    res.json({
      success: true,
      data: {
        posts: blogs,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + blogs.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching blogs (admin):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blogs.',
      },
    });
  }
};

import { Request, Response } from 'express';
import { Showcase } from '../models/Showcase';
import { AuthRequest } from '../middleware';
import { IApiResponse } from '../types';

interface IShowcaseQueryParams {
  category?: string;
  tag?: string;
  search?: string;
  featured?: string;
  trending?: string;
  recentlyAdded?: string;
  filter?: 'featured' | 'trending' | 'new' | 'popular';
  page?: number;
  limit?: number;
}

// Get all published showcase projects (public)
export const getShowcaseProjects = async (
  req: Request<object, object, object, IShowcaseQueryParams>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { category, tag, search, filter, page = 1, limit = 12 } = req.query;

    const query: Record<string, unknown> = { published: true };

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Quick filters
    if (filter === 'featured') {
      query.featured = true;
    } else if (filter === 'trending') {
      query.trending = true;
    } else if (filter === 'new') {
      query.recentlyAdded = true;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Sort based on filter
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (filter === 'popular') {
      sortOption = { 'stats.stars': -1 };
    } else if (filter === 'trending') {
      sortOption = { 'stats.stars': -1, createdAt: -1 };
    }

    const [projects, total] = await Promise.all([
      Showcase.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Showcase.countDocuments(query),
    ]);

    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', String(page));
    res.setHeader('X-Limit', String(limit));

    res.json({
      success: true,
      data: {
        projects,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + projects.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching showcase projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch showcase projects.',
      },
    });
  }
};

// Get showcase categories with counts (public)
export const getShowcaseCategories = async (
  _req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const categories = await Showcase.aggregate([
      { $match: { published: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalProjects = await Showcase.countDocuments({ published: true });

    const formattedCategories = [
      { id: 'all', name: 'All Projects', count: totalProjects },
      ...categories.map((cat) => ({
        id: cat._id.toLowerCase(),
        name: cat._id,
        count: cat.count,
      })),
    ];

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching showcase categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch showcase categories.',
      },
    });
  }
};

// Get showcase stats (public)
export const getShowcaseStats = async (
  _req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const [totalProjects, totalBuilders, starsAggregate, tvlAggregate] = await Promise.all([
      Showcase.countDocuments({ published: true }),
      Showcase.distinct('creator', { published: true }),
      Showcase.aggregate([
        { $match: { published: true } },
        { $group: { _id: null, totalStars: { $sum: '$stats.stars' } } },
      ]),
      Showcase.aggregate([
        { $match: { published: true } },
        {
          $project: {
            tvlNumber: {
              $toDouble: {
                $replaceAll: {
                  input: { $replaceAll: { input: '$stats.tvl', find: '$', replacement: '' } },
                  find: 'M',
                  replacement: '',
                },
              },
            },
          },
        },
        { $group: { _id: null, totalTvl: { $sum: '$tvlNumber' } } },
      ]),
    ]);

    const totalStars = starsAggregate[0]?.totalStars || 0;
    const totalTvl = tvlAggregate[0]?.totalTvl || 0;

    // Format stats
    const formatNumber = (num: number): string => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
      return `${num}+`;
    };

    const stats = [
      { label: 'Total Projects', value: formatNumber(totalProjects), icon: 'Layers' },
      { label: 'Active Builders', value: formatNumber(totalBuilders.length), icon: 'Users' },
      { label: 'Combined TVL', value: `$${formatNumber(totalTvl * 1000000)}`, icon: 'TrendingUp' },
      { label: 'GitHub Stars', value: formatNumber(totalStars), icon: 'Star' },
    ];

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching showcase stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch showcase stats.',
      },
    });
  }
};

// Get featured projects (public)
export const getFeaturedProjects = async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 6;

    const projects = await Showcase.find({ featured: true, published: true })
      .sort({ 'stats.stars': -1 })
      .limit(limit);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch featured projects.',
      },
    });
  }
};

// Get trending projects (public)
export const getTrendingProjects = async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 6;

    const projects = await Showcase.find({ trending: true, published: true })
      .sort({ 'stats.stars': -1 })
      .limit(limit);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching trending projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch trending projects.',
      },
    });
  }
};

// Get project by slug (public)
export const getShowcaseBySlug = async (
  req: Request<{ slug: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { slug } = req.params;

    const project = await Showcase.findOne({ slug, published: true });

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch project.',
      },
    });
  }
};

// Get project by ID (public)
export const getShowcaseById = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Showcase.findById(id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch project.',
      },
    });
  }
};

// Star a project (increment stars count)
export const starProject = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Showcase.findByIdAndUpdate(
      id,
      { $inc: { 'stats.stars': 1 } },
      { new: true }
    );

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { stars: project.stats.stars },
      message: 'Project starred',
    });
  } catch (error) {
    console.error('Error starring project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to star project.',
      },
    });
  }
};

// Create showcase project (admin only)
export const createShowcaseProject = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const projectData = req.body;

    const project = new Showcase(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
      message: 'Showcase project created successfully',
    });
  } catch (error) {
    console.error('Error creating showcase project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create showcase project.',
      },
    });
  }
};

// Update showcase project (admin only)
export const updateShowcaseProject = async (
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

    const project = await Showcase.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Showcase project not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: project,
      message: 'Showcase project updated successfully',
    });
  } catch (error) {
    console.error('Error updating showcase project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update showcase project.',
      },
    });
  }
};

// Delete showcase project (admin only)
export const deleteShowcaseProject = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Showcase.findByIdAndDelete(id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Showcase project not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Showcase project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting showcase project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete showcase project.',
      },
    });
  }
};

// Get all projects (admin - including unpublished)
export const getAllShowcaseProjectsAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { category, published, page = 1, limit = 20 } = req.query as IShowcaseQueryParams & { published?: string };

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (published !== undefined) {
      query.published = published === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
      Showcase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Showcase.countDocuments(query),
    ]);

    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', String(page));
    res.setHeader('X-Limit', String(limit));

    res.json({
      success: true,
      data: {
        projects,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + projects.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching showcase projects (admin):', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch showcase projects.',
      },
    });
  }
};

import { Request, Response } from 'express';
import slugify from 'slugify';
import { Resource } from '../models';
import { AuthRequest } from '../middleware';
import { IApiResponse, IResourceQueryParams } from '../types';

// Get all resources with filtering (public)
export const getResources = async (
  req: Request<object, object, object, IResourceQueryParams>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { category, search, type, level, featured, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (level) {
      query.level = level;
    }

    if (featured !== undefined) {
      query.featured = featured === true || String(featured) === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(query),
    ]);

    const hasMore = skip + resources.length < total;

    res.json({
      success: true,
      data: {
        resources,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch resources.',
      },
    });
  }
};

// Get single resource by slug (public)
export const getResourceBySlug = async (
  req: Request<{ slug: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { slug } = req.params;

    const resource = await Resource.findOne({ slug });

    if (!resource) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch resource.',
      },
    });
  }
};

// Get single resource by ID (public)
export const getResourceById = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch resource.',
      },
    });
  }
};

// Create resource (admin only)
export const createResource = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const resourceData = req.body;

    // Generate slug if not provided
    if (!resourceData.slug) {
      resourceData.slug = slugify(resourceData.title, { lower: true, strict: true });
    }

    // Ensure unique slug
    let slugExists = await Resource.findOne({ slug: resourceData.slug });
    let counter = 1;
    const originalSlug = resourceData.slug;

    while (slugExists) {
      resourceData.slug = `${originalSlug}-${counter}`;
      slugExists = await Resource.findOne({ slug: resourceData.slug });
      counter++;
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      data: resource,
      message: 'Resource created successfully',
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create resource.',
      },
    });
  }
};

// Update resource (admin only)
export const updateResource = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!resource) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: resource,
      message: 'Resource updated successfully',
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update resource.',
      },
    });
  }
};

// Delete resource (admin only)
export const deleteResource = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete resource.',
      },
    });
  }
};

// Track resource download (public)
export const trackDownload = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!resource) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        downloads: resource.downloads,
      },
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRACK_ERROR',
        message: 'Failed to track download.',
      },
    });
  }
};

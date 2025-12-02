import { Request, Response } from 'express';
import { Creator } from '../models';
import { AuthRequest } from '../middleware';
import { IApiResponse, IPaginationQuery } from '../types';

// Get all creators (public)
export const getCreators = async (
  req: Request<object, object, object, IPaginationQuery>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [creators, total] = await Promise.all([
      Creator.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Creator.countDocuments(),
    ]);

    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', limit.toString());

    res.json({
      success: true,
      data: creators,
      message: `Found ${creators.length} creators`,
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch creators.',
      },
    });
  }
};

// Get single creator by ID (public)
export const getCreator = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const creator = await Creator.findById(id);

    if (!creator) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Creator not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: creator,
    });
  } catch (error) {
    console.error('Error fetching creator:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch creator.',
      },
    });
  }
};

// Create creator (admin only)
export const createCreator = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const creatorData = req.body;

    const creator = new Creator(creatorData);
    await creator.save();

    res.status(201).json({
      success: true,
      data: creator,
      message: 'Creator created successfully',
    });
  } catch (error) {
    console.error('Error creating creator:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create creator.',
      },
    });
  }
};

// Update creator (admin only)
export const updateCreator = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const creator = await Creator.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!creator) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Creator not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: creator,
      message: 'Creator updated successfully',
    });
  } catch (error) {
    console.error('Error updating creator:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update creator.',
      },
    });
  }
};

// Delete creator (admin only)
export const deleteCreator = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const creator = await Creator.findByIdAndDelete(id);

    if (!creator) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Creator not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Creator deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete creator.',
      },
    });
  }
};

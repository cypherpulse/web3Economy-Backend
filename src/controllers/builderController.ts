import { Request, Response } from 'express';
import { BuilderProject } from '../models';
import { AuthRequest } from '../middleware';
import { IApiResponse, IPaginationQuery } from '../types';

interface BuilderQueryParams extends IPaginationQuery {
  status?: string;
  tech?: string;
}

// Get all builder projects (public)
export const getProjects = async (
  req: Request<object, object, object, BuilderQueryParams>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { status, tech, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (tech) {
      query.tech = { $in: tech.split(',') };
    }

    const [projects, total] = await Promise.all([
      BuilderProject.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BuilderProject.countDocuments(query),
    ]);

    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', limit.toString());

    res.json({
      success: true,
      data: projects,
      message: `Found ${projects.length} projects`,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch builder projects.',
      },
    });
  }
};

// Get single project by ID (public)
export const getProject = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await BuilderProject.findById(id);

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
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch project.',
      },
    });
  }
};

// Create project (admin only)
export const createProject = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const projectData = req.body;

    const project = new BuilderProject(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create project.',
      },
    });
  }
};

// Update project (admin only)
export const updateProject = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await BuilderProject.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
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
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update project.',
      },
    });
  }
};

// Delete project (admin only)
export const deleteProject = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await BuilderProject.findByIdAndDelete(id);

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
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete project.',
      },
    });
  }
};

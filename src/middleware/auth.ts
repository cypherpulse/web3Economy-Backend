import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin } from '../models';
import { IApiResponse } from '../types';

export interface AuthRequest extends Request {
  admin?: IAdmin;
}

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required. Please provide a valid token.',
        },
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; email: string };

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin account not found or has been deleted.',
        },
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        },
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.',
        },
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'An error occurred during authentication.',
      },
    });
  }
};

// Optional authentication - doesn't fail if no token, but attaches admin if valid
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; email: string };
    const admin = await Admin.findById(decoded.id);

    if (admin) {
      req.admin = admin;
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
};

// Role-based access control
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response<IApiResponse>, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        },
      });
      return;
    }

    next();
  };
};

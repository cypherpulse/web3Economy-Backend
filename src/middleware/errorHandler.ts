import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { IApiResponse } from '../types';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, string>;
}

export const errorHandler = (
  error: MongoError,
  _req: Request,
  res: Response<IApiResponse>,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: `A record with this ${field} already exists.`,
        details: error.keyValue,
      },
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format.',
      },
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred. Please try again later.',
    },
  });
};

// Handle validation errors from express-validator
export const handleValidationErrors = (
  req: Request,
  res: Response<IApiResponse>,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err: ValidationError) => {
      if (err.type === 'field') {
        return `${err.path}: ${err.msg}`;
      }
      return err.msg;
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorMessages,
      },
    });
    return;
  }

  next();
};

// 404 handler
export const notFoundHandler = (_req: Request, res: Response<IApiResponse>): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint was not found.',
    },
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = <T>(
  fn: (req: Request, res: Response<IApiResponse<T>>, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response<IApiResponse<T>>, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

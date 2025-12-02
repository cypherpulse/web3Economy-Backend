import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { IApiResponse } from '../types';

// General rate limiter for most endpoints
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Strict rate limiter for sensitive operations (contact form, newsletter)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many submissions from this IP, please try again later.',
    },
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Auth rate limiter for login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skipSuccessfulRequests: true,
});

// Download rate limiter
export const downloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 downloads per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many download requests. Please slow down.',
    },
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

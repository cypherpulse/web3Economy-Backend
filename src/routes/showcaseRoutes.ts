import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getShowcaseProjects,
  getShowcaseCategories,
  getShowcaseStats,
  getFeaturedProjects,
  getTrendingProjects,
  getShowcaseBySlug,
  getShowcaseById,
  starProject,
  createShowcaseProject,
  updateShowcaseProject,
  deleteShowcaseProject,
  getAllShowcaseProjectsAdmin,
} from '../controllers/showcaseController';
import { authenticateAdmin, handleValidationErrors } from '../middleware';
import { generalLimiter, strictLimiter } from '../middleware/rateLimiter';

const router: IRouter = Router();

// Validation schemas
const showcaseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['DeFi', 'NFT', 'DAO', 'GameFi', 'Infrastructure', 'Social', 'Tools', 'Other'])
    .withMessage('Invalid category'),
  body('creator')
    .notEmpty()
    .withMessage('Creator name is required'),
  body('image')
    .notEmpty()
    .withMessage('Image is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
  body('stats.stars')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stars must be a non-negative integer'),
  body('stats.users')
    .optional()
    .isString(),
  body('stats.tvl')
    .optional()
    .isString(),
  body('links.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('links.github')
    .optional()
    .isURL()
    .withMessage('GitHub must be a valid URL'),
  body('links.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter must be a valid URL'),
  body('links.discord')
    .optional()
    .isURL()
    .withMessage('Discord must be a valid URL'),
  body('links.documentation')
    .optional()
    .isURL()
    .withMessage('Documentation must be a valid URL'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('trending')
    .optional()
    .isBoolean()
    .withMessage('Trending must be a boolean'),
  body('recentlyAdded')
    .optional()
    .isBoolean()
    .withMessage('recentlyAdded must be a boolean'),
  body('color')
    .optional()
    .isIn(['mint', 'gold'])
    .withMessage('Color must be either mint or gold'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
];

const updateShowcaseValidation = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn(['DeFi', 'NFT', 'DAO', 'GameFi', 'Infrastructure', 'Social', 'Tools', 'Other'])
    .withMessage('Invalid category'),
  body('creator')
    .optional()
    .isString(),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('stats.stars')
    .optional()
    .isInt({ min: 0 }),
  body('stats.users')
    .optional()
    .isString(),
  body('stats.tvl')
    .optional()
    .isString(),
  body('links.website')
    .optional()
    .isURL(),
  body('links.github')
    .optional()
    .isURL(),
  body('links.twitter')
    .optional()
    .isURL(),
  body('links.discord')
    .optional()
    .isURL(),
  body('links.documentation')
    .optional()
    .isURL(),
  body('featured')
    .optional()
    .isBoolean(),
  body('trending')
    .optional()
    .isBoolean(),
  body('recentlyAdded')
    .optional()
    .isBoolean(),
  body('color')
    .optional()
    .isIn(['mint', 'gold']),
  body('published')
    .optional()
    .isBoolean(),
];

const queryValidation = [
  query('category')
    .optional()
    .isString(),
  query('tag')
    .optional()
    .isString(),
  query('search')
    .optional()
    .isString(),
  query('filter')
    .optional()
    .isIn(['featured', 'trending', 'new', 'popular'])
    .withMessage('Invalid filter value'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID'),
];

const slugParamValidation = [
  param('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isString(),
];

// ==================== PUBLIC ROUTES ====================

// GET /api/showcase - Get all published projects
router.get(
  '/',
  generalLimiter,
  queryValidation,
  handleValidationErrors,
  getShowcaseProjects
);

// GET /api/showcase/categories - Get categories with counts
router.get(
  '/categories',
  generalLimiter,
  getShowcaseCategories
);

// GET /api/showcase/stats - Get showcase statistics
router.get(
  '/stats',
  generalLimiter,
  getShowcaseStats
);

// GET /api/showcase/featured - Get featured projects
router.get(
  '/featured',
  generalLimiter,
  getFeaturedProjects
);

// GET /api/showcase/trending - Get trending projects
router.get(
  '/trending',
  generalLimiter,
  getTrendingProjects
);

// GET /api/showcase/slug/:slug - Get project by slug
router.get(
  '/slug/:slug',
  generalLimiter,
  slugParamValidation,
  handleValidationErrors,
  getShowcaseBySlug
);

// GET /api/showcase/:id - Get project by ID
router.get(
  '/:id',
  generalLimiter,
  idParamValidation,
  handleValidationErrors,
  getShowcaseById
);

// POST /api/showcase/:id/star - Star a project
router.post(
  '/:id/star',
  strictLimiter,
  idParamValidation,
  handleValidationErrors,
  starProject
);

// ==================== ADMIN ROUTES ====================

// GET /api/showcase/admin/all - Get all projects (admin, including unpublished)
router.get(
  '/admin/all',
  authenticateAdmin,
  queryValidation,
  handleValidationErrors,
  getAllShowcaseProjectsAdmin
);

// POST /api/showcase - Create new project (admin)
router.post(
  '/',
  authenticateAdmin,
  showcaseValidation,
  handleValidationErrors,
  createShowcaseProject
);

// PUT /api/showcase/:id - Update project (admin)
router.put(
  '/:id',
  authenticateAdmin,
  idParamValidation,
  updateShowcaseValidation,
  handleValidationErrors,
  updateShowcaseProject
);

// DELETE /api/showcase/:id - Delete project (admin)
router.delete(
  '/:id',
  authenticateAdmin,
  idParamValidation,
  handleValidationErrors,
  deleteShowcaseProject
);

export default router;

import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getBlogs,
  getFeaturedBlog,
  getBlogBySlug,
  getBlogById,
  getRelatedBlogs,
  getBlogCategories,
  getTrendingTopics,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  bookmarkBlog,
  getAllBlogsAdmin,
} from '../controllers/blogController';
import { authenticateAdmin, handleValidationErrors } from '../middleware';
import { generalLimiter, strictLimiter } from '../middleware/rateLimiter';

const router: IRouter = Router();

// Validation schemas
const blogValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('excerpt')
    .notEmpty()
    .withMessage('Excerpt is required')
    .isLength({ max: 500 })
    .withMessage('Excerpt must be less than 500 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('author.name')
    .notEmpty()
    .withMessage('Author name is required'),
  body('author.role')
    .optional()
    .isString(),
  body('author.bio')
    .optional()
    .isString(),
  body('author.avatar')
    .optional()
    .isURL()
    .withMessage('Author avatar must be a valid URL'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['News', 'Tutorial', 'Guide', 'Industry News', 'Analysis', 'Updates'])
    .withMessage('Invalid category'),
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
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('color')
    .optional()
    .matches(/^(from-|bg-)/)
    .withMessage('Color must be a valid Tailwind gradient or background class'),
];

const updateBlogValidation = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must be less than 500 characters'),
  body('content')
    .optional()
    .isString(),
  body('author.name')
    .optional()
    .isString(),
  body('author.role')
    .optional()
    .isString(),
  body('author.bio')
    .optional()
    .isString(),
  body('author.avatar')
    .optional()
    .isURL()
    .withMessage('Author avatar must be a valid URL'),
  body('category')
    .optional()
    .isIn(['News', 'Tutorial', 'Guide', 'Industry News', 'Analysis', 'Updates'])
    .withMessage('Invalid category'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  body('color')
    .optional()
    .isString(),
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
  query('featured')
    .optional()
    .isString(),
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
    .withMessage('Invalid blog ID'),
];

const slugParamValidation = [
  param('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isString(),
];

// ==================== PUBLIC ROUTES ====================

// GET /api/blogs - Get all published blogs
router.get(
  '/',
  generalLimiter,
  queryValidation,
  handleValidationErrors,
  getBlogs
);

// GET /api/blogs/featured - Get featured blog
router.get(
  '/featured',
  generalLimiter,
  getFeaturedBlog
);

// GET /api/blogs/categories - Get blog categories with counts
router.get(
  '/categories',
  generalLimiter,
  getBlogCategories
);

// GET /api/blogs/trending - Get trending topics
router.get(
  '/trending',
  generalLimiter,
  getTrendingTopics
);

// GET /api/blogs/slug/:slug - Get blog by slug
router.get(
  '/slug/:slug',
  generalLimiter,
  slugParamValidation,
  handleValidationErrors,
  getBlogBySlug
);

// GET /api/blogs/slug/:slug/related - Get related blogs
router.get(
  '/slug/:slug/related',
  generalLimiter,
  slugParamValidation,
  handleValidationErrors,
  getRelatedBlogs
);

// GET /api/blogs/:id - Get blog by ID
router.get(
  '/:id',
  generalLimiter,
  idParamValidation,
  handleValidationErrors,
  getBlogById
);

// POST /api/blogs/:id/like - Like a blog post
router.post(
  '/:id/like',
  strictLimiter,
  idParamValidation,
  handleValidationErrors,
  likeBlog
);

// POST /api/blogs/:id/bookmark - Bookmark a blog post
router.post(
  '/:id/bookmark',
  strictLimiter,
  idParamValidation,
  handleValidationErrors,
  bookmarkBlog
);

// ==================== ADMIN ROUTES ====================

// GET /api/blogs/admin/all - Get all blogs (admin, including unpublished)
router.get(
  '/admin/all',
  authenticateAdmin,
  queryValidation,
  handleValidationErrors,
  getAllBlogsAdmin
);

// POST /api/blogs - Create new blog (admin)
router.post(
  '/',
  authenticateAdmin,
  blogValidation,
  handleValidationErrors,
  createBlog
);

// PUT /api/blogs/:id - Update blog (admin)
router.put(
  '/:id',
  authenticateAdmin,
  idParamValidation,
  updateBlogValidation,
  handleValidationErrors,
  updateBlog
);

// DELETE /api/blogs/:id - Delete blog (admin)
router.delete(
  '/:id',
  authenticateAdmin,
  idParamValidation,
  handleValidationErrors,
  deleteBlog
);

export default router;

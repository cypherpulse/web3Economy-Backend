import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getResources,
  getResourceBySlug,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  trackDownload,
} from '../controllers/resourceController';
import { authenticateAdmin, handleValidationErrors, downloadLimiter } from '../middleware';

const router: IRouter = Router();

// Validation rules for resource
const resourceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('type')
    .isIn(['Tutorial', 'Documentation', 'Tool', 'Video'])
    .withMessage('Type must be Tutorial, Documentation, Tool, or Video'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
    .withMessage('Invalid level'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required'),
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('students')
    .isInt({ min: 0 })
    .withMessage('Students must be a non-negative number'),
  body('image')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('resourceUrl')
    .isURL()
    .withMessage('Resource URL must be a valid URL'),
  body('provider')
    .trim()
    .notEmpty()
    .withMessage('Provider is required'),
  body('tags')
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .isString()
    .withMessage('Each tag must be a string'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

// GET /api/resources - Get all resources with filtering (public)
router.get(
  '/',
  [
    query('category')
      .optional()
      .isString(),
    query('type')
      .optional()
      .isIn(['Tutorial', 'Documentation', 'Tool', 'Video'])
      .withMessage('Invalid type'),
    query('level')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
      .withMessage('Invalid level'),
    query('search')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search query too long'),
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be a boolean'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  getResources
);

// GET /api/resources/id/:id - Get resource by ID (public)
router.get(
  '/id/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid resource ID'),
  ],
  handleValidationErrors,
  getResourceById
);

// GET /api/resources/:slug - Get resource by slug (public)
router.get(
  '/:slug',
  [
    param('slug')
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Invalid slug'),
  ],
  handleValidationErrors,
  getResourceBySlug
);

// POST /api/resources - Create resource (admin only)
router.post(
  '/',
  authenticateAdmin,
  resourceValidation,
  handleValidationErrors,
  createResource
);

// PUT /api/resources/:id - Update resource (admin only)
router.put(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid resource ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('type')
      .optional()
      .isIn(['Tutorial', 'Documentation', 'Tool', 'Video'])
      .withMessage('Invalid type'),
    body('level')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
      .withMessage('Invalid level'),
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5'),
    body('image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('resourceUrl')
      .optional()
      .isURL()
      .withMessage('Resource URL must be a valid URL'),
    body('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be a boolean'),
  ],
  handleValidationErrors,
  updateResource
);

// DELETE /api/resources/:id - Delete resource (admin only)
router.delete(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid resource ID'),
  ],
  handleValidationErrors,
  deleteResource
);

// POST /api/resources/:id/download - Track download (public)
router.post(
  '/:id/download',
  downloadLimiter,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid resource ID'),
  ],
  handleValidationErrors,
  trackDownload
);

export default router;

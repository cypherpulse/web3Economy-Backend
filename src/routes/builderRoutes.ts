import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/builderController';
import { authenticateAdmin, handleValidationErrors } from '../middleware';

const router: IRouter = Router();

// Validation rules for builder project
const projectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('creator')
    .trim()
    .notEmpty()
    .withMessage('Creator is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('tech')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('tech.*')
    .isString()
    .withMessage('Each tech item must be a string'),
  body('status')
    .isIn(['Live', 'Beta', 'Development', 'Alpha', 'Deprecated'])
    .withMessage('Invalid status'),
  body('users')
    .trim()
    .notEmpty()
    .withMessage('Users count is required'),
  body('tvl')
    .trim()
    .notEmpty()
    .withMessage('TVL is required'),
  body('image')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('githubUrl')
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('socialMedia')
    .isArray()
    .withMessage('Social media must be an array'),
  body('socialMedia.*.platform')
    .trim()
    .notEmpty()
    .withMessage('Social media platform is required'),
  body('socialMedia.*.url')
    .isURL()
    .withMessage('Social media URL must be valid'),
  body('websiteUrl')
    .optional()
    .isURL()
    .withMessage('Website URL must be a valid URL'),
];

// GET /api/builders/projects - Get all projects (public)
router.get(
  '/projects',
  [
    query('status')
      .optional()
      .isIn(['Live', 'Beta', 'Development', 'Alpha', 'Deprecated'])
      .withMessage('Invalid status'),
    query('tech')
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
  ],
  handleValidationErrors,
  getProjects
);

// GET /api/builders/projects/:id - Get single project (public)
router.get(
  '/projects/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID'),
  ],
  handleValidationErrors,
  getProject
);

// POST /api/builders/projects - Create project (admin only)
router.post(
  '/projects',
  authenticateAdmin,
  projectValidation,
  handleValidationErrors,
  createProject
);

// PUT /api/builders/projects/:id - Update project (admin only)
router.put(
  '/projects/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('status')
      .optional()
      .isIn(['Live', 'Beta', 'Development', 'Alpha', 'Deprecated'])
      .withMessage('Invalid status'),
    body('tech')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one technology is required'),
    body('image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('githubUrl')
      .optional()
      .isURL()
      .withMessage('GitHub URL must be a valid URL'),
    body('websiteUrl')
      .optional()
      .isURL()
      .withMessage('Website URL must be a valid URL'),
  ],
  handleValidationErrors,
  updateProject
);

// DELETE /api/builders/projects/:id - Delete project (admin only)
router.delete(
  '/projects/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid project ID'),
  ],
  handleValidationErrors,
  deleteProject
);

export default router;

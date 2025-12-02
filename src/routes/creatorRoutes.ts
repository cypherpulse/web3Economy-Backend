import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getCreators,
  getCreator,
  createCreator,
  updateCreator,
  deleteCreator,
} from '../controllers/creatorController';
import { authenticateAdmin, handleValidationErrors } from '../middleware';

const router: IRouter = Router();

// Validation rules for creator
const creatorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required')
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  body('profileImage')
    .isURL()
    .withMessage('Profile image must be a valid URL'),
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
  body('creatorCoin')
    .isObject()
    .withMessage('Creator coin data must be an object'),
  body('creatorCoin.symbol')
    .trim()
    .notEmpty()
    .withMessage('Creator coin symbol is required'),
  body('creatorCoin.marketCap')
    .isNumeric()
    .withMessage('Market cap must be a number'),
  body('creatorCoin.price')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('creatorCoin.change24h')
    .isNumeric()
    .withMessage('24h change must be a number'),
  body('followers')
    .trim()
    .notEmpty()
    .withMessage('Followers count is required'),
];

// GET /api/creators - Get all creators (public)
router.get(
  '/',
  [
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
  getCreators
);

// GET /api/creators/:id - Get single creator (public)
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid creator ID'),
  ],
  handleValidationErrors,
  getCreator
);

// POST /api/creators - Create creator (admin only)
router.post(
  '/',
  authenticateAdmin,
  creatorValidation,
  handleValidationErrors,
  createCreator
);

// PUT /api/creators/:id - Update creator (admin only)
router.put(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid creator ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('bio')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Bio cannot be empty')
      .isLength({ max: 2000 })
      .withMessage('Bio cannot exceed 2000 characters'),
    body('profileImage')
      .optional()
      .isURL()
      .withMessage('Profile image must be a valid URL'),
    body('socialMedia')
      .optional()
      .isArray()
      .withMessage('Social media must be an array'),
  ],
  handleValidationErrors,
  updateCreator
);

// DELETE /api/creators/:id - Delete creator (admin only)
router.delete(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid creator ID'),
  ],
  handleValidationErrors,
  deleteCreator
);

export default router;

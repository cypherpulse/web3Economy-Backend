import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  submitContactForm,
  getContactSubmissions,
  getContactSubmission,
  deleteContactSubmission,
} from '../controllers/contactController';
import { authenticateAdmin, handleValidationErrors, strictLimiter } from '../middleware';

const router: IRouter = Router();

// POST /api/contact - Submit contact form (public)
router.post(
  '/',
  strictLimiter,
  [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('company')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Company name cannot exceed 200 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Message must be between 10 and 5000 characters'),
    body('subscribeNewsletter')
      .optional()
      .isBoolean()
      .withMessage('Subscribe newsletter must be a boolean'),
  ],
  handleValidationErrors,
  submitContactForm
);

// GET /api/contact - Get all contact submissions (admin only)
router.get(
  '/',
  authenticateAdmin,
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
  getContactSubmissions
);

// GET /api/contact/:id - Get single contact submission (admin only)
router.get(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid contact submission ID'),
  ],
  handleValidationErrors,
  getContactSubmission
);

// DELETE /api/contact/:id - Delete contact submission (admin only)
router.delete(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid contact submission ID'),
  ],
  handleValidationErrors,
  deleteContactSubmission
);

export default router;

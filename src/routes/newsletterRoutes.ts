import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
} from '../controllers/newsletterController';
import { authenticateAdmin, handleValidationErrors, strictLimiter } from '../middleware';

const router: IRouter = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter (public)
router.post(
  '/subscribe',
  strictLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('source')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Source cannot exceed 50 characters'),
  ],
  handleValidationErrors,
  subscribe
);

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter (public)
router.post(
  '/unsubscribe',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
  ],
  handleValidationErrors,
  unsubscribe
);

// GET /api/newsletter/subscribers - Get all subscribers (admin only)
router.get(
  '/subscribers',
  authenticateAdmin,
  [
    query('status')
      .optional()
      .isIn(['active', 'unsubscribed'])
      .withMessage('Status must be active or unsubscribed'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Limit must be between 1 and 500'),
  ],
  handleValidationErrors,
  getSubscribers
);

// DELETE /api/newsletter/subscribers/:id - Delete subscriber (admin only)
router.delete(
  '/subscribers/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid subscriber ID'),
  ],
  handleValidationErrors,
  deleteSubscriber
);

export default router;

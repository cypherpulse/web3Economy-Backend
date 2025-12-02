import { Router, IRouter } from 'express';
import { body, param, query } from 'express-validator';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticateAdmin, handleValidationErrors } from '../middleware';

const router: IRouter = Router();

// Validation rules for event
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('date')
    .notEmpty()
    .withMessage('Date is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('attendees')
    .isInt({ min: 0 })
    .withMessage('Attendees must be a non-negative number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('type')
    .isIn(['Conference', 'Workshop', 'Hackathon', 'Meetup', 'Webinar', 'Summit', 'Other'])
    .withMessage('Invalid event type'),
  body('price')
    .notEmpty()
    .withMessage('Price is required'),
  body('status')
    .isIn(['upcoming', 'past', 'live'])
    .withMessage('Status must be upcoming, past, or live'),
  body('bannerImage')
    .isURL()
    .withMessage('Banner image must be a valid URL'),
  body('registrationUrl')
    .optional()
    .isURL()
    .withMessage('Registration URL must be a valid URL'),
];

// GET /api/events - Get all events (public)
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['upcoming', 'past', 'live'])
      .withMessage('Invalid status'),
    query('type')
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
  getEvents
);

// GET /api/events/:id - Get single event (public)
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid event ID'),
  ],
  handleValidationErrors,
  getEvent
);

// POST /api/events - Create event (admin only)
router.post(
  '/',
  authenticateAdmin,
  eventValidation,
  handleValidationErrors,
  createEvent
);

// PUT /api/events/:id - Update event (admin only)
router.put(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid event ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('status')
      .optional()
      .isIn(['upcoming', 'past', 'live'])
      .withMessage('Status must be upcoming, past, or live'),
    body('type')
      .optional()
      .isIn(['Conference', 'Workshop', 'Hackathon', 'Meetup', 'Webinar', 'Summit', 'Other'])
      .withMessage('Invalid event type'),
    body('bannerImage')
      .optional()
      .isURL()
      .withMessage('Banner image must be a valid URL'),
    body('registrationUrl')
      .optional()
      .isURL()
      .withMessage('Registration URL must be a valid URL'),
  ],
  handleValidationErrors,
  updateEvent
);

// DELETE /api/events/:id - Delete event (admin only)
router.delete(
  '/:id',
  authenticateAdmin,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid event ID'),
  ],
  handleValidationErrors,
  deleteEvent
);

export default router;

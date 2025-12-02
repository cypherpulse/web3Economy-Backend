import { Router, IRouter } from 'express';
import { body } from 'express-validator';
import {
  loginAdmin,
  registerAdmin,
  getCurrentAdmin,
  changePassword,
} from '../controllers/adminController';
import { authenticateAdmin, handleValidationErrors, authLimiter } from '../middleware';

const router: IRouter = Router();

// POST /api/admin/login - Admin login
router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  handleValidationErrors,
  loginAdmin
);

// POST /api/admin/register - Register new admin (requires auth)
router.post(
  '/register',
  authenticateAdmin,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'superadmin'])
      .withMessage('Role must be either admin or superadmin'),
  ],
  handleValidationErrors,
  registerAdmin
);

// GET /api/admin/me - Get current admin profile
router.get('/me', authenticateAdmin, getCurrentAdmin);

// PUT /api/admin/password - Change password
router.put(
  '/password',
  authenticateAdmin,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  handleValidationErrors,
  changePassword
);

export default router;

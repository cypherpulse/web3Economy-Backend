import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';
import { AuthRequest } from '../middleware';
import { IApiResponse } from '../types';

// Admin Login
export const loginAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required.',
        },
      });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate JWT token (7 days in seconds = 604800)
    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: 604800 } // 7 days
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'An error occurred during login.',
      },
    });
  }
};

// Register new admin (requires existing admin auth)
export const registerAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, password, and name are required.',
        },
      });
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ADMIN_EXISTS',
          message: 'An admin with this email already exists.',
        },
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = new Admin({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role || 'admin',
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTER_ERROR',
        message: 'An error occurred during registration.',
      },
    });
  }
};

// Get current admin profile
export const getCurrentAdmin = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: req.admin._id.toString(),
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        createdAt: req.admin.createdAt,
        lastLoginAt: req.admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'An error occurred while fetching admin profile.',
      },
    });
  }
};

// Change password
export const changePassword = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required.',
        },
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, req.admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect.',
        },
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    req.admin.passwordHash = passwordHash;
    await req.admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'An error occurred while changing password.',
      },
    });
  }
};

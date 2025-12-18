const express = require('express');
const router = express.Router();
const Joi = require('joi');
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(50).allow('', null),
  first_name: Joi.string().max(100).allow('', null),
  last_name: Joi.string().max(100).allow('', null),
  bio: Joi.string().max(500).allow('', null),
  avatar_url: Joi.string().uri().allow('', null)
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin', 'moderator').required()
});

const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'New email is required'
  }),
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required for security verification'
  })
});

// User routes
router.get(
  '/profile',
  authMiddleware.authenticate,
  userController.getProfile
);

router.put(
  '/profile',
  authMiddleware.authenticate,
  validationMiddleware.validate(updateProfileSchema),
  userController.updateProfile
);

// Email management routes
router.put(
  '/change-email',
  authMiddleware.authenticate,
  validationMiddleware.validate(changeEmailSchema),
  userController.changeEmail
);

router.get(
  '/verify-email/:token',
  userController.verifyEmail
);

router.get(
  '/last-password-change',
  authMiddleware.authenticate,
  userController.getLastPasswordChange
);

// Admin routes
router.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('admin'),
  userController.getAllUsers
);

router.get(
  '/:userId',
  authMiddleware.authenticate,
  authMiddleware.authorize('admin'),
  userController.getUserById
);

router.put(
  '/:userId/role',
  authMiddleware.authenticate,
  authMiddleware.authorize('admin'),
  validationMiddleware.validate(updateRoleSchema),
  userController.updateUserRole
);

module.exports = router;
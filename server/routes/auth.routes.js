const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().max(100),
  last_name: Joi.string().max(100)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

router.post(
  '/register',
  validationMiddleware.validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  validationMiddleware.validate(loginSchema),
  authController.login
);

router.get(
  '/me',
  authMiddleware.authenticate,
  authController.getMe
);

router.post(
  '/change-password',
  authMiddleware.authenticate,
  validationMiddleware.validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
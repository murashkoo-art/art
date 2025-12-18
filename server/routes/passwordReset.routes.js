const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/PasswordResetController');
const validationMiddleware = require('../middleware/validation');

router.post(
  '/request',
  validationMiddleware.validate(passwordResetController.requestResetSchema),
  passwordResetController.requestReset
);

router.post(
  '/reset',
  validationMiddleware.validate(passwordResetController.resetPasswordSchema),
  passwordResetController.resetPassword
);

router.get(
  '/validate/:token',
  passwordResetController.validateToken
);

module.exports = router;
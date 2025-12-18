const Joi = require('joi');
const PasswordResetService = require('../services/PasswordResetService');

class PasswordResetController {
  async requestReset(req, res) {
    try {
      const { email } = req.validatedData;
      const result = await PasswordResetService.requestPasswordReset(email);
      // Предполагается, что сервис возвращает объект с полем success/error
      if (result.success) {
        return res.json(result);
      }
      throw new Error(result.error || 'Request failed');
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to send reset email'
      });
    }
  }
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.validatedData;
      const result = await PasswordResetService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async validateToken(req, res) {
    try {
      const { token } = req.params;
      const result = await PasswordResetService.validateResetToken(token);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        valid: false,
        error: error.message
      });
    }
  }
}

//схемы валидации
PasswordResetController.requestResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  })
});

PasswordResetController.resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password'
  })
}).with('newPassword', 'confirmPassword');

module.exports = new PasswordResetController();
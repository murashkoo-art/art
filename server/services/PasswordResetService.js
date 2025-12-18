const userModel = require('../models/User');
const NotificationService = require('./NotificationService');

class PasswordResetService {
  async requestPasswordReset(email) {
    try {
      const { user, resetToken } = await userModel.setPasswordResetToken(email);
      
      // В реальном приложении здесь бы отправлялось письмо
      // Для демо выводим ссылку в консоль
      console.log(`Password reset link for ${email}:`);
      console.log(`http://localhost:3000/reset-password?token=${resetToken}`);
      
      // Создаем уведомление
      await NotificationService.createPasswordResetRequestNotification(user.id);
      
      return {
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions',
        // В продакшн не отправляем токен, только для демо
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      };
    } catch (error) {
      // Для безопасности всегда возвращаем одинаковый ответ
      return {
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions'
      };
    }
  }

  async resetPassword(token, newPassword) {
    // Валидация пароля
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Проверяем токен
    const user = await userModel.verifyPasswordResetToken(token);
    
    // Обновляем пароль
    await userModel.updatePassword(user.id, newPassword);
    
    // Создаем уведомление
    await NotificationService.createPasswordResetSuccessNotification(user.id);
    
    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  }

  async validateResetToken(token) {
    try {
      const user = await userModel.verifyPasswordResetToken(token);
      return {
        valid: true,
        email: user.email
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new PasswordResetService();
const notificationModel = require('../models/Notification');

class NotificationService {
  async getUserNotifications(userId, options = {}) {
    return await notificationModel.findByUserId(userId, options);
  }

  async createNotification(userId, notificationData) {
    return await notificationModel.createForUser(userId, notificationData);
  }

  async createWelcomeNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Добро пожаловать!',
      message: 'Добро пожаловать в Живопись! Мы рады видеть вас здесь.',
      type: 'success'
    });
  }

  async createPasswordChangeNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Пароль изменен',
      message: 'Ваш пароль успешно изменен.',
      type: 'info'
    });
  }

  async createProfileUpdateNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Профиль обновлен',
      message: 'Ваш профиль успешно обновлен.',
      type: 'info'
    });
  }

  async createPasswordResetRequestNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Запрос на сброс пароля',
      message: 'Для вашей учетной записи запрошен сброс пароля.',
      type: 'warning'
    });
  }

  async createPasswordResetSuccessNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Выполнен сброс пароля',
      message: 'Ваш пароль успешно сброшен.',
      type: 'success'
    });
  }

  async createEmailChangeNotification(userId, newEmail, verificationToken) {
    return await this.createNotification(userId, {
      title: 'Изменен адрес электронной почты',
      message: `${newEmail}. Пожалуйста, подтвердите свой новый адрес электронной почты.`,
      type: 'warning',
      metadata: {
        newEmail,
        verificationToken
      }
    });
  }

  async createEmailVerifiedNotification(userId) {
    return await this.createNotification(userId, {
      title: 'Адрес электронной почты подтвержден',
      message: 'Ваш адрес электронной почты успешно подтвержден.',
      type: 'success'
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationModel.findById(notificationId);
    
    if (!notification || notification.user_id !== userId) {
      throw new Error('Уведомление не найдено или доступ запрещен');
    }

    return await notificationModel.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    // Используем исправленный метод из модели
    const count = await notificationModel.markAllAsRead(userId);
    return { count, message: `${count} Уведомления, помеченные как прочитанные` };
  }

  async getUnreadCount(userId) {
    return await notificationModel.getUnreadCount(userId);
  }

  async deleteNotification(notificationId, userId) {
    const notification = await notificationModel.findById(notificationId);
    
    if (!notification || notification.user_id !== userId) {
      throw new Error('Уведомление не найдено или доступ запрещен');
    }

    return await notificationModel.deleteNotification(notificationId);
  }

  // Дополнительные методы
  async getRecentNotifications(userId, limit = 10) {
    return await notificationModel.getRecentNotifications(userId, limit);
  }

  async getNotificationStats(userId) {
    return await notificationModel.getNotificationStats(userId);
  }

  async cleanupOldNotifications(days = 30) {
    return await notificationModel.deleteOldNotifications(days);
  }
}

module.exports = new NotificationService();
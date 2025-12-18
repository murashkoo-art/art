const BaseModel = require('./BaseModel');

class Notification extends BaseModel {
  constructor() {
    super('notifications');
  }

  async findByUserId(userId, options = {}) {
    return await this.findAll({ user_id: userId }, options);
  }

  async createForUser(userId, notificationData) {
    const data = {
      user_id: userId,
      ...notificationData
    };
    return await super.create(data);
  }

  async markAsRead(notificationId) {
    return await this.update(notificationId, { is_read: true });
  }

  async markAllAsRead(userId) {
    // Используем this.query из BaseModel
    const result = await this.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return result.rowCount;
  }

  async getUnreadCount(userId) {
    const { rows } = await this.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  }

  async deleteNotification(notificationId) {
    return await super.delete(notificationId);
  }

  async getRecentNotifications(userId, limit = 10) {
    const { rows } = await this.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  async getNotificationsByType(userId, type, options = {}) {
    return await this.findAll({ user_id: userId, type }, options);
  }

  async getUnreadNotifications(userId, options = {}) {
    return await this.findAll({ user_id: userId, is_read: false }, options);
  }

  async getReadNotifications(userId, options = {}) {
    return await this.findAll({ user_id: userId, is_read: true }, options);
  }

  async deleteOldNotifications(days = 30) {
    const { rows } = await this.query(
      `DELETE FROM notifications 
       WHERE created_at < NOW() - INTERVAL '${days} days' 
       AND is_read = true 
       RETURNING id`,
      []
    );
    return rows.length;
  }

  async getNotificationStats(userId) {
    const { rows } = await this.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success
       FROM notifications 
       WHERE user_id = $1`,
      [userId]
    );
    return rows[0];
  }
}

module.exports = new Notification();
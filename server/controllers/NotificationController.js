const NotificationService = require('../services/NotificationService');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const notifications = await NotificationService.getUserNotifications(
        req.user.id,
        req.query
      );
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await NotificationService.markAsRead(
        notificationId,
        req.user.id
      );
      res.json(notification);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      await NotificationService.deleteNotification(notificationId, req.user.id);
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();
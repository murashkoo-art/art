const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middleware/auth');

router.get(
  '/',
  authMiddleware.authenticate,
  notificationController.getNotifications
);

router.get(
  '/unread-count',
  authMiddleware.authenticate,
  notificationController.getUnreadCount
);

router.put(
  '/:notificationId/read',
  authMiddleware.authenticate,
  notificationController.markAsRead
);

router.put(
  '/mark-all-read',
  authMiddleware.authenticate,
  notificationController.markAllAsRead
);

router.delete(
  '/:notificationId',
  authMiddleware.authenticate,
  notificationController.deleteNotification
);

module.exports = router;
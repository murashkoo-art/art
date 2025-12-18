const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/auth');

// Применяем middleware аутентификации ко всем маршрутам
router.use(authMiddleware.authenticate); 

// Статистика для текущего пользователя
router.get('/me', statsController.getUserStats);

// Админская статистика (только для админов)
router.get('/admin', statsController.getAdminStats);

// Здоровье системы (только для админов)
router.get('/health', statsController.getSystemHealth);

// Общая статистика (автоматически определяет тип пользователя)
router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;
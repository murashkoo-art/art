const StatsService = require('../services/StatsService');
const authMiddleware = require('../middleware/auth');

class StatsController {
  async getUserStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await StatsService.getUserStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminStats(req, res, next) {
    try {
      // Проверяем права администратора
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin rights required.'
        });
      }

      const stats = await StatsService.getAdminStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemHealth(req, res, next) {
    try {
      // Проверяем права администратора
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin rights required.'
        });
      }

      const health = await StatsService.getSystemHealth();
      
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      let stats;
      
      if (userRole === 'admin') {
        stats = await StatsService.getAdminStats();
      } else {
        stats = await StatsService.getUserStats(userId);
      }
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StatsController();
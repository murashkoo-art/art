const userModel = require('../models/User');
const notificationModel = require('../models/Notification');

class StatsService {
  async getUserStats(userId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Получаем статистику уведомлений
      const unreadCount = await notificationModel.getUnreadCount(userId);
      const totalNotifications = await notificationModel.count({ user_id: userId });

      // Получаем статистику по типам уведомлений
      const notificationTypesResult = await notificationModel.query(
        `SELECT type, COUNT(*) as count FROM notifications WHERE user_id = $1 GROUP BY type`,
        [userId]
      );

      const types = {};
      notificationTypesResult.rows.forEach(row => {
        types[row.type] = parseInt(row.count, 10);
      });

      // Получаем последние уведомления
      const recentNotifications = await notificationModel.getRecentNotifications(userId, 5);

      return {
        user: {
          member_since: user.created_at,
          last_login: user.last_login,
          profile_updates: user.profile_updates || 0,
          last_activity: user.last_login || user.created_at,
          email_verified: user.email_verified,
          is_active: user.is_active,
          last_password_change: user.last_password_change
        },
        notifications: {
          total: totalNotifications,
          unread: unreadCount,
          types: types,
          recent: recentNotifications
        }
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }

  async getAdminStats() {
    try {
      // Общее количество пользователей
      const totalUsers = await userModel.count();
      
      // Количество активных пользователей
      const activeUsers = await userModel.count({ is_active: true });
      
      // Количество подтвержденных пользователей
      const verifiedUsers = await userModel.count({ email_verified: true });
      
      // Количество администраторов
      const admins = await userModel.count({ role: 'admin' });
      
      // Количество модераторов
      const moderators = await userModel.count({ role: 'moderator' });

      // Количество пользователей за последние 7 дней
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newLastWeekResult = await userModel.query(
        `SELECT COUNT(*) FROM users WHERE created_at >= $1`,
        [lastWeek]
      );
      const newLastWeek = parseInt(newLastWeekResult.rows[0].count, 10);

      // Общее количество уведомлений
      const totalNotifications = await notificationModel.count();

      // Количество непрочитанных уведомлений
      const unreadNotifications = await notificationModel.count({ is_read: false });

      // Количество уведомлений за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const notificationsTodayResult = await notificationModel.query(
        `SELECT COUNT(*) FROM notifications WHERE created_at >= $1`,
        [today]
      );
      const notificationsToday = parseInt(notificationsTodayResult.rows[0].count, 10);

      // Распределение по ролям
      const roleStats = await userModel.query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      );

      const roles = roleStats.rows.map(row => ({
        name: row.role,
        count: parseInt(row.count, 10),
        percentage: totalUsers > 0 ? Math.round((row.count / totalUsers) * 100) : 0
      }));

      // Информация о таблицах
      const tables = [
        { name: 'users', rows: totalUsers, size: 'N/A', last_updated: new Date() },
        { name: 'notifications', rows: totalNotifications, size: 'N/A', last_updated: new Date() }
      ];

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          active_today: 0,
          admins: admins,
          moderators: moderators,
          new_last_week: newLastWeek
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
          today: notificationsToday
        },
        database: {
          table_count: 2,
          total_rows: totalUsers + totalNotifications,
          total_size: 'N/A',
          tables: tables
        },
        system: {
          memory_usage: Math.round(process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100) + '%',
          active_connections: 0,
          uptime: this.formatUptime(process.uptime())
        },
        roles: roles
      };
    } catch (error) {
      console.error('Ошибка в функции getAdminStats:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      // Проверка соединения с базой данных
      const dbCheck = await userModel.query('SELECT 1 as healthy');
      
      // Использование памяти
      const memoryUsage = process.memoryUsage();
      
      // Время работы процесса
      const uptime = process.uptime();
      
      return {
        database: dbCheck.rows[0]?.healthy === 1 ? 'healthy' : 'unhealthy',
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        uptime: this.formatUptime(uptime),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка при получении информации о состоянии системы:', error);
      throw error;
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

module.exports = new StatsService();
const userModel = require('../models/User');
const NotificationService = require('./NotificationService');

class UserService {
  async updateProfile(userId, profileData) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Занят ли Email
    if (profileData.email && profileData.email !== user.email) {
      const existingUser = await userModel.findByEmail(profileData.email);
      if (existingUser) {
        throw new Error('Пользователь с таким Email уже существует');
      }
    }

    return await userModel.updateProfile(userId, profileData);
  }

  async updateRole(userId, role) {
    return await userModel.updateRole(userId, role);
  }

  async getUsers(options = {}) {
    const users = await userModel.findAll({}, options);
    
    // Удаляем хэш пароля из ответа
    return users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getUserById(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changeEmail(userId, newEmail, currentPassword) {
    // Изменение почты
    const user = await userModel.changeEmail(userId, newEmail, currentPassword);
    
    // Удалем хэш пароля из ответа
    const { password_hash, ...userWithoutPassword } = user;
    
    // Уведомление
    await NotificationService.createEmailChangeNotification(
      userId, 
      user.email, 
      user.email_verification_token
    );
       return userWithoutPassword;
  }

  async verifyEmail(token) {
    const user = await userModel.verifyEmail(token);
    
    // Удалем хэш пароля из ответа
    const { password_hash, ...userWithoutPassword } = user;
    
    // Уведомление
    await NotificationService.createEmailVerifiedNotification(user.id);
    
    return userWithoutPassword;
  }

  async getLastPasswordChange(userId) {
    return await userModel.getLastPasswordChange(userId);
  }
}

module.exports = new UserService();
const userModel = require('../models/User');
const jwtService = require('../utils/jwt');
const NotificationService = require('./NotificationService');

class AuthService {
  async register(userData) {
    // Check if email already exists
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Адрес электронной почты успешно изменён');
    }

    // Обновляем время последнего входа при регистрации
    userData.last_login = new Date();

    // Create user
    const user = await userModel.create(userData);
    
    // Приветсвенное уведомление
    await NotificationService.createWelcomeNotification(user.id);

    // Создаём токен
    const token = jwtService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Удалите хэш пароля из ответа
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async login(email, password) {
    // Посиск пользователя
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('Неверные учетные данные');
    }
    if (!user.is_active) {
      throw new Error('Неверные учетные данные');
    }

    // Проверка пароля
    const isValidPassword = await userModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Неверные учетные данные');
    }

    // Обновление времени последнего входа
    await userModel.updateLastLogin(user.id);

    // Создаём токен
    const token = jwtService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

     // Удалите хэш пароля из ответа
    const { password_hash, ...userWithoutPassword } = user;


    return {
      user: userWithoutPassword,
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Проверка текущего пароля
    const isValidPassword = await userModel.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Текущий пароль введён неверен');
    }

    // Обновление пароль
    await userModel.updatePassword(userId, newPassword);

    // Отправлем уведомление
    await NotificationService.createPasswordChangeNotification(userId);

    return { 
      message: 'Пароль успешно изменен',
      lastPasswordChange: new Date()
    };
  }
}

module.exports = new AuthService();
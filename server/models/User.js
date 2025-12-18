const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToCreate = {
      ...userData,
      password_hash: hashedPassword
    };
    delete userToCreate.password;
    
    return await super.create(userToCreate);
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.update(userId, { 
      password_hash: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
      reset_password_attempts: 0,
      last_reset_password_attempt: null,
      last_password_change: new Date()
    });
  }

  async updateProfile(userId, profileData) {
    const allowedFields = ['username', 'first_name', 'last_name', 'bio', 'avatar_url'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });

    return await this.update(userId, updateData);
  }

  async updateRole(userId, role) {
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }
    return await this.update(userId, { role });
  }

  async updateLastLogin(userId) {
    return await this.update(userId, { last_login: new Date() });
  }

  async changeEmail(userId, newEmail, currentPassword) {
    // Находим пользователя
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем текущий пароль
    const isValidPassword = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Проверяем, не занят ли новый email
    const existingUser = await this.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email already in use by another account');
    }

    // Проверяем, не совпадает ли новый email с текущим
    if (user.email === newEmail) {
      throw new Error('New email is the same as current email');
    }

    // Обновляем email
    const updatedUser = await this.update(userId, { 
      email: newEmail,
      email_verified: false, // Сбрасываем верификацию email
      email_verification_token: crypto.randomBytes(32).toString('hex'),
      email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
      last_email_change: new Date()
    });

    return updatedUser;
  }

  async verifyEmail(token) {
    const user = await this.findOne({ 
      email_verification_token: token 
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (new Date(user.email_verification_expires) < new Date()) {
      throw new Error('Verification token has expired');
    }

    // Активируем email
    const updatedUser = await this.update(user.id, {
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null
    });

    return updatedUser;
  }

  async setPasswordResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Проверяем количество попыток
    if (user.reset_password_attempts >= 5) {
      const lastAttempt = new Date(user.last_reset_password_attempt);
      const now = new Date();
      const hoursSinceLastAttempt = (now - lastAttempt) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttempt < 24) {
        throw new Error('Too many reset attempts. Try again tomorrow.');
      } else {
        // Сбрасываем счетчик попыток
        await this.update(user.id, { reset_password_attempts: 0 });
      }
    }

    // Генерируем токен
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Устанавливаем время истечения (1 час)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.update(user.id, {
      reset_password_token: resetTokenHash,
      reset_password_expires: resetExpires,
      reset_password_attempts: (user.reset_password_attempts || 0) + 1,
      last_reset_password_attempt: new Date()
    });

    return {
      user,
      resetToken
    };
  }

  async verifyPasswordResetToken(token) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.findOne({ 
      reset_password_token: tokenHash 
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date(user.reset_password_expires) < new Date()) {
      throw new Error('Reset token has expired');
    }

    return user;
  }

  async clearPasswordResetToken(userId) {
    return await this.update(userId, {
      reset_password_token: null,
      reset_password_expires: null
    });
  }

  async getLastPasswordChange(userId) {
    const user = await this.findById(userId);
    return user.last_password_change || user.created_at;
  }

  async updateLastPasswordChange(userId) {
    return await this.update(userId, { last_password_change: new Date() });
  }

  async getUserStats() {
    const { rows } = await this.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified
       FROM users`,
      []
    );
    return rows[0];
  }
}

module.exports = new User();
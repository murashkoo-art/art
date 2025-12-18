const UserService = require('../services/UserService');

class UserController {
  async updateProfile(req, res) {
    try {
      const user = await UserService.updateProfile(req.user.id, req.validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async changeEmail(req, res) {
    try {
      const { newEmail, currentPassword } = req.validatedData;
      
      const user = await UserService.changeEmail(
        req.user.id,
        newEmail,
        currentPassword
      );
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const user = await UserService.verifyEmail(token);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLastPasswordChange(req, res) {
    try {
      const lastChange = await UserService.getLastPasswordChange(req.user.id);
      res.json({ lastPasswordChange: lastChange });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.validatedData;
      
      const user = await UserService.updateRole(userId, role);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserService.getUsers(req.query);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
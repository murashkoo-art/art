module.exports = {
  up: async (db) => {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN reset_password_token VARCHAR(255),
      ADD COLUMN reset_password_expires TIMESTAMP,
      ADD COLUMN reset_password_attempts INTEGER DEFAULT 0,
      ADD COLUMN last_reset_password_attempt TIMESTAMP;
    `);

    await db.query(`
      CREATE INDEX idx_users_reset_token ON users(reset_password_token);
      CREATE INDEX idx_users_reset_expires ON users(reset_password_expires);
    `);
  },

  down: async (db) => {
    await db.query(`
      ALTER TABLE users 
      DROP COLUMN reset_password_token,
      DROP COLUMN reset_password_expires,
      DROP COLUMN reset_password_attempts,
      DROP COLUMN last_reset_password_attempt;
    `);
  }
};
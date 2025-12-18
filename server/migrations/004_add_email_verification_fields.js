module.exports = {
  up: async (db) => {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN email_verified BOOLEAN DEFAULT false,
      ADD COLUMN email_verification_token VARCHAR(255),
      ADD COLUMN email_verification_expires TIMESTAMP,
      ADD COLUMN last_email_change TIMESTAMP,
      ADD COLUMN last_password_change TIMESTAMP;
    `);

    await db.query(`
      CREATE INDEX idx_users_email_verified ON users(email_verified);
      CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
    `);
  },

  down: async (db) => {
    await db.query(`
      ALTER TABLE users 
      DROP COLUMN email_verified,
      DROP COLUMN email_verification_token,
      DROP COLUMN email_verification_expires,
      DROP COLUMN last_email_change,
      DROP COLUMN last_password_change;
    `);
  }
};
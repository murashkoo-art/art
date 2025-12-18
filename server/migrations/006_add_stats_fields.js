module.exports = {
  up: async (db) => {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN last_login TIMESTAMP,
      ADD COLUMN profile_updates INTEGER DEFAULT 0,
      ADD COLUMN last_profile_update TIMESTAMP,
      ADD COLUMN notification_count INTEGER DEFAULT 0;
    `);

    await db.query(`
      CREATE INDEX idx_users_last_login ON users(last_login);
      CREATE INDEX idx_users_profile_updates ON users(profile_updates);
    `);
  },

  down: async (db) => {
    await db.query(`
      ALTER TABLE users 
      DROP COLUMN last_login,
      DROP COLUMN profile_updates,
      DROP COLUMN last_profile_update,
      DROP COLUMN notification_count;
    `);
  }
};
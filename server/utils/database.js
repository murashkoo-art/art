const { Pool } = require('pg');
const config = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    console.log(config.pool)
    this.pool = new Pool(config.pool);
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.js'))
      .sort();

    await this.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const file of migrationFiles) {
      const { rows } = await this.query(
        'SELECT id FROM migrations WHERE name = $1',
        [file]
      );

      if (rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        await migration.up(this);
        await this.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
      }
    }
  }

  async createMigration(name) {
    const timestamp = Date.now();
    const fileName = `${timestamp.toString().padStart(3, '0')}_${name}.js`;
    const template = `module.exports = {
      up: async (db) => {
      },
      down: async (db) => {
      }
    };`;

    await fs.writeFile(
      path.join(__dirname, '../../migrations', fileName),
      template
    );
    console.log(`Created migration: ${fileName}`);
  }
}

module.exports = new Database();
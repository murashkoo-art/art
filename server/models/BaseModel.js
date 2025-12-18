const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async query(text, params) {
    return await db.query(text, params);
  }

  async findById(id) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      throw new Error('Conditions are required for findOne');
    }
    
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`,
      values
    );
    return rows[0] || null;
  }

  async findAll(conditions = {}, options = {}) {
    const { 
      limit = 100, 
      offset = 0, 
      orderBy = 'created_at', 
      order = 'DESC' 
    } = options;
    
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    let whereClause = '';
    if (keys.length > 0) {
      whereClause = `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`;
    }

    const queryParams = [...values];
    
    // Add limit and offset to params if needed
    let limitOffsetClause = '';
    if (limit && offset >= 0) {
      queryParams.push(limit, offset);
      limitOffsetClause = `LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    } else if (limit) {
      queryParams.push(limit);
      limitOffsetClause = `LIMIT $${queryParams.length}`;
    }

    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} 
       ${whereClause} 
       ORDER BY ${orderBy} ${order} 
       ${limitOffsetClause}`,
      queryParams
    );
    return rows;
  }

  async create(data) {
    const id = uuidv4();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 2}`);
    
    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (id, ${keys.join(', ')}) 
       VALUES ($1, ${placeholders.join(', ')}) 
       RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) {
      throw new Error('No fields to update');
    }
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

    const { rows } = await this.query(
      `UPDATE ${this.tableName} 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  }

  async count(conditions = {}) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    let whereClause = '';
    
    if (keys.length > 0) {
      whereClause = `WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}`;
    }

    const { rows } = await this.query(
      `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`,
      values
    );
    return parseInt(rows[0].count, 10);
  }

  async exists(conditions) {
    const result = await this.findOne(conditions);
    return result !== null;
  }

  async transaction(callback) {
    return await db.transaction(callback);
  }

  async bulkCreate(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items must be a non-empty array');
    }

    const keys = Object.keys(items[0]);
    const values = items.map(item => Object.values(item));
    
    const valuePlaceholders = items.map((_, rowIndex) => {
      const start = rowIndex * keys.length + 1;
      return `(${keys.map((_, colIndex) => `$${start + colIndex}`).join(', ')})`;
    }).join(', ');

    const allValues = values.flat();

    const { rows } = await this.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) 
       VALUES ${valuePlaceholders} 
       RETURNING *`,
      allValues
    );
    return rows;
  }

  async updateMany(conditions, data) {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    
    if (conditionKeys.length === 0) {
      throw new Error('Conditions are required for updateMany');
    }
    
    if (dataKeys.length === 0) {
      throw new Error('No fields to update');
    }
    
    const whereClause = conditionKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const setClause = dataKeys.map((key, i) => `${key} = $${conditionKeys.length + i + 1}`).join(', ');

    const { rowCount } = await this.query(
      `UPDATE ${this.tableName} 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE ${whereClause}`,
      [...conditionValues, ...dataValues]
    );
    return rowCount;
  }

  async deleteMany(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      throw new Error('Conditions are required for deleteMany');
    }
    
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const { rowCount } = await this.query(
      `DELETE FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
    return rowCount;
  }
}

module.exports = BaseModel;
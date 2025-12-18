const BaseModel = require('./BaseModel');

class Gallery extends BaseModel {
  constructor() {
    super('gallery_items');
  }

  async create(data) {
    const { id: dataId, ...cleanData } = data;
    return await super.create(cleanData);
  }
  
  async findByUserId(userId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', ...filters } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;
    
    // Фильтрация по статусу
    if (filters.status === 'valid') {
      whereClause += ' AND is_valid = true';
    } else if (filters.status === 'invalid') {
      whereClause += ' AND is_valid = false';
    }
    
    // Поиск
    if (filters.q) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR artist ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
      queryParams.push(`%${filters.q}%`);
      paramIndex++;
    }

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE ${whereClause} 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const { rows } = await this.query(query, queryParams);
    return rows;
  }

  async createItem(userId, itemData) {
    const data = {
      user_id: userId,
      ...itemData
    };
    return await super.create(data);
  }

  async updateItem(id, userId, itemData) {
    const item = await this.findById(id);
    if (!item || item.user_id !== userId) {
      throw new Error('Item not found or access denied');
    }
    console.log('updateItem db: ');
      console.log(itemData);
    return await super.update(id, itemData);
  }

  async deleteItem(id, userId) {
    const item = await this.findById(id);
    if (!item || item.user_id !== userId) {
      throw new Error('Item not found or access denied');
    }
    return await super.delete(id);
  }

  async searchItems(userId, searchTerm, options = {}) {
    const { limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    
    const queryParams = [userId];
    let whereClause = 'user_id = $1';
    
    if (searchTerm) {
      whereClause += ` AND (title ILIKE $2 OR description ILIKE $2 OR artist ILIKE $2 OR tags ILIKE $2)`;
      queryParams.push(`%${searchTerm}%`);
    }

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE ${whereClause} 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);
    const { rows } = await this.query(query, queryParams);
    return rows;
  }

  async countItems(userId, searchTerm = '') {
    let whereClause = 'user_id = $1';
    const queryParams = [userId];
    
    if (searchTerm) {
      whereClause += ` AND (title ILIKE $2 OR description ILIKE $2 OR artist ILIKE $2 OR tags ILIKE $2)`;
      queryParams.push(`%${searchTerm}%`);
    }

    const { rows } = await this.query(
      `SELECT COUNT(*) FROM ${this.tableName} WHERE ${whereClause}`,
      queryParams
    );
    return parseInt(rows[0].count, 10);
  }

  async getPublicItems(options = {}) {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', ...filters } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'is_valid = true';
    const queryParams = [];
    let paramIndex = 1;
    
    // Фильтрация по статусу
    if (filters.status === 'valid') {
      whereClause = 'is_valid = true';
    } else if (filters.status === 'invalid') {
      whereClause = 'is_valid = false';
    } else if (filters.status === 'all') {
      whereClause = '1=1'; // Показываем все работы
    }
    
    // Поиск
    if (filters.q) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR artist ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
      queryParams.push(`%${filters.q}%`);
      paramIndex++;
    }

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE ${whereClause} 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const { rows } = await this.query(query, queryParams);
    return rows;
  }

  async getItemsByTag(tag, options = {}) {
    const { limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE tags ILIKE $1 AND is_valid = true 
      ORDER BY ${sortBy} ${sortOrder} 
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await this.query(query, [`%${tag}%`, limit, offset]);
    return rows;
  }

  async getStatistics(userId) {
    const total = await this.count({ user_id: userId });
    const valid = await this.count({ user_id: userId, is_valid: true });
    const invalid = await this.count({ user_id: userId, is_valid: false });
    
    return {
      total,
      valid,
      invalid,
      totalSize: '0 MB' // Можно реализовать подсчет размера файлов
    };
  }
}

module.exports = new Gallery();
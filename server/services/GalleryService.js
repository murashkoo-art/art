const galleryModel = require('../models/Gallery');
const fileManager = require('../utils/fileManager');

class GalleryService {
  // Получение работ пользователя
  async getUserItems(userId, options = {}) {
    return await galleryModel.findByUserId(userId, options);
  }

  // Получение публичных работ
  async getPublicItems(options = {}) {
    return await galleryModel.getPublicItems(options);
  }

  // Получение одной работы по ID
  async getItemById(itemId, userId) {
    const item = await galleryModel.findById(itemId);
    if (!item) {
      throw new Error('Работа не найдена');
    }
    
    // Проверка прав доступа
    if (!item.is_valid && item.user_id !== userId) {
      throw new Error('Доступ запрещен');
    }
    
    return item;
  }

  // Создание работы
  async createItem(userId, itemData) {
    // Обрабатываем пустые значения
    const { id, filename, ...cleanData } = itemData;
    
    const processedData = {
      title: cleanData.title || null,
      description: cleanData.description || null,
      artist: cleanData.artist || null,
      year: cleanData.year || null,
      tags: cleanData.tags || null,
      image_url: cleanData.image_url,
      is_valid: Boolean(cleanData.is_valid)
    };
    
    return await galleryModel.createItem(userId, processedData);
  }

  // Загрузка изображения
  async uploadImage(file, userId) {
    if (!file) {
      throw new Error('Файл не загружен');
    }

    // Используем fileManager для обработки файла
    const uploadResult = await fileManager.uploadFile(file, userId);
    
    return {
      filename: uploadResult.filename,
      originalname: file.originalname,
      path: uploadResult.path,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  // Обновление работы
  async updateItem(itemId, userId, itemData, is_new_file = false) {
    const oldItem = await galleryModel.findById(itemId);
    
    if (oldItem && is_new_file && oldItem.image_url) {
      // Удаляем старый файл если загружен новый
      await this.deleteFile(oldItem.image_url);
    }
    console.log('Serv updateItem: ');
      console.log(itemData);
    return await galleryModel.updateItem(itemId, userId, itemData);
  }

  // Удаление работы
  async deleteItem(itemId, userId) {
    const item = await galleryModel.findById(itemId);
    if (item && item.image_url) {
      // Удаляем файл изображения
      await this.deleteFile(item.image_url);
    }
    return await galleryModel.deleteItem(itemId, userId);
  }

  // Удаление файла
  async deleteFile(filePath) {
    return await fileManager.deleteFile(filePath);
  }

  // Поиск работ пользователя
  async searchItems(userId, searchTerm, options = {}) {
    return await galleryModel.searchItems(userId, searchTerm, options);
  }

  // Поиск публичных работ
  async searchPublicItems(searchTerm, options = {}) {
    const items = await galleryModel.getPublicItems({
      ...options,
      q: searchTerm
    });
    return items;
  }

  // Валидация работы
  async validateItem(itemId, userId) {
    const item = await galleryModel.findById(itemId);
    if (!item || item.user_id !== userId) {
      throw new Error('Работа не найдена или доступ запрещен');
    }
    return await galleryModel.update(itemId, { is_valid: true });
  }

  // Работы по тегу
  async getItemsByTag(tag, options = {}) {
    return await galleryModel.getItemsByTag(tag, options);
  }

  // Статистика
  async getStatistics(userId) {
    const stats = await galleryModel.getStatistics(userId);
    
    // Получаем размер всех файлов пользователя
    const totalSize = await fileManager.getUserGallerySize(userId);
    
    return {
      ...stats,
      totalSize: fileManager.formatFileSize(totalSize)
    };
  }

  // Очистка старых файлов
  async cleanupOldFiles(days = 30) {
    try {
      // Получаем старые файлы
      const oldItems = await galleryModel.findAll({
        where: `created_at < NOW() - INTERVAL '${days} days' AND is_valid = false`
      });
      
      let deletedCount = 0;
      
      // Удаляем файлы и записи
      for (const item of oldItems) {
        if (item.image_url) {
          await this.deleteFile(item.image_url);
        }
        await galleryModel.delete(item.id);
        deletedCount++;
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  // Удаление всех работ пользователя
  async deleteUserGallery(userId) {
    try {
      // Удаляем файлы пользователя
      await fileManager.deleteUserGalleryFiles(userId);
      
      // Удаляем записи из БД
      await galleryModel.deleteMany({ user_id: userId });
      
      return true;
    } catch (error) {
      console.error('Error deleting user gallery:', error);
      throw error;
    }
  }
}

module.exports = new GalleryService();
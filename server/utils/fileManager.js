const fs = require('fs');
const path = require('path');

class FileManager {
  constructor() {
    this.baseUploadDir = path.join(__dirname, '../public/uploads');
  }

  // Удаляем файл по относительному пути
  async deleteFile(relativePath) {
    try {
      if (!relativePath) return false;
      
      const fullPath = path.join(this.baseUploadDir, relativePath.replace('/uploads/', ''));
      
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        
        // Пытаемся удалить пустую родительскую директорию
        const dir = path.dirname(fullPath);
        const files = await fs.promises.readdir(dir);
        if (files.length === 0) {
          await fs.promises.rmdir(dir);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Удаляем все файлы пользователя из галереи
  async deleteUserGalleryFiles(userId) {
    try {
      const userGalleryDir = path.join(this.baseUploadDir, 'gallery', userId);
      
      if (fs.existsSync(userGalleryDir)) {
        // Рекурсивно удаляем все файлы и папки
        await fs.promises.rm(userGalleryDir, { recursive: true, force: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при удалении файлов пользовательской галереи:', error);
      return false;
    }
  }

  // Получаем информацию о файле
  getFileInfo(fullPath) {
    try {
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const stats = fs.statSync(fullPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile()
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // Проверяем, существует ли файл
  fileExists(fullPath) {
    return fs.existsSync(fullPath);
  }

  // Получаем размер папки пользователя
  async getUserGallerySize(userId) {
    try {
      const userGalleryDir = path.join(this.baseUploadDir, 'gallery', userId);
      
      if (!fs.existsSync(userGalleryDir)) {
        return 0;
      }

      let totalSize = 0;
      
      const calculateSize = async (dir) => {
        const items = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const itemPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            await calculateSize(itemPath);
          } else if (item.isFile()) {
            const stats = await fs.promises.stat(itemPath);
            totalSize += stats.size;
          }
        }
      };
      
      await calculateSize(userGalleryDir);
      return totalSize;
    } catch (error) {
      console.error('Error calculating user gallery size:', error);
      return 0;
    }
  }

  // Форматируем размер в читаемый вид
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new FileManager();
const GalleryService = require('../services/GalleryService');
const { createGalleryItemSchema, bulkCreateGalleryItemsSchema, updateGalleryItemSchema } = require('../middleware/validation-gallery');

class GalleryController {
  // Получение всех работ (публичных и пользовательских)
  async getItems(req, res) {
    try {
      // Определяем, запрашивает ли пользователь свои работы или все публичные
      const isMyGallery = req.query.my === 'true' || req.query.userId === req.user.id;
      
      let items;
      if (isMyGallery) {
        items = await GalleryService.getUserItems(req.user.id, req.query);
      } else {
        items = await GalleryService.getPublicItems(req.query);
      }
      
      res.json(items);
    } catch (error) {
      console.error('Get items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Получение публичных работ (отдельный endpoint для клиента)
  async getPublicItems(req, res) {
    try {
      const items = await GalleryService.getPublicItems(req.query);
      res.json(items);
    } catch (error) {
      console.error('Get public items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Получение работ пользователя (отдельный endpoint для клиента)
  async getUserItems(req, res) {
    try {
      const items = await GalleryService.getUserItems(req.user.id, req.query);
      res.json(items);
    } catch (error) {
      console.error('Get user items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Получение одной работы
  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await GalleryService.getItemById(id, req.user.id);
      res.json(item);
    } catch (error) {
      console.error('Get item error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Загрузка работ
  async uploadItems(req, res) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      
      if (files.length === 0) {
        return res.status(400).json({ error: 'Требуется хотя бы одно изображение' });
      }

      // Определяем тип загрузки
      const isBulkUpload = req.body.items && Array.isArray(JSON.parse(req.body.items));
      let itemsData = [];
      
      if (isBulkUpload) {
        const bulkData = JSON.parse(req.body.items);
        
        // Валидация массива данных
        const { error, value } = bulkCreateGalleryItemsSchema.validate(bulkData);
        if (error) {
          await Promise.all(files.map(file => 
            GalleryService.deleteFile(file.path)
          ));
          return res.status(400).json({ error: error.details[0].message });
        }
        itemsData = files.map((file, index) => {
          const fileData = value.find(item => item.filename === file.originalname) || {};
          return {
            ...fileData,
            image_url: file.relativePath
          };
        });
      } else {
        const { error, value } = createGalleryItemSchema.validate(req.body);
        if (error) {
          await Promise.all(files.map(file => 
            GalleryService.deleteFile(file.path)
          ));
          return res.status(400).json({ error: error.details[0].message });
        }
        
        itemsData = files.map(file => ({
          ...value,
          image_url: file.relativePath
        }));
      }

      // Создаем записи в БД
      const results = [];
      for (const itemData of itemsData) {
        try {
          const item = await GalleryService.createItem(req.user.id, itemData);
          results.push(item);
        } catch (createError) {
          console.error('Error creating item:', createError);
          results.push({ error: createError.message, filename: itemData.filename });
        }
      }

      // Фильтруем успешные результаты
      const successfulItems = results.filter(item => !item.error);
      
      // Добавляем полные URL
      const itemsWithFullUrls = successfulItems.map(item => ({
        ...item,
        image_url: `${req.protocol}://${req.get('host')}${item.image_url}`
      }));

      res.status(201).json({
        success: true,
        message: `Успешно загружено ${successfulItems.length} из ${files.length} изображений`,
        items: itemsWithFullUrls,
        failed: results.filter(item => item.error).length
      });
    } catch (error) {
      console.error('Upload items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Обновление работы
 async updateItem(req, res) {
    try {
      const { id } = req.params;
      let updateData = {};
      let hasNewFile = false;
      
      console.log('Files received:', req.files); // ДЛЯ ОТЛАДКИ
      console.log('Body data:', req.body); // ДЛЯ ОТЛАДКИ
      
      // Получаем данные из body
      Object.keys(req.body).forEach(key => {
        // Пропускаем технические поля
        if (!['id', 'user_id', 'created_at', 'updated_at'].includes(key)) {
          // Преобразуем строковые значения в правильные типы
          if (key === 'year' && req.body[key]) {
            updateData[key] = parseInt(req.body[key], 10);
          } else if (key === 'is_valid') {
            updateData[key] = req.body[key] === 'true' || req.body[key] === true;
          } else if (key === 'tags' && req.body[key]) {
            // Обработка тегов - пытаемся разобрать JSON или оставить строкой
            try {
              const parsedTags = JSON.parse(req.body[key]);
              updateData[key] = Array.isArray(parsedTags) ? parsedTags : req.body[key];
            } catch (e) {
              // Если не JSON, оставляем как строку (валидатор преобразует)
              updateData[key] = req.body[key];
            }
          } else {
            updateData[key] = req.body[key];
          }
        }
      });
      
      // Если есть файлы, берем первый (должен быть один)
      if (req.files && req.files.length > 0) {
        const file = req.files[0];
        console.log('Processing file:', file.originalname);
        updateData.image_url = file.relativePath || `/uploads/gallery/${req.user.id || 'general'}/${file.filename}`;
        hasNewFile = true;
      }
      
      // Валидация данных
      const { error, value: validatedData } = updateGalleryItemSchema.validate(
        updateData, 
        { 
          abortEarly: false, 
          stripUnknown: true,
          convert: true // Включаем конвертацию типов
        }
      );
      
      if (error) {
        console.error('Validation error:', error.details);
        
        // Если файл был загружен, но валидация не прошла, удаляем его
        if (req.files && req.files.length > 0) {
          await Promise.all(req.files.map(file => 
            GalleryService.deleteFile(file.path)
          ));
        }
        
        return res.status(400).json({ 
          error: 'Ошибка валидации',
          details: error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }))
        });
      }
      
      // Проверяем, есть ли что обновлять
      if (Object.keys(validatedData).length === 0 && !hasNewFile) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }
      
      // Обновляем данные в базе
      
      const item = await GalleryService.updateItem(id, req.user.id, validatedData, hasNewFile);
      
      res.json({
        success: true,
        data: item,
        message: 'Данные успешно обновлены'
      });
      
    } catch (error) {
      console.error('Update item error:', error);
      
      // Если файл был загружен, но произошла ошибка, удаляем его
      if (req.files && req.files.length > 0) {
        try {
          await Promise.all(req.files.map(file => 
            GalleryService.deleteFile(file.path)
          ));
        } catch (deleteError) {
          console.error('Error deleting uploaded files:', deleteError);
        }
      }
      
      res.status(400).json({ 
        error: error.message || 'Не удалось обновить работу'
      });
    }
  }

  // Удаление работы
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      await GalleryService.deleteItem(id, req.user.id);
      res.json({ message: 'Работа успешно удалена' });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Поиск работ
  async searchItems(req, res) {
    try {
      const { q, ...options } = req.query;
      const items = await GalleryService.searchItems(req.user.id, q, options);
      
      const itemsWithFullUrls = items.map(item => ({
        ...item,
        image_url: `${req.protocol}://${req.get('host')}${item.image_url}`
      }));
      
      res.json(itemsWithFullUrls);
    } catch (error) {
      console.error('Search items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Поиск публичных работ
  async searchPublicItems(req, res) {
    try {
      const { q, ...options } = req.query;
      const items = await GalleryService.searchPublicItems(q, options);
      
      const itemsWithFullUrls = items.map(item => ({
        ...item,
        image_url: `${req.protocol}://${req.get('host')}${item.image_url}`
      }));
      
      res.json(itemsWithFullUrls);
    } catch (error) {
      console.error('Search public items error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Валидация работы
  async validateItem(req, res) {
    try {
      const { id } = req.params;
      const item = await GalleryService.validateItem(id, req.user.id);
      
      item.image_url = `${req.protocol}://${req.get('host')}${item.image_url}`;
      
      res.json(item);
    } catch (error) {
      console.error('Validate item error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Статистика
  async getStatistics(req, res) {
    try {
      const stats = await GalleryService.getStatistics(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Работы по тегу
  async getItemsByTag(req, res) {
    try {
      const { tag } = req.params;
      const items = await GalleryService.getItemsByTag(tag, req.query);
      
      const itemsWithFullUrls = items.map(item => ({
        ...item,
        image_url: `${req.protocol}://${req.get('host')}${item.image_url}`
      }));
      
      res.json(itemsWithFullUrls);
    } catch (error) {
      console.error('Get items by tag error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Очистка старых файлов
  async cleanupOldFiles(req, res) {
    try {
      const { days = 30 } = req.query;
      const deletedCount = await GalleryService.cleanupOldFiles(parseInt(days));
      res.json({ 
        message: `Удалено ${deletedCount} старых файлов`,
        deletedCount 
      });
    } catch (error) {
      console.error('Cleanup old files error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GalleryController();
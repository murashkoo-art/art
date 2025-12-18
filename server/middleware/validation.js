const Joi = require('joi');

class ValidationMiddleware {
  validate(schema, options = {}) {
    return (req, res, next) => {
      const validationOptions = {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true, // Разрешаем неизвестные поля для обработки файлов
        ...options
      };

      // Для FormData преобразуем данные
      let dataToValidate = req.body;
      
      // Если есть файлы, добавляем их в данные для валидации
      if (req.file) {
        dataToValidate = { ...dataToValidate, file: req.file };
      }
      if (req.files) {
        dataToValidate = { ...dataToValidate, files: req.files };
      }

      const { error, value } = schema.validate(dataToValidate, validationOptions);

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        return res.status(400).json({
          error: 'Неверно указаны данные',
          details: errors
        });
      }

      req.validatedData = value;
      next();
    };
  }

  validateParams(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.params);

      if (error) {
        return res.status(400).json({
          error: 'Недопустимые параметры',
          details: error.details.map(detail => detail.message)
        });
      }

      next();
    };
  }

  validateQuery(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return res.status(400).json({
          error: 'Неверные параметры запроса',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      req.validatedQuery = value;
      next();
    };
  }
  
  // Валидация для загрузки файлов
  validateFiles(maxCount = 10, maxSizeMB = 10) {
    return (req, res, next) => {
      const files = req.files || (req.file ? [req.file] : []);
      
      if (files.length === 0) {
        return next();
      }

      // Проверка количества файлов
      if (files.length > maxCount) {
        return res.status(400).json({
          error: `Максимальное количество файлов: ${maxCount}`
        });
      }

      // Проверка размера файлов
      const maxSize = maxSizeMB * 1024 * 1024;
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        return res.status(400).json({
          error: `Максимальный размер файла: ${maxSizeMB}MB`,
          files: oversizedFiles.map(f => f.originalname)
        });
      }

      // Проверка типа файлов (только изображения)
      const invalidFiles = files.filter(file => !file.mimetype.startsWith('image/'));
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          error: 'Разрешены только изображения',
          files: invalidFiles.map(f => f.originalname)
        });
      }

      next();
    };
  }
}

module.exports = new ValidationMiddleware();
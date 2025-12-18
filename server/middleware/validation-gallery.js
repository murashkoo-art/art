const Joi = require('joi');

// Базовая схема для работы галереи
const galleryItemBaseSchema = Joi.object({
  title: Joi.string().max(255).allow('', null),
  description: Joi.string().max(2000).allow('', null),
  artist: Joi.string().max(255).allow('', null),
  year: Joi.alternatives().try(
    Joi.number().integer().min(1000).max(2100),
    Joi.string().pattern(/^\d{4}$/).custom((value, helpers) => {
      const year = parseInt(value);
      if (year >= 1000 && year <= 2100) {
        return year;
      }
      return helpers.error('number.min');
    })
  ).allow(null),
  tags: Joi.string().max(500).allow('', null),
  is_valid: Joi.boolean().default(false),
  filename: Joi.string().optional(),
  
  // Запрещенные поля
  id: Joi.forbidden(),
  image_url: Joi.forbidden(),
  user_id: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden()
});

// Схема для одиночной загрузки
const createGalleryItemSchema = galleryItemBaseSchema;

// Схема для массовой загрузки
const bulkCreateGalleryItemsSchema = Joi.array().items(
  galleryItemBaseSchema.keys({
    filename: Joi.string().required() // Для массовой загрузки имя файла обязательно
  })
);

// Схема для обновления
const updateGalleryItemSchema = Joi.object({
  title: Joi.string().max(255).allow('', null).optional(),
  description: Joi.string().max(2000).allow('', null).optional(),
  artist: Joi.string().max(255).allow('', null).optional(),
  year: Joi.alternatives().try(
    Joi.number().integer().min(1000).max(2100),
    Joi.string().pattern(/^\d{4}$/).custom((value, helpers) => {
      const year = parseInt(value);
      if (year >= 0 && year <= 2100) {
        return year;
      }
      return helpers.error('number.min');
    })
  ).allow(null).optional(),
  tags: Joi.alternatives().try(
    Joi.string().max(500),
    Joi.array().items(Joi.string())
  ).allow('', null).optional(),
  is_valid: Joi.boolean().optional(),
  image_url: Joi.string().allow('', null).optional(),
  
  // Запрещенные поля
  id: Joi.forbidden(),
  user_id: Joi.forbidden(),
  created_at: Joi.forbidden(),
  updated_at: Joi.forbidden()
}).min(1); // Хотя бы одно поле должно быть обновлено

// Схема для поиска
const searchGalleryItemsSchema = Joi.object({
  q: Joi.string().max(255).allow('', null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('created_at', 'title', 'artist', 'year', 'updated_at').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('all', 'valid', 'invalid', 'my').default('all'),
  userId: Joi.string().optional()
});

// Схема для параметров запроса
const galleryParamsSchema = Joi.object({
  id: Joi.string().required(),
  tag: Joi.string().optional()
});

module.exports = {
  createGalleryItemSchema,
  bulkCreateGalleryItemsSchema,
  updateGalleryItemSchema,
  searchGalleryItemsSchema,
  galleryParamsSchema,
  galleryItemBaseSchema
};
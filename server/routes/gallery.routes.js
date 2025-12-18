const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/GalleryController');
const authMiddleware = require('../middleware/auth');
const { upload, processUploadedFiles } = require('../middleware/upload');

// Все запросы требуют авторизации
router.use(authMiddleware.authenticate);

// Получение данных
router.get('/', galleryController.getItems);
router.get('/search', galleryController.searchItems);
router.get('/statistics', galleryController.getStatistics);
router.get('/:id', galleryController.getItem);

// Основной маршрут загрузки - обрабатывает одиночные и множественные загрузки
router.post('/upload',
  upload.any(),
  processUploadedFiles,
  galleryController.uploadItems
);

router.put('/:id',
  upload.any(), 
  processUploadedFiles,
  galleryController.updateItem
);

router.put('/:id/validate', galleryController.validateItem);
router.delete('/:id', galleryController.deleteItem);

// Админский эндпоинт для очистки
router.post('/cleanup', galleryController.cleanupOldFiles);

module.exports = router;
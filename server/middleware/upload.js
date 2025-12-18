const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Создаем папку uploads если её нет
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища с улучшенной обработкой имени файла
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Создаем подпапку по user_id
    const userFolder = req.user?.id || 'general';
    const galleryDir = path.join(uploadDir, 'gallery', userFolder);
    
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }
    
    cb(null, galleryDir);
  },
  filename: (req, file, cb) => {
    // Сохраняем оригинальное расширение
    const ext = path.extname(file.originalname).toLowerCase();
    // Генерируем уникальное имя с сохранением расширения
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp, bmp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Middleware для обработки загруженных файлов
const processUploadedFiles = (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Для массива файлов
      req.files.forEach(file => {
        const userFolder = req.user?.id || 'general';
        const relativePath = `/uploads/gallery/${userFolder}/${file.filename}`;
        file.relativePath = relativePath;
        file.fullPath = path.join(uploadDir, 'gallery', userFolder, file.filename);
        console.log(`File processed: ${file.originalname} -> ${relativePath}`); // Для отладки
      });
    } else if (req.file) {
      // Для одного файла (если будет использоваться upload.single)
      const userFolder = req.user?.id || 'general';
      const relativePath = `/uploads/gallery/${userFolder}/${req.file.filename}`;
      req.file.relativePath = relativePath;
      req.file.fullPath = path.join(uploadDir, 'gallery', userFolder, req.file.filename);
      console.log(`Single file processed: ${req.file.originalname} -> ${relativePath}`);
    }
    next();
  } catch (error) {
    console.error('Error processing uploaded files:', error);
    next(error);
  }
};

module.exports = {
  upload,
  processUploadedFiles
};
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path')
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const galleryRoutes = require('./routes/gallery.routes');
const statsRoutes = require('./routes/stats.routes');
const db = require('./utils/database');

const server_ex = express()
const PORT = process.env.PORT || 3001;

// Middleware
server_ex.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
server_ex.use(express.json());
server_ex.use(express.urlencoded({ extended: true }));

// Обслуживание статических файлов из папки public и uploads
server_ex.use(express.static(path.join(__dirname, 'public', 'app')));
server_ex.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

//обработка ошибок для отсутствующих файлов
server_ex.use('/uploads', (req, res, next) => {
  if (req.url.includes('..')) {
    return res.status(403).send('Доступ запрещен');
  }
  next();
});

// Запрос регистрации
server_ex.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
server_ex.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API
server_ex.use('/api/auth', authRoutes);
server_ex.use('/api/users', userRoutes);
server_ex.use('/api/gallery', galleryRoutes);
server_ex.use('/api/notifications', notificationRoutes);
server_ex.use('/api/password-reset', passwordResetRoutes);
server_ex.use('/api/stats', statsRoutes);

//SPA
server_ex.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app', 'index.html'));
});

// 404
server_ex.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error
server_ex.use((err, req, res, next) => {
  console.error('Глобальная ошибка:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'разработка' && { stack: err.stack })
  });
});



// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    // Запуск миграций
    await db.runMigrations();
    console.log('Миграция базы данных завершена');

    // Запуск сервера
    server_ex.listen(PORT, () => {
      console.log(`Сервер запущен на порту: ${PORT}`);
    });
  } catch (error) {
    console.error('Не удалось запустить сервер:', error);
    process.exit(1);
  }
}

startServer();

module.exports = server_ex;
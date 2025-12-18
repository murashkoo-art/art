# Установка зависимостей серверной части
npm install

Создание файла .env
В корневой папке серверной части (server/) создайте файл .env со следующим содержанием:
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_USER_PASSWORD=ваш_пароль
DB_NAME=art_gallery_db

DB_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

JWT_SECRET=сгенерируйте_уникальный_секретный_ключ
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=10
MAX_FILES_COUNT=10


Настройка базы данных PostgreSQL
Запустите PostgreSQL сервер


Создайте базу данных sql
CREATE DATABASE art_gallery_db;
Убедитесь, что ваш пользователь PostgreSQL имеет права на создание таблиц и выполнения запросов в этой базе данных

Запуск миграций базы данных
npm run migrate
Это создаст все необходимые таблицы в базе данных:

users (пользователи)
notifications (уведомления)
gallery_items (произведения искусства)

Запуск сервера
npm run dev
Сервер будет доступен по адресу: http://localhost:3001

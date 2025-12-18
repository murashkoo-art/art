export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return d.toLocaleDateString('ru-RU');
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateFilename = (filename, maxLength = 20) => {
  if (!filename) return '';
  if (filename.length <= maxLength) return filename;
  const ext = filename.split('.').pop();
  const name = filename.substring(0, maxLength - 8);
  return `${name}... .${ext}`;
};

export const parseTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
};

export const validateImageFile = (file, maxSizeMB = 10) => {
  const errors = [];
  
  if (!file.type.match('image.*')) {
    errors.push('Разрешены только изображения');
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`Размер файла не должен превышать ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
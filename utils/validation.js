export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  isValidCommand(command) {
    return typeof command === 'string' && 
           command.length > 0 && 
           /^[a-z0-9_-]+$/i.test(command);
  },

  isValidDescription(description) {
    return typeof description === 'string' && description.length > 0;
  },

  isValidArray(data) {
    return Array.isArray(data);
  },

  sanitizeCommand(command) {
    if (typeof command !== 'string') return '';
    // Preserve underscore (_) dan dash (-)
    // Hanya hilangkan karakter yang BUKAN: a-z, A-Z, 0-9, underscore, dash
    return command
      .replace(/^\/+/, '')           // Hapus leading slashes
      .replace(/[^a-zA-Z0-9_-]/g, '') // Keep alphanumeric, underscore, dash
      .toLowerCase();
  },

  truncateText(text, maxLength) {
    if (typeof text !== 'string') return '';
    return text.slice(0, maxLength);
  }
};
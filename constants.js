export const CONSTANTS = {
  // Rate Limiting
  RATE_LIMIT: {
    MIN_INTERVAL: 1000,
    SPAM_THRESHOLD: 4,
    BLOCK_TIME: 60 * 1000,
    CLEANUP_INTERVAL: 5 * 60 * 1000, 
  },

  WEBHOOK_RATE_LIMIT: {
    MAX_REQ_PER_SEC: 10,
    WINDOW_MS: 1000,
  },
  
  // API
  API: {
    TIMEOUT: 8000,
    MAX_COMMANDS: 100,
    MAX_DESCRIPTION_LENGTH: 256,
  },
  
  // Messaging
  MESSAGE: {
    BATCH_SIZE: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
  
  // Messages
  MESSAGES: {
    WELCOME: "Selamat datang! Ketik /help untuk daftar perintah.",
    UNKNOWN_COMMAND: "Perintah tidak dikenal",
    ERROR_PROCESSING: "Terjadi error saat memproses perintah",
    DATA_NOT_FOUND: "Data tidak ditemukan",
    EMPTY_DATA: "Data kosong",
    NO_RESPONSE: "Perintah ini belum memiliki respons teks.",
    UNKNOWN_FORMAT: "Format respons tidak dikenali",
    GREETING: "Halo! Ketik /help untuk melihat daftar perintah 👋",
  }
};
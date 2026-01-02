import { CONSTANTS } from '../constants.js';
import { logInfo } from '../utils/logger.js';

class RateLimiter {
  constructor() {
    this.userLastTime = new Map();
    this.userSpamCount = new Map();
    this.blockedUsers = new Map();

    this.startCleanup();
  }

  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, CONSTANTS.RATE_LIMIT.CLEANUP_INTERVAL);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    // Cleanup blocked users yang sudah expired
    for (const [chatId, unblockTime] of this.blockedUsers.entries()) {
      if (now > unblockTime) {
        this.blockedUsers.delete(chatId);
        this.userSpamCount.delete(chatId);
        cleaned++;
      }
    }

    // Cleanup old entries (lebih dari 1 jam tidak aktif)
    const oneHourAgo = now - 60 * 60 * 1000;
    for (const [chatId, lastTime] of this.userLastTime.entries()) {
      if (lastTime < oneHourAgo) {
        this.userLastTime.delete(chatId);
        this.userSpamCount.delete(chatId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logInfo(`Rate limiter cleanup: removed ${cleaned} entries`);
    }
  }

  canProcess(chatId) {
    const now = Date.now();
    
    // Check if blocked
    if (this.blockedUsers.has(chatId) && now < this.blockedUsers.get(chatId)) {
      return false;
    }

    const last = this.userLastTime.get(chatId) || 0;
    const timeSinceLastMsg = now - last;
    
    if (timeSinceLastMsg > CONSTANTS.RATE_LIMIT.MIN_INTERVAL) {
      // Message interval OK, allow and reset spam count
      this.userLastTime.set(chatId, now);
      this.userSpamCount.set(chatId, 0);
      return true;
    }

    // Too fast! Increment spam count
    this.userLastTime.set(chatId, now); // Update last time juga
    const count = (this.userSpamCount.get(chatId) || 0) + 1;
    this.userSpamCount.set(chatId, count);

    // Block user if threshold reached
    if (count >= CONSTANTS.RATE_LIMIT.SPAM_THRESHOLD) {
      this.blockedUsers.set(chatId, now + CONSTANTS.RATE_LIMIT.BLOCK_TIME);
      logInfo(`User ${chatId} blocked for spamming (${count} violations)`);
    }

    return false;
  }

  isBlocked(chatId) {
    const unblockTime = this.blockedUsers.get(chatId);
    if (!unblockTime) return false;

    const now = Date.now();
    if (now > unblockTime) {
      this.blockedUsers.delete(chatId);
      this.userSpamCount.set(chatId, 0);
      return false;
    }
    return true;
  }

  getBlockMessage(chatId) {
    const timeLeft = Math.ceil(
      (this.blockedUsers.get(chatId) - Date.now()) / 1000
    );
    return `Kamu terlalu sering spam. Bisa kirim pesan lagi setelah ${timeLeft} detik.`;
  }

  getBlockTimeLeft(chatId) {
    if (!this.blockedUsers.has(chatId)) return 0;
    return Math.ceil((this.blockedUsers.get(chatId) - Date.now()) / 1000);
  }

  getSpamWarning(chatId) {
    const count = this.userSpamCount.get(chatId) || 0;
    return `Jangan spam! Spam ke-${count}/${CONSTANTS.RATE_LIMIT.SPAM_THRESHOLD}`;
  }

  getStats() {
    return {
      activeUsers: this.userLastTime.size,
      blockedUsers: this.blockedUsers.size,
      totalTracked: this.userSpamCount.size
    };
  }
  getBlockedUsers() {
  return Array.from(this.blockedUsers.entries()).map(([chatId, unblockTime]) => ({
    chatId,
    unblockTime,
    timeLeft: Math.ceil((unblockTime - Date.now()) / 1000)
  }));
}
}

export const rateLimiter = new RateLimiter();
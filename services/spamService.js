const userLastTime = new Map();
const userSpamCount = new Map();
const blockedUsers = new Map();

export const MIN_INTERVAL = 1000; 
export const SPAM_THRESHOLD = 4;  
export const BLOCK_TIME = 60 * 1000; 

export function canProcess(chatId) {
  const now = Date.now();
  if (blockedUsers.has(chatId) && now < blockedUsers.get(chatId)) return false;

  const last = userLastTime.get(chatId) || 0;
  if (now - last > MIN_INTERVAL) {
    userLastTime.set(chatId, now);
    userSpamCount.set(chatId, 0); 
    return true;
  }

  // increment spam count
  const count = (userSpamCount.get(chatId) || 0) + 1;
  userSpamCount.set(chatId, count);

  // blok user jika threshold tercapai
  if (count >= SPAM_THRESHOLD) {
    blockedUsers.set(chatId, now + BLOCK_TIME);
  }

  return false;
}

export function isBlocked(chatId) {
  const unblockTime = blockedUsers.get(chatId);
  if (!unblockTime) return false;

  const now = Date.now();
  if (now > unblockTime) {
    blockedUsers.delete(chatId);
    userSpamCount.set(chatId, 0);
    return false;
  }
  return true;
}

export function getBlockMessage(chatId) {
  const timeLeft = Math.ceil((blockedUsers.get(chatId) - Date.now()) / 1000);
  return `Kamu terlalu sering spam. Bisa kirim pesan lagi setelah ${timeLeft} detik.`;
}

export function getSpamWarning(chatId) {
  const count = userSpamCount.get(chatId) || 0;
  return `Jangan spam! Spam ke-${count}/${SPAM_THRESHOLD}`;
}

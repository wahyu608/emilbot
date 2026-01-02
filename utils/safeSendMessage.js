import { CONSTANTS } from '../constants.js';
import { logError } from './logger.js';

function escapeMarkdown(text) {
  // Escape special Markdown characters untuk Telegram
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function safeSendMessage(bot, chatId, text, options = {}, retries = 0) {
  try {
    // Jangan escape jika sudah ada parse_mode atau user set sendiri
    const shouldEscape = options.parse_mode === 'MarkdownV2' || 
                        (options.parse_mode === 'Markdown' && !options.disableEscape);
    
    const finalText = shouldEscape ? escapeMarkdown(text) : text;
    
    return await bot.sendMessage(chatId, finalText, {
      parse_mode: 'Markdown',
      ...options
    });
  } catch (error) {
    logError(`Failed to send message to ${chatId}:`, error.message);
    
    // Jika error karena parse mode, coba tanpa markdown
    if (error.message.includes('parse') || error.message.includes('entities')) {
      try {
        return await bot.sendMessage(chatId, text, {
          ...options,
          parse_mode: undefined
        });
      } catch (retryError) {
        logError(`Retry without markdown failed:`, retryError.message);
      }
    }
    
    if (retries < CONSTANTS.MESSAGE.MAX_RETRIES) {
      await new Promise(resolve => 
        setTimeout(resolve, CONSTANTS.MESSAGE.RETRY_DELAY * (retries + 1))
      );
      return safeSendMessage(bot, chatId, text, options, retries + 1);
    }
    
    throw error;
  }
}
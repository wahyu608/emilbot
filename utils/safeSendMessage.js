import { CONSTANTS } from '../constants.js';
import { logError } from './logger.js';

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function safeSendMessage(bot, chatId, text, options = {}, retries = 0) {
  try {
    let finalText = text;

    if (options.parse_mode === "MarkdownV2") {
      finalText = escapeMarkdownV2(text);
    }

    return await bot.sendMessage(chatId, finalText, {
      ...options
    });

  } catch (error) {
    logError(`Failed to send message to ${chatId}:`, error.message);

    if (retries < CONSTANTS.MESSAGE.MAX_RETRIES) {
      await new Promise(resolve =>
        setTimeout(resolve, CONSTANTS.MESSAGE.RETRY_DELAY * (retries + 1))
      );

      return safeSendMessage(bot, chatId, text, options, retries + 1);
    }

    throw error;
  }
}
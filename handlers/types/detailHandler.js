import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

export async function detailHandler(bot, chatId, data) {
  const item = data.data;
  
  if (!item) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.DATA_NOT_FOUND);
  }

  const captionTemplate = data.response || "Berikut adalah profil:";
  const fields = data.fields || [];
  
  const content = fields
    .filter(field => field in item)
    .map(field => `• ${field}: ${item[field]}`)
    .join("\n");

  const caption = `${captionTemplate}\n\n${content}`;

  if (data.photo) {
    try {
      return await bot.sendPhoto(chatId, data.photo, { caption });
    } catch (error) {
      // Fallback to text if photo fails
      return safeSendMessage(bot, chatId, caption);
    }
  }

  return safeSendMessage(bot, chatId, caption);
}
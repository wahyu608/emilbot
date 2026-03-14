import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

export async function textHandler(bot, chatId, commandData) {

  if (!commandData.response && !commandData.photo) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.NO_RESPONSE);
  }

  // jika ada foto
  if (commandData.photo) {
    try {
      return await bot.sendPhoto(chatId, commandData.photo, {
        caption: commandData.response ?? ""
      });
    } catch (error) {
      // fallback jika foto gagal
      return safeSendMessage(bot, chatId, commandData.response);
    }
  }

  // jika hanya text
  return safeSendMessage(bot, chatId, commandData.response);
}
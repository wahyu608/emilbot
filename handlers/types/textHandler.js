import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

export async function textHandler(bot, chatId, commandData) {

  if (!commandData.response && !commandData.photo) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.NO_RESPONSE);
  }

  if (commandData.photo) {
    try {
      return await bot.sendPhoto(chatId, commandData.photo, {
        caption: commandData.response ?? ""
      });
    } catch (error) {
      return safeSendMessage(bot, chatId, commandData.response);
    }
  }

  return safeSendMessage(bot, chatId, commandData.response);
}
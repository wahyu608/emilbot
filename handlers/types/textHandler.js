import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

export async function textHandler(bot, chatId, commandData) {
  if (!commandData.response) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.NO_RESPONSE);
  }

  return safeSendMessage(bot, chatId, commandData.response);
}
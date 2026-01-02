import { safeSendMessage } from "../utils/safeSendMessage.js";
import { CONSTANTS } from "../constants.js";

export async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.GREETING);
}
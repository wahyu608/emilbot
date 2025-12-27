import { safeSendMessage } from "../../utils/safeSendMessage.js";

export async function textHandler(bot, chatId, cmd) {
  if (!cmd.response) {
    return safeSendMessage(bot, chatId, "Perintah ini belum memiliki respons teks.");
  }

  return safeSendMessage(bot, chatId, cmd.response);
}

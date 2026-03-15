import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

export async function detailHandler(bot, chatId, data, msg = {}) {
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

  const keyboard = [];
    if (data.has_back && data.back_command) {
      keyboard.push([
        {
          text: "⬅ Kembali",
          callback_data: `back:${data.back_command}`
        }
      ]);
    }

  const options = keyboard.length
    ? { reply_markup: { inline_keyboard: keyboard } }
    : {};

  // callback → edit message
  if (msg?.isCallback) {

  try {

    if (data.photo) {
      return bot.editMessageMedia(
        {
          type: "photo",
          media: data.photo,
          caption
        },
        {
          chat_id: chatId,
          message_id: msg.message_id,
          ...options
        }
      );
    }

    return bot.editMessageText(caption, {
      chat_id: chatId,
      message_id: msg.message_id,
      ...options
    });

  } catch (err) {

    return bot.sendMessage(chatId, caption, options);

  }

}

  // normal command → kirim pesan baru
  if (data.photo) {
    return bot.sendPhoto(chatId, data.photo, {
      caption,
      ...options
    });
  }

  return bot.sendMessage(chatId, caption, options);
}
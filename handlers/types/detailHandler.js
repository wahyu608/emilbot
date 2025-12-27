import { safeSendMessage } from "../../utils/safeSendMessage.js";

export async function detailHandler(bot, chatId, data) {
  const item = data.data;
  if (!item) {
    return safeSendMessage(bot, chatId, "Data tidak ditemukan");
  }

  const captionTemplate = data.response || "Berikut adalah profil:";
  const fields = data.fields || [];
  const content = fields
    .filter(f => f in item)
    .map(f => `• ${f}: ${item[f]}`)
    .join("\n");

  const caption = `${captionTemplate}\n\n${content}`;
  if (data.photo) {
    return bot.sendPhoto(chatId, data.photo, { caption });
  }

  return safeSendMessage(bot, chatId, caption);
}

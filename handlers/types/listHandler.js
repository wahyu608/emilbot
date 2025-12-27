import { safeSendMessage } from "../../utils/safeSendMessage.js";

export async function listHandler(bot, chatId, data) {
  if (!data.commands?.length) {
    return safeSendMessage(bot, chatId, "Data kosong");
  }

  const batchSize = 10;
  const messages = [];

  for (let i = 0; i < data.commands.length; i += batchSize) {
    const batch = data.commands.slice(i, i + batchSize);
    const message = batch
      .map((c, idx) => `${i + idx + 1}. ${c.description} → ${c.command}`)
      .join("\n");

    messages.push(message);
  }

  await Promise.all(messages.map(m => safeSendMessage(bot, chatId, m)));
}

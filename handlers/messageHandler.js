export function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Halo! Ketik /help untuk melihat daftar perintah 👋");
}

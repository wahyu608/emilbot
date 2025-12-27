export async function safeSendMessage(bot, chatId, text) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (err) {
    if (err.response?.body?.error_code === 429) {
      const retryAfter = err.response.body.parameters.retry_after;
      console.warn(`Rate limit hit, retry after ${retryAfter}s`);
      setTimeout(() => safeSendMessage(bot, chatId, text), (retryAfter + 1) * 1000);
    } else {
      console.error(err);
    }
  }
}

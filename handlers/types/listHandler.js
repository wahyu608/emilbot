import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

function escapeMarkdown(text = "") {
  return text.toString().replace(/([_*\[\]()~`>#+\-=|{}!\\])/g, "\\$1");
}

function titleCase(text = "") {
  return text
    .split(" ")
    .map(word => {
      if (word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export async function listHandler(bot, chatId, data, msg = {}) {

  if (!data?.commands?.length) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.EMPTY_DATA);
  }

  const keyboard = data.commands.map(cmd => [{
    text: titleCase(cmd.name ?? cmd.description ?? ""),
    callback_data: cmd.command.startsWith("/") ? cmd.command : `/${cmd.command}`
  }]);

  const title = data.title
    ? `*${escapeMarkdown(data.title)}*`
    : "Silakan pilih:";

  const options = {
    parse_mode: "MarkdownV2",
    reply_markup: { inline_keyboard: keyboard }
  };

  if (msg?.isCallback) {
    try {
      return await bot.editMessageText(title, {
        chat_id: chatId,
        message_id: msg.message_id,
        ...options
      });
    } catch (err) {
      // fallback jika sebelumnya photo
      return bot.sendMessage(chatId, title, options);
    }
  }

  return bot.sendMessage(chatId, title, options);
}
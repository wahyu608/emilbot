import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

function escapeMarkdown(text) {
  // Escape underscore dan special characters untuk Telegram Markdown
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function listHandler(bot, chatId, data) {
  if (!data.commands?.length) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.EMPTY_DATA);
  }
  // Split commands into batches
  const messages = [];
  const batchSize = CONSTANTS.MESSAGE.BATCH_SIZE;
  
  for (let i = 0; i < data.commands.length; i += batchSize) {
    const batch = data.commands.slice(i, i + batchSize);
    const message = batch
      .map((cmd, idx) => {
        const command = cmd.command.startsWith('/') ? cmd.command : `/${cmd.command}`;
        const escapedCommand = escapeMarkdown(command);
        return `${i + idx + 1}. ${cmd.description} → \`${command}\``;
      })
      .join("\n");

    messages.push(message);
  }

  // rate limit
  for (const message of messages) {
    await safeSendMessage(bot, chatId, message);
  }
}
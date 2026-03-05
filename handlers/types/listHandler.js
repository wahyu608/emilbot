import { safeSendMessage } from "../../utils/safeSendMessage.js";
import { CONSTANTS } from "../../constants.js";

function escapeMarkdown(text = "") {
  return text.toString().replace(/([_*\[\]()~`>#+\-=|{}!\\])/g, "\\$1");
}

function titleCase(text = "") {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function listHandler(bot, chatId, data) {
  if (!data?.commands?.length) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.EMPTY_DATA);
  }

  const messages = [];
  const batchSize = CONSTANTS.MESSAGE.BATCH_SIZE;

  for (let i = 0; i < data.commands.length; i += batchSize) {
    const batch = data.commands.slice(i, i + batchSize);

    const lines = batch.map((cmd, idx) => {
      const command = cmd.command.startsWith("/")
        ? cmd.command
        : `/${cmd.command}`;

      const name = titleCase(cmd.name ?? cmd.description ?? "");
      const escapedName = escapeMarkdown(name);

      return `${i + idx + 1}. ${escapedName} → ${command}`;
    });

    const header =
      i === 0 && data.title
        ? `*${escapeMarkdown(data.title)}*\n\n`
        : "";

    messages.push(header + lines.join("\n"));
  }

  for (const message of messages) {
    await safeSendMessage(bot, chatId, message);
  }
}
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

export async function listHandler(bot, chatId, data) {

  if (!data?.commands?.length) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.EMPTY_DATA);
  }

  const lines = data.commands.map((cmd, idx) => {

    const command = cmd.command.startsWith("/")
      ? cmd.command
      : `/${cmd.command}`;

    const name = titleCase(cmd.name ?? cmd.description ?? "");
    const escapedName = escapeMarkdown(name);

    return `${idx + 1}. ${escapedName}\nDetail: ${command}`;

  });

  const header = data.title
    ? `${escapeMarkdown(data.title)}:\n\n`
    : "";

  const message = header + lines.join("\n");

  return safeSendMessage(bot, chatId, message);
}
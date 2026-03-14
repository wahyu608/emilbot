import { safeSendMessage } from "../utils/safeSendMessage.js";
import { commandService } from "../services/commandService.js";
import { apiService } from "../services/apiService.js";
import { detailHandler } from "./types/detailHandler.js";
import { listHandler } from "./types/listHandler.js";
import { textHandler } from "./types/textHandler.js";
import { logError } from "../utils/logger.js";
import { CONSTANTS } from "../constants.js";

class CommandHandler {
  constructor() {
    this.handlers = {
      list: listHandler,
      detail: detailHandler,
      text: textHandler
    };
  }

parseCommand(text) {

  if (!text) return null;

  const clean = text.trim().replace(/^\/+/, "").toLowerCase();

  const parts = clean.split(/\s+/);

  if (parts.length > 2) {
    return { invalid: true };
  }

  return {
    command: parts[0],
    param: parts[1] || null,
    full: parts.join(" ")
  };
}

  async handleStart(bot, chatId) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.WELCOME);
  }

  async handleHelp(bot, chatId) {

    const commands = commandService.getCachedCommands();

    const commandList = commands
      .map(c => `/${c.command} - ${c.description}`)
      .join("\n");

    return safeSendMessage(bot, chatId, `Daftar Perintah:\n\n${commandList}`);
  }

  async handleApiCommand(bot, chatId, commandText) {

    try {

      const response = await apiService.executeCommand(commandText);

      if (!response.data?.success) {

        if (response.data?.error === "command_not_found") {
          return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_COMMAND);
        }

        return safeSendMessage(bot, chatId, "Terjadi kesalahan pada server.");
      }

      const responseData = response.data.data;

      const handler = this.handlers[responseData.type];

      if (!handler) {
        return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_FORMAT);
      }

      return handler(bot, chatId, responseData);

    } catch (error) {
        logError("API command error:", error.message);

        if (error.message === "SERVER_ERROR") {
          return safeSendMessage(
            bot,
            chatId,
            "Terjadi kesalahan pada server."
          );
        }

        if (error.message === "SERVICE_DOWN") {
          return safeSendMessage(
            bot,
            chatId,
            "Server tidak dapat dihubungi."
          );
        }

        if (error.message === "SERVICE_TIMEOUT") {
          return safeSendMessage(
            bot,
            chatId,
            "Server terlalu lama merespons."
          );
        }

        return safeSendMessage(
          bot,
          chatId,
          "Terjadi error saat memproses perintah"
        );
      }
  }

  async handle(bot, msg) {

    const chatId = msg.chat.id;

    const parsed = this.parseCommand(msg.text);

    if (!parsed) {
      return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_COMMAND);
    }
    const { command, full } = parsed;

      switch (command) {

        case "start":
          return this.handleStart(bot, chatId);

        case "help":
          return this.handleHelp(bot, chatId);

        default:

          const commands = commandService.getCachedCommands();

          const exists = commands.find(c => c.command === command);

          if (!exists) {
            return safeSendMessage(
              bot,
              chatId,
              CONSTANTS.MESSAGES.UNKNOWN_COMMAND
            );
          }

          return this.handleApiCommand(bot, chatId, full);
      }
  }
}

export const commandHandler = new CommandHandler();

export async function initCommands(bot) {

  const commands = await commandService.getCommands();

  await bot.setMyCommands(
    commands.map(c => ({
      command: c.command,
      description: c.description
    }))
  );
}

export async function handleCommand(bot, msg) {
  return commandHandler.handle(bot, msg);
}
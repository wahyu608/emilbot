import { safeSendMessage } from "../utils/safeSendMessage.js";
import { commandService } from "../services/commandService.js";
import { apiService } from "../services/apiService.js";
import { detailHandler } from "./types/detailHandler.js";
import { listHandler } from "./types/listHandler.js";
import { textHandler } from "./types/textHandler.js";
import { logError } from "../utils/logger.js";
import { CONSTANTS } from "../constants.js";
import { validators } from "../utils/validation.js";

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

      const rawCommand = text
        .trim()
        .split(" ")[0]
        .split("@")[0];

      const command = validators.sanitizeCommand(rawCommand);

      if (!validators.isValidCommand(command)) {
        return null;
      }

      return command;
    }

  async handleStart(bot, chatId) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.WELCOME);
  }

  async handleHelp(bot, chatId) {
    const commands = commandService.getCachedCommands();

    const commandList = commands
      .map(c => `/${c.command} - ${c.description}`)
      .join("\n");

    safeSendMessage(bot, chatId, `Daftar Perintah:\n\n${commandList}`);
  }

  async handleApiCommand(bot, chatId, commandText) {
    try {
      const response = await apiService.executeCommand(commandText);

      if (!response.data?.success) {
        if (response.data?.error === "command_not_found") {
          return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_COMMAND);
        }
        return safeSendMessage(bot, chatId, "Terjadi kesalahan pada server, silakan coba lagi nanti.");
      }

      const responseData = response.data;
      console.log("API response data:", responseData);
      const handler = this.handlers[responseData.type];

      if (!handler) {
        return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_FORMAT);
      }

      return await handler(bot, chatId, responseData);
    } catch (error) {
        logError("API command error:", error.message);

        const status = error.response?.status;

        // timeout / server lambat
        if (
          error.code === "ETIMEDOUT" ||
          error.code === "ECONNABORTED" ||
          status === 504
        ) {
          return safeSendMessage(
            bot,
            chatId,
            "Server sedang lambat merespons. Silakan coba beberapa saat lagi."
          );
        }

        // server error
        if (status && status >= 500) {
          return safeSendMessage(
            bot,
            chatId,
            "Layanan sedang tidak tersedia. Silakan coba lagi nanti."
          );
        }

        // network error
        if (
          error.code === "ECONNREFUSED" ||
          error.code === "ENOTFOUND"
        ) {
          return safeSendMessage(
            bot,
            chatId,
            "Tidak dapat terhubung ke server layanan."
          );
        }

        return safeSendMessage(
          bot,
          chatId,
          CONSTANTS.MESSAGES.ERROR_PROCESSING
        );
      } 
  }

  async handle(bot, msg) {
    const chatId = msg.chat.id;
    const commandText = this.parseCommand(msg.text);

    try {
      switch (commandText) {
        case 'start':
          return await this.handleStart(bot, chatId);
        
        case 'help':
          return await this.handleHelp(bot, chatId);
        
        default:
          return await this.handleApiCommand(bot, chatId, commandText);
      }
    } catch (error) {
      logError("Command handler error:", error.message);
      return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.ERROR_PROCESSING);
    }
  }
}

export const commandHandler = new CommandHandler();

  export async function initCommands(bot) {
    try {

      const commands = await commandService.getCommands();

      await bot.setMyCommands(
        commands.map(c => ({
          command: c.command,
          description: c.description
        }))
      );

      logInfo("Bot commands berhasil dimuat.");

    } catch (error) {

      logError("Gagal memuat commands saat startup:", error.message);

      if (error.message === "SERVICE_DOWN") {
        logError("API tidak dapat diakses saat startup.");
      }

      if (error.message === "SERVICE_TIMEOUT") {
        logError("API terlalu lambat merespons saat startup.");
      }

    }
  }

export async function handleCommand(bot, msg) {
  return commandHandler.handle(bot, msg);
}
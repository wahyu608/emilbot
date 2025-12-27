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
    if (!text) return '';
    
    return text
      .trim()
      .split(" ")[0]      
      .split("@")[0]      
      .replace(/^\//, "") 
      .toLowerCase();     
  }

  async handleStart(bot, chatId) {
    return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.WELCOME);
  }

  async handleHelp(bot, chatId) {
    const commands = commandService.getCachedCommands();
    const commandList = commands
      .map(c => `/${c.command} - ${c.description}`)
      .join("\n");

    return safeSendMessage(bot, chatId, `*Daftar Perintah:*\n\n${commandList}`);
  }

  async handleApiCommand(bot, chatId, commandText) {
    try {
      const response = await apiService.executeCommand(commandText);

      if (response.status === 404 || !response.data) {
        return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_COMMAND);
      }

      const responseData = response.data;
      const handler = this.handlers[responseData.type];

      if (!handler) {
        return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.UNKNOWN_FORMAT);
      }

      return await handler(bot, chatId, responseData);
    } catch (error) {
      logError("API command error:", error.message);
      return safeSendMessage(bot, chatId, CONSTANTS.MESSAGES.ERROR_PROCESSING);
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
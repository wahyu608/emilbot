import axios from "axios";
import { config } from "../config.js";
import { logInfo, logError } from "../utils/logger.js";
import { validators, ValidationError } from "../utils/validation.js";
import { CONSTANTS } from "../constants.js";

class CommandService {
  constructor() {
    this.cachedCommands = [];
    this.lastFetch = null;
  }

  async fetchCommands() {
    try {
      const response = await axios.get(`${config.apiUrl}/command`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        timeout: CONSTANTS.API.TIMEOUT
      });

      if (!validators.isValidArray(response.data)) {
        throw new ValidationError("Response dari API tidak valid (bukan array).");
      }

      return response.data;
    } catch (error) {
      logError("Failed to fetch commands from API:", error.message);
      throw error;
    }
  }

  sanitizeCommands(commands) {
    return commands
      .filter(c => 
        validators.isValidCommand(c.command) && 
        validators.isValidDescription(c.description)
      )
      .map(c => ({
        command: validators.sanitizeCommand(c.command),
        description: validators.truncateText(
          c.description, 
          CONSTANTS.API.MAX_DESCRIPTION_LENGTH
        ),
        target_table: c.target_table,
        target_column: c.target_column
      }))
      .slice(0, CONSTANTS.API.MAX_COMMANDS);
  }

  async getCommands(forceRefresh = false) {
    const cacheAge = this.lastFetch ? Date.now() - this.lastFetch : Infinity;
    const cacheExpired = cacheAge > 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && this.cachedCommands.length > 0 && !cacheExpired) {
      return this.cachedCommands;
    }

    try {
      const rawCommands = await this.fetchCommands();
      this.cachedCommands = this.sanitizeCommands(rawCommands);
      this.lastFetch = Date.now();
      
      logInfo(`Commands refreshed from API (${this.cachedCommands.length} commands)`);
      return this.cachedCommands;
    } catch (error) {
      logError("Failed to get commands:", error.message);
      
      // Return cached if available
      if (this.cachedCommands.length > 0) {
        logInfo("Returning cached commands due to fetch failure");
        return this.cachedCommands;
      }
      
      throw new Error("Tidak dapat memuat commands dari API.");
    }
  }

  getCachedCommands() {
    return this.cachedCommands;
  }
}

export const commandService = new CommandService();
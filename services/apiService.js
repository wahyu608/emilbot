import axios from "axios";
import { config } from "../config.js";
import { logError, logDebug } from "../utils/logger.js";
import { CONSTANTS } from "../constants.js";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: CONSTANTS.API.TIMEOUT,
      headers: {
        Authorization: `Bearer ${config.apiKey}`
      }
    });
  }

  async executeCommand(commandText) {
    try {
      const response = await this.client.get(`/${commandText}`, {
        validateStatus: status => status < 500
      });

      logDebug(`API response for ${commandText}:`, response.data);
      return response;
    } catch (error) {
      logError(`API request failed for ${commandText}:`, error.message);
      throw error;
    }
  }
}

export const apiService = new ApiService();
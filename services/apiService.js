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

      // jangan throw error di sini
      return response;

    } catch (error) {

      logError(`API request failed for ${commandText}:`, error.message);

      if (error.response && error.response.status >= 500) {
        throw new Error("SERVER_ERROR");
      }

      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND"
      ) {
        throw new Error("SERVICE_DOWN");
      }

      if (
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNABORTED"
      ) {
        throw new Error("SERVICE_TIMEOUT");
      }

      throw error;
    }
  }
}

export const apiService = new ApiService();
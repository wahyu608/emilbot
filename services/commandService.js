// services/commandService.js
import axios from "axios";
import { config } from "../config.js";
import { logInfo, logError } from "../utils/logger.js";

const MAX_COMMANDS = 100; 

export async function getCommands() {
  try {
    const res = await axios.get(`${config.apiUrl}/command`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });

    if (!res.data || !Array.isArray(res.data)) {
      throw new Error("Response dari API tidak valid (bukan array).");
    }
    console.log(res.data);

    // sanitasi data 
    const cleanData = res.data
      .filter(c => typeof c.command === "string" && typeof c.description === "string")
      .map(c => ({
        command: c.command.replace(/[^\w\d_-]/g, ""), 
        description: c.description.slice(0, 256),
        target_table: c.target_table,
        target_column: c.target_column
      }))
      .slice(0, MAX_COMMANDS);

    logInfo(`Commands refreshed from API (${cleanData.length} commands)`);
    return cleanData;

  } catch (err) {
    logError("Gagal mengambil commands:", err.message);
    throw new Error("Tidak dapat memuat commands dari API.");
  }
}

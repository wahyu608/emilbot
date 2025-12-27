import axios from "axios";
import { config } from "../config.js";
import { safeSendMessage } from "../utils/safeSendMessage.js";
import { getCommands } from "../services/commandService.js";
import { detailHandler } from "./types/detailHandler.js";
import { listHandler } from "./types/listHandler.js";
import { textHandler } from "./types/textHandler.js";

let cachedCommands = [];

export async function initCommands(bot) {
  cachedCommands = await getCommands();

  await bot.setMyCommands(
    cachedCommands.map(c => ({
      command: c.command,
      description: c.description
    }))
  );
}

export async function handleCommand(bot, msg) {
  const chatId = msg.chat.id;
  const rawText = msg.text || "";

  const text = rawText
    .trim()
    .toLowerCase()
    .split(" ")[0]
    .split("@")[0]
    .replace("/", "");

  try {
    // Built-in Telegram only
    if (text === "start") {
      return safeSendMessage(
        bot,
        chatId,
        "Selamat datang! Ketik /help untuk daftar perintah."
      );
    }

    if (text === "help") {
      const response = cachedCommands
        .map(c => `/${c.command} - ${c.description}`)
        .join("\n");

      return safeSendMessage(bot, chatId, `*Daftar Perintah:*\n${response}`);
    }

    const res = await axios.get(`${config.apiUrl}/${text}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      timeout: 8000,
      validateStatus: status => status < 500
    });

    console.log(res.data);

    if (res.status === 404 || !res.data) {
      return safeSendMessage(bot, chatId, "Perintah tidak dikenal");
    }

    const responseData = res.data;

    switch (responseData.type) {
      case "list":
        return listHandler(bot, chatId, responseData);

      case "detail":
        return detailHandler(bot, chatId, responseData);

      case "text":
        return textHandler(bot, chatId, responseData);

      default:
        return safeSendMessage(bot, chatId, "Format respons tidak dikenali");
    }

  } catch (err) {
    console.error("handleCommand error:", err.message);
    return safeSendMessage(bot, chatId, "Terjadi error saat memproses perintah");
  }
}

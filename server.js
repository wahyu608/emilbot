import TelegramBot from "node-telegram-bot-api";
import express from "express";
import bodyParser from "body-parser";
import { config } from "./config.js";
import { initCommands, handleCommand } from "./handlers/commandHandler.js";
import { handleMessage } from "./handlers/messageHandler.js";
import { logInfo } from "./utils/logger.js";
import syncRoutes from "./routes/syncRoutes.js";


// import routes modular

const app = express();
app.use(bodyParser.json());

// Inisialisasi bot
const bot = new TelegramBot(config.botToken);
bot.setWebHook(`${config.webhookUrl}/webhook`);

await initCommands(bot);


await bot.setChatMenuButton({
  menu_button: {
    type: "commands"
  }
});

// Webhook utama Telegram
app.post("/webhook", async (req, res) => {
  const update = req.body;
  if (update.message) {
    const msg = update.message;
    if (msg.text?.startsWith("/")) {
      await handleCommand(bot, msg);
    } else {
      handleMessage(bot, msg);
    }
  }
  res.sendStatus(200);
});

// Tambahkan route sinkronisasi
app.use("/", syncRoutes(bot));

app.listen(config.port, () => {
  logInfo(`Bot server running on port ${config.port}`);
});

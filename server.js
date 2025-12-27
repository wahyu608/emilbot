import TelegramBot from "node-telegram-bot-api";
import express from "express";
import bodyParser from "body-parser";
import { config } from "./config.js";
import { initCommands, handleCommand } from "./handlers/commandHandler.js";
import { handleMessage } from "./handlers/messageHandler.js";
import { logInfo, logError, logWarn } from "./utils/logger.js";
import { rateLimiter } from "./services/rateLimiter.js";
import { CONSTANTS } from "./constants.js";
import syncRoutes from "./routes/syncRoutes.js";

class TelegramBotServer {
  constructor() {
    this.app = express();
    this.bot = null;
    this.alreadyWarned = new Map(); 
    this.webhookRequestCount = new Map();
  }

  setupMiddleware() {
    this.app.use(bodyParser.json());
    
    // Request rate limiting per chatId
    this.webhookRequestCount = new Map();
    this.app.use((req, res, next) => {
      if (req.path === '/webhook' && req.body?.message) {
        const chatId = req.body.message.chat.id;
        const now = Date.now();
        const lastRequest = this.webhookRequestCount.get(chatId) || { time: 0, count: 0 };
        
        // Reset count jika sudah lewat 1 detik
        if (now - lastRequest.time > 1000) {
          this.webhookRequestCount.set(chatId, { time: now, count: 1 });
          return next();
        }
        
        // Increment count
        lastRequest.count++;
        this.webhookRequestCount.set(chatId, lastRequest);
        
        // Jika lebih dari 10 request per detik, langsung tolak
        if (lastRequest.count > 10) {
          logWarn(`Extreme spam detected from ${chatId}: ${lastRequest.count} req/sec`);
          return res.sendStatus(429); // Too Many Requests
        }
      }
      next();
    });
    
    // Error handling middleware
    this.app.use((err, req, res, next) => {
      logError("Express middleware error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  }

  async initializeBot() {
    try {
      this.bot = new TelegramBot(config.botToken);
      await this.bot.setWebHook(`${config.webhookUrl}/webhook`);
      await initCommands(this.bot);
      await this.setupMenuButton();
      
      logInfo("Bot initialized successfully");
    } catch (error) {
      logError("Failed to initialize bot:", error);
      throw error;
    }
  }

  async setupMenuButton() {
    try {
      await this.bot.setChatMenuButton({
        menu_button: { type: "commands" }
      });
    } catch (error) {
      logError("Failed to set chat menu button:", error);
    }
  }

  setupRoutes() {
    this.app.post("/webhook", this.handleWebhook.bind(this));
    this.app.use("/", syncRoutes(this.bot));
  }

  async handleWebhook(req, res) {
    try {
      const update = req.body;
      
      if (!update.message) {
        return res.sendStatus(200);
      }

      const msg = update.message;
      const chatId = msg.chat.id;

      // Rate limiting - Block check
      if (rateLimiter.isBlocked(chatId)) {
        // Kirim warning sekali saja
        if (!this.alreadyWarned.has(chatId)) {
          const timeLeft = rateLimiter.getBlockTimeLeft(chatId);
          
          const warningMsg = await this.bot.sendMessage(
            chatId, 
            `⛔ *BLOCKED*\n\nKamu di-block karena spam.\nBot tidak akan merespon hingga *${timeLeft} detik* lagi.`,
            { parse_mode: 'Markdown' }
          );
          
          this.alreadyWarned.set(chatId, warningMsg.message_id);
          
          // Auto-delete warning message dan clear map setelah block habis
          setTimeout(async () => {
            try {
              await this.bot.deleteMessage(chatId, warningMsg.message_id);
            } catch (error) {
              logError(`Failed to delete warning message for ${chatId}:`, error.message);
            }
            this.alreadyWarned.delete(chatId);
          }, CONSTANTS.RATE_LIMIT.BLOCK_TIME);
        }
        
        // Ignore semua message selanjutnya
        return res.sendStatus(200);
      }

      // Rate limiting - Spam check
      if (!rateLimiter.canProcess(chatId)) {
        await this.bot.sendMessage(chatId, rateLimiter.getSpamWarning(chatId));
        return res.sendStatus(200);
      }

      // Process message
      if (this.isCommand(msg.text)) {
        await handleCommand(this.bot, msg);
      } else {
        await handleMessage(this.bot, msg);
      }

      res.sendStatus(200);
    } catch (error) {
      logError("Webhook error:", error);
      res.sendStatus(500);
    }
  }

  isCommand(text) {
    return text?.startsWith("/");
  }

  start() {
    this.app.listen(config.port, () => {
      logInfo(`Bot server running on port ${config.port}`);
      logInfo(`Webhook URL: ${config.webhookUrl}/webhook`);
    });
  }

  async initialize() {
    try {
      this.setupMiddleware();
      await this.initializeBot();
      this.setupRoutes();
      this.start();
    } catch (error) {
      logError("Failed to start bot server:", error);
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logInfo('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Bootstrap application
const server = new TelegramBotServer();
server.initialize();
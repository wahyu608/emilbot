import express from "express";
import { initCommands } from "../handlers/commandHandler.js";
import { commandService } from "../services/commandService.js";
import { rateLimiter } from "../services/rateLimiter.js";
import { logInfo, logError } from "../utils/logger.js";

const router = express.Router();

export default function syncRoutes(bot) {
  router.post("/sync-commands", async (req, res) => {
    try {
      await commandService.getCommands(true);
      await initCommands(bot);
      
      await bot.setChatMenuButton({
        menu_button: { type: "commands" }
      });
      
      logInfo("Bot commands berhasil di sinkron!");
      
      res.status(200).json({ 
        success: true, 
        message: "Commands berhasil disinkronisasi",
        count: commandService.getCachedCommands().length
      });
    } catch (error) {
      logError("gagal untuk sinkronisasi command", error.message);
      res.status(500).json({ 
        success: false, 
        message: "Gagal untuk sinkronisasi command",
        error: error.message
      });
    }
  });

  router.get("/health", (req, res) => {
    const stats = rateLimiter.getStats();
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      rateLimiter: stats,
      commandsLoaded: commandService.getCachedCommands().length
    });
  });
    router.get("/metrics", (req, res) => {
    const stats = rateLimiter.getStats();
    const memUsage = process.memoryUsage();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
      },
      rateLimiter: stats,
      commands: {
        loaded: commandService.getCachedCommands().length,
        lastFetch: commandService.lastFetch 
          ? new Date(commandService.lastFetch).toISOString() 
          : null
      },
      nodeVersion: process.version,
      platform: process.platform,
    });
  });

  router.get("/stats/blocked-users", (req, res) => {
  const blockedList = [];
  
  for (const user of rateLimiter.getBlockedUsers()) {
    if (user.timeLeft > 0) {
      blockedList.push({
        chatId: user.chatId,
        timeLeft: `${user.timeLeft}s`,
        unblockAt: new Date(user.unblockTime).toISOString()
      });
    }
  }
  
  res.status(200).json({
    total: blockedList.length,
    users: blockedList
  });
});
  return router;
}
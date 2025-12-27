import express from "express";
import { initCommands } from "../handlers/commandHandler.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

export default function syncRoutes (bot)  {
  router.post("/sync-commands", async (req, res) => {
    try {
      await initCommands(bot);
      await bot.setChatMenuButton({
        menu_button: {
          type: "commands"
        }
      });
      logInfo("Bot commands successfully synchronized!");
      res.status(200).json({ success: true, message: "Commands synchronized successfully" });
    } catch (error) {
      console.error("Failed to sync commands:", error);
      res.status(500).json({ success: false, message: "Failed to synchronize commands" });
    }
  });

  return router;
};

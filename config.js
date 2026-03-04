import dotenv from "dotenv";

dotenv.config();

function requiredEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`[CONFIG ERROR] Environment variable ${name} is not defined`);
  }

  return value;
}

export const config = {
  botToken: requiredEnv("BOT_TOKEN"),
  webhookUrl: requiredEnv("WEBHOOK_URL"),
  apiUrl: process.env.API_URL || "https://admin-bot-topaz.vercel.app/api/api",
  apiKey: requiredEnv("API_KEY"),
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
};
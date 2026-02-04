function requiredEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`[CONFIG ERROR] Environment variable ${name} is not defined`);
  }

  return value;
}

export default {
  botToken: requiredEnv("BOT_TOKEN"),
  webhookUrl: requiredEnv("WEBHOOK_URL"),
  apiUrl: requiredEnv("API_URL"),
  apiKey: requiredEnv("API_KEY"),
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
};

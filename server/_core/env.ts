export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3000/api/auth/google/callback",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // AI API Keys
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  // Legacy Forge API (deprecated, kept for other services)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

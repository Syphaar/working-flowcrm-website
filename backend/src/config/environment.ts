export const environment = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnvironment: process.env.NODE_ENV || "development",

  jwtSecret: process.env.JWT_SECRET || "flowcrm-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:4173"],

  mailHost: process.env.MAIL_HOST || "smtp.ethereal.email",
  mailPort: parseInt(process.env.MAIL_PORT || "587", 10),
  mailSecure: process.env.MAIL_SECURE === "true",
  mailUser: process.env.MAIL_USER || "",
  mailPassword: process.env.MAIL_PASSWORD || "",
  mailFrom: process.env.MAIL_FROM || "noreply@flowcrm.com",

  uploadDirectory: process.env.UPLOAD_DIR || "uploads",

  rateLimitWindowMs: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10,
  ),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10,
  ),
};

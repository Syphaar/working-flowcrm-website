import { environment } from "./environment.js";

const productionOrigins = [
  "https://flowcrm-website.vercel.app",
  "https://flowcrm-website.vercel.app/",
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || environment.nodeEnvironment !== "production") {
      callback(null, true);
      return;
    }
    const allowed = [...environment.corsOrigins, ...productionOrigins];
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

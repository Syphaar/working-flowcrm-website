import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { loadDatabase } from "./config/database.js";
import { authenticateUser } from "./middleware/authenticateUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import roleRoutes from "./routes/roles.routes.js";
import permissionRoutes from "./routes/permissions.routes.js";
import leadRoutes from "./routes/leads.routes.js";
import contactRoutes from "./routes/contacts.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import customerRoutes from "./routes/customers.routes.js";
import dealRoutes from "./routes/deals.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import activityRoutes from "./routes/activities.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import noteRoutes from "./routes/notes.routes.js";
import fileRoutes from "./routes/files.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import pipelineRoutes from "./routes/pipelines.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

export function createApp() {
  loadDatabase();

  const application = express();

  application.use(cors(corsOptions));
  application.use(express.json());
  application.use(express.urlencoded({ extended: true }));
  application.use(rateLimiter);

  application.get("/api/health", (_request, response) => {
    response.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  application.use("/api/auth", authRoutes);

  application.use("/api/users", authenticateUser, userRoutes);
  application.use("/api/roles", authenticateUser, roleRoutes);
  application.use("/api/permissions", authenticateUser, permissionRoutes);
  application.use("/api/leads", authenticateUser, leadRoutes);
  application.use("/api/contacts", authenticateUser, contactRoutes);
  application.use("/api/companies", authenticateUser, companyRoutes);
  application.use("/api/customers", authenticateUser, customerRoutes);
  application.use("/api/deals", authenticateUser, dealRoutes);
  application.use("/api/tasks", authenticateUser, taskRoutes);
  application.use("/api/events", authenticateUser, calendarRoutes);
  application.use("/api/activities", authenticateUser, activityRoutes);
  application.use("/api/notifications", authenticateUser, notificationRoutes);
  application.use("/api/communications", authenticateUser, messageRoutes);
  application.use("/api/notes", authenticateUser, noteRoutes);
  application.use("/api/attachments", authenticateUser, fileRoutes);
  application.use("/api/reports", authenticateUser, reportRoutes);
  application.use("/api/settings", authenticateUser, settingsRoutes);
  application.use("/api/dashboard", authenticateUser, dashboardRoutes);
  application.use("/api/pipelines", authenticateUser, pipelineRoutes);

  application.use(notFoundHandler);
  application.use(errorHandler);

  return application;
}

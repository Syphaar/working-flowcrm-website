import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";

const router = Router();

router.get("/", notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.post("/", authorizePermission("send_notifications"), notificationController.createNotification);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);
router.post("/bulk-delete", notificationController.bulkDeleteNotifications);

export default router;

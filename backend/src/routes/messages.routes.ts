import { Router } from "express";
import * as messageController from "../controllers/message.controller.js";

const router = Router();

router.get("/", messageController.getAllMessages);
router.get("/:id", messageController.getMessageById);
router.post("/", messageController.createMessage);
router.put("/:id", messageController.updateMessage);
router.delete("/:id", messageController.deleteMessage);
router.post("/bulk-delete", messageController.bulkDeleteMessages);

export default router;

import { Router } from "express";
import * as fileController from "../controllers/file.controller.js";
import { uploadSingleFile } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", fileController.getAttachments);
router.get("/:id", fileController.getAttachmentById);
router.post("/", fileController.createAttachment);
router.post("/upload", uploadSingleFile, fileController.uploadAttachment);
router.put("/:id", fileController.updateAttachment);
router.delete("/:id", fileController.deleteAttachment);
router.post("/bulk-delete", fileController.bulkDeleteAttachments);

export default router;

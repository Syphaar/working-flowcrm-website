import { Router } from "express";
import * as fileController from "../controllers/file.controller.js";
import { uploadSingleFile } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", fileController.getAttachments);
router.post("/upload", uploadSingleFile, fileController.uploadAttachment);
router.delete("/:id", fileController.deleteAttachment);

export default router;

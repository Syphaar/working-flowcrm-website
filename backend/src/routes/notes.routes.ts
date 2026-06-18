import { Router } from "express";
import * as noteController from "../controllers/note.controller.js";

const router = Router();

router.get("/", noteController.getNotes);
router.get("/:id", noteController.getNoteById);
router.post("/", noteController.createNote);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);
router.post("/bulk-delete", noteController.bulkDeleteNotes);

export default router;

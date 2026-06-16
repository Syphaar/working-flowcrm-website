import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../validations/task.validation.js";

const router = Router();

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", validateCreateTask, taskController.createTask);
router.put("/:id", validateUpdateTask, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.post("/bulk-delete", taskController.bulkDeleteTasks);

export default router;

import { Router } from "express";
import * as activityController from "../controllers/activity.controller.js";

const router = Router();

router.get("/", activityController.getAllActivities);
router.get("/:id", activityController.getActivityById);
router.post("/", activityController.createActivity);
router.put("/:id", activityController.updateActivity);
router.delete("/:id", activityController.deleteActivity);
router.post("/bulk-delete", activityController.bulkDeleteActivities);

export default router;

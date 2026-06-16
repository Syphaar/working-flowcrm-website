import { Router } from "express";
import * as calendarController from "../controllers/calendar.controller.js";
import {
  validateCreateEvent,
  validateUpdateEvent,
} from "../validations/calendar.validation.js";

const router = Router();

router.get("/", calendarController.getAllEvents);
router.get("/:id", calendarController.getEventById);
router.post("/", validateCreateEvent, calendarController.createEvent);
router.put("/:id", validateUpdateEvent, calendarController.updateEvent);
router.delete("/:id", calendarController.deleteEvent);
router.post("/bulk-delete", calendarController.bulkDeleteEvents);

export default router;

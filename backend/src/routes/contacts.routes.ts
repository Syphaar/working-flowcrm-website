import { Router } from "express";
import * as contactController from "../controllers/contact.controller.js";
import {
  validateCreateContact,
  validateUpdateContact,
} from "../validations/contact.validation.js";

const router = Router();

router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.post("/", validateCreateContact, contactController.createContact);
router.put("/:id", validateUpdateContact, contactController.updateContact);
router.delete("/:id", contactController.deleteContact);
router.post("/bulk-delete", contactController.bulkDeleteContacts);

export default router;

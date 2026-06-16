import { Router } from "express";
import * as leadController from "../controllers/lead.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  validateCreateLead,
  validateUpdateLead,
} from "../validations/lead.validation.js";

const router = Router();

router.get("/", authorizePermission("view_leads"), leadController.getAllLeads);
router.get("/:id", authorizePermission("view_leads"), leadController.getLeadById);
router.post("/", authorizePermission("edit_leads"), validateCreateLead, leadController.createLead);
router.put("/:id", authorizePermission("edit_leads"), validateUpdateLead, leadController.updateLead);
router.delete("/:id", authorizePermission("delete_leads"), leadController.deleteLead);
router.post("/bulk-delete", authorizePermission("delete_leads"), leadController.bulkDeleteLeads);

export default router;

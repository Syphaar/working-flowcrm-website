import { Router } from "express";
import * as dealController from "../controllers/deal.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  validateCreateDeal,
  validateUpdateDeal,
} from "../validations/deal.validation.js";

const router = Router();

router.get("/", authorizePermission("manage_deals"), dealController.getAllDeals);
router.get("/:id", authorizePermission("manage_deals"), dealController.getDealById);
router.post("/", authorizePermission("manage_deals"), validateCreateDeal, dealController.createDeal);
router.put("/:id", authorizePermission("manage_deals"), validateUpdateDeal, dealController.updateDeal);
router.delete("/:id", authorizePermission("manage_deals"), dealController.deleteDeal);
router.post("/bulk-delete", authorizePermission("manage_deals"), dealController.bulkDeleteDeals);

export default router;

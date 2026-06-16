import { Router } from "express";
import * as customerController from "../controllers/customer.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  validateCreateCustomer,
  validateUpdateCustomer,
} from "../validations/customer.validation.js";

const router = Router();

router.get("/", authorizePermission("manage_customers"), customerController.getAllCustomers);
router.get("/:id", authorizePermission("manage_customers"), customerController.getCustomerById);
router.post("/", authorizePermission("manage_customers"), validateCreateCustomer, customerController.createCustomer);
router.put("/:id", authorizePermission("manage_customers"), validateUpdateCustomer, customerController.updateCustomer);
router.delete("/:id", authorizePermission("manage_customers"), customerController.deleteCustomer);
router.post("/bulk-delete", authorizePermission("manage_customers"), customerController.bulkDeleteCustomers);

export default router;

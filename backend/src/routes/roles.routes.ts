import { Router } from "express";
import * as roleController from "../controllers/role.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";

const router = Router();

router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.post("/", authorizePermission("manage_roles"), roleController.createRole);
router.put("/:id", authorizePermission("manage_roles"), roleController.updateRole);
router.delete("/:id", authorizePermission("manage_roles"), roleController.deleteRole);
router.post("/bulk-delete", authorizePermission("manage_roles"), roleController.bulkDeleteRoles);

export default router;

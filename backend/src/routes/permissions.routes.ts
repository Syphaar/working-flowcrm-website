import { Router } from "express";
import * as permissionController from "../controllers/permission.controller.js";

const router = Router();

router.get("/", permissionController.getAllPermissions);
router.get("/:id", permissionController.getPermissionById);

export default router;

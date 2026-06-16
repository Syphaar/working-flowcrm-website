import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../validations/user.validation.js";

const router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", authorizePermission("manage_users"), validateCreateUser, userController.createUser);
router.put("/:id", authorizePermission("manage_users"), validateUpdateUser, userController.updateUser);
router.delete("/:id", authorizePermission("manage_users"), userController.deleteUser);
router.post("/bulk-delete", authorizePermission("manage_users"), userController.bulkDeleteUsers);

export default router;

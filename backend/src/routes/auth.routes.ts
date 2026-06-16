import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/authenticateUser.js";
import {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/login", validateLogin, authController.login);
router.post("/2fa/verify", authController.verifyTwoFactor);
router.post("/2fa/setup", authenticateUser, authController.generate2FA);
router.post("/2fa/enable", authenticateUser, authController.enable2FA);
router.post("/2fa/disable", authenticateUser, authController.disable2FA);
router.post("/register", validateRegister, authController.register);
router.post("/forgot", validateForgotPassword, authController.forgotPassword);
router.post("/reset", validateResetPassword, authController.resetPassword);
router.post("/logout", authenticateUser, authController.logout);
router.get("/me", authenticateUser, authController.getCurrentUser);

export default router;

import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import { authorizePermission } from "../middleware/authorizePermission.js";

const router = Router();

router.get("/revenue", authorizePermission("view_revenue"), reportController.getRevenueReport);
router.get("/pipeline", authorizePermission("manage_reports"), reportController.getPipelineReport);
router.get("/leads", authorizePermission("manage_reports"), reportController.getLeadReport);
router.get("/team", authorizePermission("manage_reports"), reportController.getTeamReport);

export default router;

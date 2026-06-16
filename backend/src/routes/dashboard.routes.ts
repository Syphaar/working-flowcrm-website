import { Router } from "express";
import * as dashboardService from "../services/dashboard.service.js";

const router = Router();

router.get("/", (request, response) => {
  const user = request.user!;
  const isAdmin = user.role === "super_admin";
  const data = dashboardService.getDashboardData(user.userId, isAdmin);
  response.json(data);
});

export default router;

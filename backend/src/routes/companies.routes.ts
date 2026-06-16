import { Router } from "express";
import * as companyController from "../controllers/company.controller.js";
import {
  validateCreateCompany,
  validateUpdateCompany,
} from "../validations/company.validation.js";

const router = Router();

router.get("/", companyController.getAllCompanies);
router.get("/:id", companyController.getCompanyById);
router.post("/", validateCreateCompany, companyController.createCompany);
router.put("/:id", validateUpdateCompany, companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);
router.post("/bulk-delete", companyController.bulkDeleteCompanies);

export default router;

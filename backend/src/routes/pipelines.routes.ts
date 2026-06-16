import { Router } from "express";
import * as pipelineController from "../controllers/pipeline.controller.js";

const router = Router();

router.get("/", pipelineController.getAllPipelines);
router.get("/:id", pipelineController.getPipelineById);
router.post("/", pipelineController.createPipeline);
router.put("/:id", pipelineController.updatePipeline);
router.delete("/:id", pipelineController.deletePipeline);
router.post("/bulk-delete", pipelineController.bulkDeletePipelines);

export default router;

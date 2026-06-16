import type { Request, Response } from "express";
import * as pipelineService from "../services/pipeline.service.js";

export function getAllPipelines(_request: Request, response: Response) {
  response.json(pipelineService.getAllPipelines());
}

export function getPipelineById(request: Request, response: Response) {
  const pipeline = pipelineService.getPipelineById(request.params.id as string);
  if (!pipeline) {
    response.status(404).json({ error: "Pipeline not found" });
    return;
  }
  response.json(pipeline);
}

export function createPipeline(request: Request, response: Response) {
  const pipeline = pipelineService.createPipeline(request.body);
  response.status(201).json(pipeline);
}

export function updatePipeline(request: Request, response: Response) {
  const pipeline = pipelineService.updatePipeline(request.params.id as string, request.body);
  if (!pipeline) {
    response.status(404).json({ error: "Pipeline not found" });
    return;
  }
  response.json(pipeline);
}

export function deletePipeline(request: Request, response: Response) {
  pipelineService.deletePipeline(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeletePipelines(request: Request, response: Response) {
  pipelineService.bulkDeletePipelines(request.body.ids || []);
  response.json({ ok: true });
}

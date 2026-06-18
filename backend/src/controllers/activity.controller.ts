import type { Request, Response } from "express";
import * as activityService from "../services/activity.service.js";

export function getAllActivities(_request: Request, response: Response) {
  const activities = activityService.getAllActivities();
  response.json(activities);
}

export function getActivityById(request: Request, response: Response) {
  const activity = activityService.getActivityById(request.params.id as string);
  if (!activity) {
    response.status(404).json({ error: "Activity not found" });
    return;
  }
  response.json(activity);
}

export function createActivity(request: Request, response: Response) {
  const activity = activityService.createActivity(
    request.body,
    request.user!
  );
  response.status(201).json(activity);
}

export function updateActivity(request: Request, response: Response) {
  const activity = activityService.updateActivity(
    request.params.id as string,
    request.body
  );
  if (!activity) {
    response.status(404).json({ error: "Activity not found" });
    return;
  }
  response.json(activity);
}

export function deleteActivity(request: Request, response: Response) {
  activityService.deleteActivity(request.params.id as string);
  response.json({ ok: true });
}

export function bulkDeleteActivities(request: Request, response: Response) {
  activityService.bulkDeleteActivities(request.body.ids || []);
  response.json({ ok: true });
}

import type { Request, Response, NextFunction } from "express";

export function validateCreateEvent(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { title, startsAt, endsAt } = request.body;

  if (!title) {
    response.status(400).json({ error: "Event title is required" });
    return;
  }

  if (!startsAt) {
    response.status(400).json({ error: "Start date/time is required" });
    return;
  }

  if (!endsAt) {
    response.status(400).json({ error: "End date/time is required" });
    return;
  }

  if (new Date(startsAt) >= new Date(endsAt)) {
    response
      .status(400)
      .json({ error: "End date/time must be after start date/time" });
    return;
  }

  next();
}

export function validateUpdateEvent(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const { startsAt, endsAt } = request.body;

  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    response
      .status(400)
      .json({ error: "End date/time must be after start date/time" });
    return;
  }

  next();
}

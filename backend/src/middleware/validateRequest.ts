import type { Request, Response, NextFunction } from "express";

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
};

export function validateRequest(rules: ValidationRule[]) {
  return (
    request: Request,
    response: Response,
    next: NextFunction
  ): void => {
    const errors: string[] = [];
    const body = request.body;

    for (const rule of rules) {
      const value = body[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(
          rule.message || `${rule.field} is required`
        );
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push(
            rule.message || `${rule.field} must be a valid email address`
          );
        }
      }

      if (rule.type === "string" && typeof value !== "string") {
        errors.push(
          rule.message || `${rule.field} must be a string`
        );
      }

      if (rule.type === "number" && typeof value !== "number") {
        errors.push(
          rule.message || `${rule.field} must be a number`
        );
      }

      if (
        rule.minLength !== undefined &&
        typeof value === "string" &&
        value.length < rule.minLength
      ) {
        errors.push(
          rule.message ||
            `${rule.field} must be at least ${rule.minLength} characters`
        );
      }

      if (
        rule.maxLength !== undefined &&
        typeof value === "string" &&
        value.length > rule.maxLength
      ) {
        errors.push(
          rule.message ||
            `${rule.field} must be at most ${rule.maxLength} characters`
        );
      }

      if (
        rule.min !== undefined &&
        typeof value === "number" &&
        value < rule.min
      ) {
        errors.push(
          rule.message || `${rule.field} must be at least ${rule.min}`
        );
      }

      if (
        rule.max !== undefined &&
        typeof value === "number" &&
        value > rule.max
      ) {
        errors.push(
          rule.message || `${rule.field} must be at most ${rule.max}`
        );
      }
    }

    if (errors.length > 0) {
      response.status(400).json({ errors });
      return;
    }

    next();
  };
}

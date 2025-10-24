import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Reusable middleware for body validation
const validateResource =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues;
      return res.status(400).json({ message: "Validation error", errors });
    }

    next(); // continue if validation passed
  };

export default validateResource;

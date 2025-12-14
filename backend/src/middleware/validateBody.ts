import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/**
 * Validate request body against a Zod schema.
 */
const validateBody =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues,
      });
    }

    next();
  };

export default validateBody;

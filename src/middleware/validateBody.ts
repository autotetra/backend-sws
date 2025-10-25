import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod"; // ✅ Recommended

const validateBody =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues;
      return res.status(400).json({ message: "Validation error", errors });
    }

    next();
  };

export default validateBody;

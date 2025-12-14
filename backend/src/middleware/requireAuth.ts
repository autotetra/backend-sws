import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { CustomRequest } from "../../types/express/custom";

/**
 * Require authenticated user via JWT cookie.
 * - Verifies token
 * - Attaches user to req.user
 */
const requireAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch {
    // HTTP routes fail closed
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default requireAuth;

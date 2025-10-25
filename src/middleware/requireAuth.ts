import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { CustomRequest } from "../../types/express/custom";

const requireAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById((decoded as any).id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default requireAuth;

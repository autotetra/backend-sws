import { Response, NextFunction } from "express";
import { CustomRequest } from "../../types/express/custom";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
export default requireRole;

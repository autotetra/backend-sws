import { Request } from "express";
import { IUser } from "../../api/models/userModel";

/**
 * Express request extended with authenticated user.
 * Used by auth & permission middleware.
 */
export interface CustomRequest extends Request {
  user?: IUser;
}

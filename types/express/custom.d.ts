import { Request } from "express";
import { UserDocument } from "../models/user.model"; // adjust path if needed

export interface CustomRequest extends Request {
  user?: UserDocument;
}

import { Request } from "express";
import { UserDocument } from "../models/user.model";

export interface CustomRequest extends Request {
  user?: UserDocument;
}

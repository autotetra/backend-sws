import { Request, Response } from "express";
import User from "../models/userModel";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    console.log("Fetched users:", users);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

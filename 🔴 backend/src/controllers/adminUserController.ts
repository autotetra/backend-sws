import { Request, Response } from "express";
import User from "../models/userModel";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUserAsAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, departments } =
      req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    const existinUser = await User.findOne({ email });
    if (existinUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      departments: departments || [],
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

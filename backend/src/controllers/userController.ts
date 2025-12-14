import { Request, Response } from "express";
import User from "../models/userModel";

/**
 * Get all users (Admin only).
 * Password field is excluded from results.
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Create a new user (Admin only).
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, departments } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // hashed by pre-save hook
      role: role || "User",
      departments: departments || [],
    });

    const safeUser = newUser.toObject();
    delete (safeUser as any).password;

    return res.status(201).json({
      message: "User created successfully.",
      user: safeUser,
    });
  } catch (err) {
    console.error("Create user error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * Update user fields (Admin only).
 * Protected fields are ignored.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Protected fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.password;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    Object.assign(user, updates);
    await user.save();

    const safeUser = user.toObject();
    delete (safeUser as any).password;

    return res.status(200).json(safeUser);
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Delete user by ID (Admin only).
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
